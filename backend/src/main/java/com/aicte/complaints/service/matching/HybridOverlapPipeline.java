package com.aicte.complaints.service.matching;

import com.aicte.complaints.entity.CaseEntity;
import com.aicte.complaints.entity.OverlapAlert;
import com.aicte.complaints.repository.CaseRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

/**
 * AICTE Hybrid Overlapping Detection Pipeline
 * 
 * Orchestrates candidate retrieval, rule-based matching, semantic similarity,
 * weighted scoring, explainability generation, and idempotent pair normalization.
 */
@Service
public class HybridOverlapPipeline {

    private static final Logger log = LoggerFactory.getLogger(HybridOverlapPipeline.class);

    private final RuleBasedMatchingEngine ruleEngine;
    private final SemanticSimilarityEngine semanticEngine;
    private final CaseRepository caseRepository;
    private final ObjectMapper objectMapper;

    public HybridOverlapPipeline(RuleBasedMatchingEngine ruleEngine,
                                 SemanticSimilarityEngine semanticEngine,
                                 CaseRepository caseRepository,
                                 ObjectMapper objectMapper) {
        this.ruleEngine = ruleEngine;
        this.semanticEngine = semanticEngine;
        this.caseRepository = caseRepository;
        this.objectMapper = objectMapper;
    }

    public static class MatchResult {
        private CaseEntity case1;
        private CaseEntity case2;
        private double totalScore; // 0.0 to 100.0
        private double ruleScore;
        private double semanticScore;
        private String reviewBand; // HIGH, MEDIUM, LOW, INCONCLUSIVE
        private String classification; // EXACT_DUPLICATE, POTENTIAL_DUPLICATE, RELATED_MATTER, UNRELATED, INCONCLUSIVE
        private String explanationJson;
        private boolean shouldAlert;

        public CaseEntity getCase1() { return case1; }
        public void setCase1(CaseEntity case1) { this.case1 = case1; }
        public CaseEntity getCase2() { return case2; }
        public void setCase2(CaseEntity case2) { this.case2 = case2; }
        public double getTotalScore() { return totalScore; }
        public void setTotalScore(double totalScore) { this.totalScore = totalScore; }
        public double getRuleScore() { return ruleScore; }
        public void setRuleScore(double ruleScore) { this.ruleScore = ruleScore; }
        public double getSemanticScore() { return semanticScore; }
        public void setSemanticScore(double semanticScore) { this.semanticScore = semanticScore; }
        public String getReviewBand() { return reviewBand; }
        public void setReviewBand(String reviewBand) { this.reviewBand = reviewBand; }
        public String getClassification() { return classification; }
        public void setClassification(String classification) { this.classification = classification; }
        public String getExplanationJson() { return explanationJson; }
        public void setExplanationJson(String explanationJson) { this.explanationJson = explanationJson; }
        public boolean isShouldAlert() { return shouldAlert; }
        public void setShouldAlert(boolean shouldAlert) { this.shouldAlert = shouldAlert; }
    }

    /**
     * Retrieve candidates and analyze overlaps for a given case.
     */
    public List<MatchResult> analyzeCaseForOverlaps(CaseEntity targetCase) {
        List<MatchResult> results = new ArrayList<>();
        if (targetCase == null || targetCase.getInstitution() == null) {
            return results;
        }

        // 1. Retrieve Candidate Shortlist
        // Includes: Cases for the same institution (cross-bureau or same bureau) + cases with similar categories
        List<CaseEntity> candidates = retrieveCandidates(targetCase);

        for (CaseEntity candidate : candidates) {
            if (candidate.getId().equals(targetCase.getId())) {
                continue;
            }

            MatchResult match = compareCasePair(targetCase, candidate);
            // Alert on Medium (50+) and High (80+), or Inconclusive if same institution
            if (match.isShouldAlert()) {
                results.add(match);
            }
        }

        return results;
    }

    /**
     * Compare any two cases directly and generate an explainable MatchResult.
     */
    public MatchResult compareCasePair(CaseEntity cA, CaseEntity cB) {
        // Enforce canonical pair order: case1.id < case2.id
        CaseEntity case1 = cA.getId() != null && cB.getId() != null && cA.getId() < cB.getId() ? cA : cB;
        CaseEntity case2 = case1 == cA ? cB : cA;

        MatchResult result = new MatchResult();
        result.setCase1(case1);
        result.setCase2(case2);

        // 1. Rule-based Evaluation (produces up to 70 pts)
        RuleBasedMatchingEngine.RuleEvaluationResult ruleRes = ruleEngine.evaluate(case1, case2);

        // 2. Semantic Similarity Evaluation (produces up to 30 pts)
        String desc1 = (case1.getTitle() != null ? case1.getTitle() : "") + ". " + (case1.getDescription() != null ? case1.getDescription() : "");
        String desc2 = (case2.getTitle() != null ? case2.getTitle() : "") + ". " + (case2.getDescription() != null ? case2.getDescription() : "");
        SemanticSimilarityEngine.SemanticEvaluationResult semRes = semanticEngine.compareTexts(desc1, desc2);

        // 3. Combine Scores
        double combined = ruleRes.getTotalScore() + semRes.getSemanticScore();

        // Contradictory Evidence Penalties:
        // If institutions are completely different (different permanent ID and low name similarity),
        // cap the maximum similarity score at 45.0 to prevent false duplicate declaration.
        if (!ruleRes.isPermanentIdMatch() && !ruleRes.isInstitutionNameMatch()) {
            combined = Math.min(30.0, combined);
            ruleRes.getConflictingSignals().add("Contradictory Institutions: Cannot be marked duplicate across unrelated institutions");
        }

        double finalScore = Math.round(Math.min(100.0, Math.max(0.0, combined)) * 10.0) / 10.0;
        result.setTotalScore(finalScore);
        result.setRuleScore(Math.round(ruleRes.getTotalScore() * 10.0) / 10.0);
        result.setSemanticScore(Math.round(semRes.getSemanticScore() * 10.0) / 10.0);

        // 4. Assign Review Band & Classification
        if (ruleRes.isInconclusive()) {
            result.setReviewBand("INCONCLUSIVE");
            result.setClassification("INCONCLUSIVE");
            result.setShouldAlert(ruleRes.isPermanentIdMatch()); // Alert for review if same institution has inconclusive data
        } else if (!ruleRes.isPermanentIdMatch() && !ruleRes.isInstitutionNameMatch()) {
            result.setReviewBand("LOW");
            result.setClassification("UNRELATED");
            result.setShouldAlert(false);
        } else if (finalScore >= 70.0) {
            result.setReviewBand("HIGH");
            result.setClassification(ruleRes.isPermanentIdMatch() && ruleRes.isCategoryExactMatch() ? "EXACT_DUPLICATE" : "POTENTIAL_DUPLICATE");
            result.setShouldAlert(true);
        } else if (finalScore >= 50.0) {
            result.setReviewBand("MEDIUM");
            result.setClassification("RELATED_MATTER");
            result.setShouldAlert(true);
        } else if (ruleRes.isPermanentIdMatch() && case1.getBureau() != null && case2.getBureau() != null && !case1.getBureau().getId().equals(case2.getBureau().getId())) {
            // Cross-bureau inquiries on same technical institution: Alert for supervisory oversight & coordination
            result.setReviewBand("MEDIUM");
            result.setClassification("RELATED_MATTER");
            result.setShouldAlert(true);
        } else {
            result.setReviewBand("LOW");
            result.setClassification("UNRELATED");
            result.setShouldAlert(false);
        }

        // 5. Build Explainability Payload
        Map<String, Object> explanation = new LinkedHashMap<>();
        explanation.put("combinedScore", finalScore);
        explanation.put("reviewBand", result.getReviewBand());
        explanation.put("classification", result.getClassification());
        explanation.put("matchingVersion", "HYBRID-V2.1-TFIDF-COSINE");
        explanation.put("analysisTimestamp", LocalDateTime.now().toString());

        Map<String, Object> scoreBreakdown = new LinkedHashMap<>();
        scoreBreakdown.put("institutionScore", ruleRes.getInstitutionScore()); // max 25
        scoreBreakdown.put("categoryScore", ruleRes.getCategoryScore());       // max 20
        scoreBreakdown.put("keywordScore", ruleRes.getKeywordScore());         // max 15
        scoreBreakdown.put("semanticScore", semRes.getSemanticScore());        // max 30
        scoreBreakdown.put("temporalScore", ruleRes.getTemporalScore());       // max 10
        scoreBreakdown.put("totalScore", finalScore);
        explanation.put("scoreBreakdown", scoreBreakdown);

        Map<String, Object> semanticDetails = new LinkedHashMap<>();
        semanticDetails.put("cosineSimilarity", semRes.getCosineSimilarity());
        semanticDetails.put("conceptualJaccard", semRes.getConceptualJaccard());
        semanticDetails.put("sharedConcepts", semRes.getSharedConcepts());
        explanation.put("semanticDetails", semanticDetails);

        explanation.put("matchedKeywords", ruleRes.getMatchedKeywords());
        explanation.put("regulatoryReferences", ruleRes.getRegulatoryReferences());
        explanation.put("conflictingSignals", ruleRes.getConflictingSignals());
        explanation.put("missingSignals", ruleRes.getMissingSignals());
        explanation.put("permanentIdMatch", ruleRes.isPermanentIdMatch());
        explanation.put("institutionNameMatch", ruleRes.isInstitutionNameMatch());
        explanation.put("categoryExactMatch", ruleRes.isCategoryExactMatch());
        explanation.put("categoryRelatedMatch", ruleRes.isCategoryRelatedMatch());

        try {
            result.setExplanationJson(objectMapper.writeValueAsString(explanation));
        } catch (Exception e) {
            log.error("Failed to serialize match explanation to JSON", e);
            result.setExplanationJson("{}");
        }

        return result;
    }

    private List<CaseEntity> retrieveCandidates(CaseEntity targetCase) {
        Long instId = targetCase.getInstitution().getId();
        // Candidate query: cases from same institution, not closed/disposed > 180 days ago
        List<CaseEntity> list = caseRepository.findByInstitutionId(instId);
        if (list == null) list = Collections.emptyList();
        return list;
    }
}
