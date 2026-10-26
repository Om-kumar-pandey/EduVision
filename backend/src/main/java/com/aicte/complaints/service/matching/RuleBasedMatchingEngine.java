package com.aicte.complaints.service.matching;

import com.aicte.complaints.entity.CaseEntity;
import com.aicte.complaints.entity.Institution;
import org.springframework.stereotype.Component;

import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * AICTE Rule-Based Matching Engine
 * 
 * Evaluates deterministic structured signals:
 * - Verified AICTE Permanent Institution ID
 * - Normalized Institution Name
 * - Grievance Category & Subcategory Compatibility
 * - Title & Issue Domain Keyword Overlap
 * - Temporal Proximity / Incident Date Compatibility
 * - Regulatory & Statutory References (APH, CAS, Act clauses)
 */
@Component
public class RuleBasedMatchingEngine {

    private static final Set<String> STOP_WORDS = Set.of(
            "a", "an", "the", "and", "or", "in", "on", "at", "to", "for", "with", "by", "from",
            "is", "was", "are", "were", "be", "been", "being", "have", "has", "had", "do", "does",
            "did", "shall", "will", "should", "would", "may", "might", "must", "can", "could",
            "it", "its", "of", "as", "about", "against", "between", "into", "through", "during",
            "before", "after", "above", "below", "up", "down", "under", "over", "such", "this",
            "that", "these", "those", "college", "institute", "engineering", "technology", "aicte"
    );

    // Related Category Mappings
    private static final Map<String, Set<String>> RELATED_CATEGORY_GROUPS = new HashMap<>();

    static {
        Set<String> feeGroup = Set.of(
                "capitation fee / overcharging",
                "capitation fee",
                "overcharging",
                "fee regulation breach",
                "caution deposit non-refund",
                "tuition fee irregularity",
                "hostel charges retained unlawfully",
                "arbitrary library caution fee non-refund"
        );
        Set<String> facultyGroup = Set.of(
                "faculty irregularities",
                "faculty salary arrears",
                "faculty cadre ratio deficit",
                "cadre ratio",
                "salary arrears",
                "cas norms breach",
                "unqualified faculty appointments"
        );
        Set<String> infraGroup = Set.of(
                "infrastructure deficit",
                "deficient laboratory infrastructure",
                "computing infrastructure deficit",
                "fire safety clearance non-renewal",
                "library deficit",
                "laboratory equipment deficit"
        );
        Set<String> admissionGroup = Set.of(
                "admission malpractice",
                "unauthorized intake expansion",
                "intake expansion without prior approval",
                "eligibility violation",
                "unauthorized seat allocation"
        );
        Set<String> certGroup = Set.of(
                "certificate withholding",
                "delay in issuance of degree certificate",
                "document retention",
                "retention of original degree certificates",
                "withholding of marksheet"
        );

        registerGroup(feeGroup);
        registerGroup(facultyGroup);
        registerGroup(infraGroup);
        registerGroup(admissionGroup);
        registerGroup(certGroup);
    }

    private static void registerGroup(Set<String> group) {
        for (String cat : group) {
            RELATED_CATEGORY_GROUPS.put(cat, group);
        }
    }

    public static class RuleEvaluationResult {
        private double totalScore; // 0.0 to 100.0
        private double institutionScore; // 0 to 25
        private double categoryScore; // 0 to 20
        private double keywordScore; // 0 to 15
        private double temporalScore; // 0 to 10
        private boolean permanentIdMatch;
        private boolean institutionNameMatch;
        private boolean categoryExactMatch;
        private boolean categoryRelatedMatch;
        private Set<String> matchedKeywords = new LinkedHashSet<>();
        private List<String> conflictingSignals = new ArrayList<>();
        private List<String> missingSignals = new ArrayList<>();
        private List<String> regulatoryReferences = new ArrayList<>();
        private boolean inconclusive;

        public double getTotalScore() { return totalScore; }
        public void setTotalScore(double totalScore) { this.totalScore = totalScore; }
        public double getInstitutionScore() { return institutionScore; }
        public void setInstitutionScore(double institutionScore) { this.institutionScore = institutionScore; }
        public double getCategoryScore() { return categoryScore; }
        public void setCategoryScore(double categoryScore) { this.categoryScore = categoryScore; }
        public double getKeywordScore() { return keywordScore; }
        public void setKeywordScore(double keywordScore) { this.keywordScore = keywordScore; }
        public double getTemporalScore() { return temporalScore; }
        public void setTemporalScore(double temporalScore) { this.temporalScore = temporalScore; }
        public boolean isPermanentIdMatch() { return permanentIdMatch; }
        public void setPermanentIdMatch(boolean permanentIdMatch) { this.permanentIdMatch = permanentIdMatch; }
        public boolean isInstitutionNameMatch() { return institutionNameMatch; }
        public void setInstitutionNameMatch(boolean institutionNameMatch) { this.institutionNameMatch = institutionNameMatch; }
        public boolean isCategoryExactMatch() { return categoryExactMatch; }
        public void setCategoryExactMatch(boolean categoryExactMatch) { this.categoryExactMatch = categoryExactMatch; }
        public boolean isCategoryRelatedMatch() { return categoryRelatedMatch; }
        public void setCategoryRelatedMatch(boolean categoryRelatedMatch) { this.categoryRelatedMatch = categoryRelatedMatch; }
        public Set<String> getMatchedKeywords() { return matchedKeywords; }
        public void setMatchedKeywords(Set<String> matchedKeywords) { this.matchedKeywords = matchedKeywords; }
        public List<String> getConflictingSignals() { return conflictingSignals; }
        public void setConflictingSignals(List<String> conflictingSignals) { this.conflictingSignals = conflictingSignals; }
        public List<String> getMissingSignals() { return missingSignals; }
        public void setMissingSignals(List<String> missingSignals) { this.missingSignals = missingSignals; }
        public List<String> getRegulatoryReferences() { return regulatoryReferences; }
        public void setRegulatoryReferences(List<String> regulatoryReferences) { this.regulatoryReferences = regulatoryReferences; }
        public boolean isInconclusive() { return inconclusive; }
        public void setInconclusive(boolean inconclusive) { this.inconclusive = inconclusive; }
    }

    public RuleEvaluationResult evaluate(CaseEntity case1, CaseEntity case2) {
        RuleEvaluationResult res = new RuleEvaluationResult();

        if (case1 == null || case2 == null) {
            res.setInconclusive(true);
            res.getMissingSignals().add("One or both cases are null");
            return res;
        }

        // 1. Institution Identity Evaluation (Weight: max 25 points)
        evaluateInstitution(case1, case2, res);

        // 2. Category & Subcategory Compatibility (Weight: max 20 points)
        evaluateCategory(case1, case2, res);

        // 3. Keyword & Term Overlap (Weight: max 15 points)
        evaluateKeywords(case1, case2, res);

        // 4. Temporal Proximity & Incident Date (Weight: max 10 points)
        evaluateTemporal(case1, case2, res);

        // 5. Regulatory Reference Extraction
        evaluateRegulatoryReferences(case1, case2, res);

        // Missing information checks
        if (case1.getDescription() == null || case1.getDescription().trim().length() < 15) {
            res.getMissingSignals().add("Case " + case1.getCaseNumber() + " has minimal or missing description");
        }
        if (case2.getDescription() == null || case2.getDescription().trim().length() < 15) {
            res.getMissingSignals().add("Case " + case2.getCaseNumber() + " has minimal or missing description");
        }

        // Check if evidence is inconclusive: only when descriptive text is truly absent or institutions are undefined
        boolean emptyDescriptions = (case1.getDescription() == null || case1.getDescription().trim().isEmpty())
                && (case2.getDescription() == null || case2.getDescription().trim().isEmpty());
        boolean missingInstitutions = (case1.getInstitution() == null || case2.getInstitution() == null);
        if (emptyDescriptions || missingInstitutions) {
            res.setInconclusive(true);
        }

        // Sum components
        double total = res.getInstitutionScore() + res.getCategoryScore() + res.getKeywordScore() + res.getTemporalScore();
        res.setTotalScore(Math.min(70.0, Math.max(0.0, total))); // Rule engine produces up to 70 base pts (Semantic adds up to 30)

        return res;
    }

    private void evaluateInstitution(CaseEntity case1, CaseEntity case2, RuleEvaluationResult res) {
        Institution inst1 = case1.getInstitution();
        Institution inst2 = case2.getInstitution();

        if (inst1 == null || inst2 == null) {
            res.getMissingSignals().add("Institution metadata missing for one or both cases");
            return;
        }

        String pid1 = inst1.getPermanentId() != null ? inst1.getPermanentId().trim().toUpperCase() : "";
        String pid2 = inst2.getPermanentId() != null ? inst2.getPermanentId().trim().toUpperCase() : "";

        if (!pid1.isEmpty() && !pid2.isEmpty()) {
            if (pid1.equalsIgnoreCase(pid2)) {
                res.setPermanentIdMatch(true);
                res.setInstitutionNameMatch(true);
                res.setInstitutionScore(25.0); // Full 25 points for verified Permanent ID match
            } else {
                res.setPermanentIdMatch(false);
                res.getConflictingSignals().add("Different AICTE Permanent IDs: '" + pid1 + "' vs '" + pid2 + "'");
                // Check if names are very similar despite different IDs
                double nameSim = calculateStringSimilarity(normalizeInstitutionName(inst1.getName()), normalizeInstitutionName(inst2.getName()));
                if (nameSim > 0.85) {
                    res.setInstitutionNameMatch(true);
                    res.setInstitutionScore(8.0);
                    res.getConflictingSignals().add("Institutions have matching names but different Permanent IDs (Possible branch or satellite campus)");
                } else {
                    res.setInstitutionNameMatch(false);
                    res.setInstitutionScore(0.0);
                }
            }
        } else {
            // Permanent ID missing on one side, fallback to normalized name
            res.getMissingSignals().add("Permanent AICTE ID missing on one or both institutions");
            double nameSim = calculateStringSimilarity(normalizeInstitutionName(inst1.getName()), normalizeInstitutionName(inst2.getName()));
            if (nameSim >= 0.85) {
                res.setInstitutionNameMatch(true);
                res.setInstitutionScore(18.0);
            } else if (nameSim >= 0.65) {
                res.setInstitutionNameMatch(true);
                res.setInstitutionScore(10.0);
            } else {
                res.setInstitutionNameMatch(false);
                res.setInstitutionScore(0.0);
                res.getConflictingSignals().add("Different institution names: '" + inst1.getName() + "' vs '" + inst2.getName() + "'");
            }
        }
    }

    private void evaluateCategory(CaseEntity case1, CaseEntity case2, RuleEvaluationResult res) {
        String cat1 = case1.getCategory() != null ? case1.getCategory().trim().toLowerCase() : "";
        String cat2 = case2.getCategory() != null ? case2.getCategory().trim().toLowerCase() : "";

        if (cat1.isEmpty() || cat2.isEmpty()) {
            res.getMissingSignals().add("Complaint category missing on one or both cases");
            return;
        }

        if (cat1.equalsIgnoreCase(cat2)) {
            res.setCategoryExactMatch(true);
            res.setCategoryRelatedMatch(true);
            res.setCategoryScore(20.0); // Full 20 points
        } else {
            Set<String> group1 = RELATED_CATEGORY_GROUPS.get(cat1);
            if (group1 != null && group1.contains(cat2)) {
                res.setCategoryRelatedMatch(true);
                res.setCategoryScore(14.0); // Related regulatory issue
            } else {
                res.setCategoryExactMatch(false);
                res.setCategoryRelatedMatch(false);
                res.setCategoryScore(2.0); // Distinct categories
                res.getConflictingSignals().add("Disparate complaint categories: '" + case1.getCategory() + "' vs '" + case2.getCategory() + "'");
            }
        }
    }

    private void evaluateKeywords(CaseEntity case1, CaseEntity case2, RuleEvaluationResult res) {
        String text1 = (case1.getTitle() != null ? case1.getTitle() : "") + " " + (case1.getDescription() != null ? case1.getDescription() : "");
        String text2 = (case2.getTitle() != null ? case2.getTitle() : "") + " " + (case2.getDescription() != null ? case2.getDescription() : "");

        Set<String> tokens1 = extractKeywords(text1);
        Set<String> tokens2 = extractKeywords(text2);

        Set<String> intersection = new HashSet<>(tokens1);
        intersection.retainAll(tokens2);

        Set<String> union = new HashSet<>(tokens1);
        union.addAll(tokens2);

        res.setMatchedKeywords(intersection);

        if (!union.isEmpty()) {
            double jaccard = (double) intersection.size() / union.size();
            // Scale jaccard to 15 points
            double score = Math.min(15.0, jaccard * 25.0); // Jaccard > 0.6 yields full 15 points
            res.setKeywordScore(score);
        } else {
            res.setKeywordScore(0.0);
        }
    }

    private void evaluateTemporal(CaseEntity case1, CaseEntity case2, RuleEvaluationResult res) {
        if (case1.getReceiptDate() == null || case2.getReceiptDate() == null) {
            res.getMissingSignals().add("Receipt date missing on one or both cases");
            res.setTemporalScore(5.0); // Neutral default
            return;
        }

        long daysDiff = Math.abs(ChronoUnit.DAYS.between(case1.getReceiptDate(), case2.getReceiptDate()));

        if (daysDiff <= 30) {
            res.setTemporalScore(10.0); // High temporal proximity (within same month)
        } else if (daysDiff <= 90) {
            res.setTemporalScore(8.0);  // Same quarter
        } else if (daysDiff <= 180) {
            res.setTemporalScore(5.0);  // Same semester / 6 months
        } else if (daysDiff <= 365) {
            res.setTemporalScore(3.0);  // Same academic year
        } else {
            res.setTemporalScore(1.0);  // Greater than a year apart
            res.getConflictingSignals().add("Complaints submitted " + daysDiff + " days apart");
        }
    }

    private void evaluateRegulatoryReferences(CaseEntity case1, CaseEntity case2, RuleEvaluationResult res) {
        Pattern pattern = Pattern.compile("(?i)(APH[\\s\\-_0-9\\.]+|clause[\\s0-9\\.]+|FIR[\\s0-9/]+|W\\.P\\.[\\s0-9/]+|SLP[\\s0-9/]+|AICTE[\\s\\-_0-9]+)");
        Set<String> refs1 = extractRegexMatches((case1.getTitle() + " " + case1.getDescription()), pattern);
        Set<String> refs2 = extractRegexMatches((case2.getTitle() + " " + case2.getDescription()), pattern);

        Set<String> commonRefs = new HashSet<>(refs1);
        commonRefs.retainAll(refs2);

        if (!commonRefs.isEmpty()) {
            res.getRegulatoryReferences().addAll(commonRefs);
            // Boost temporal/regulatory score if common regulatory/legal clause found
            res.setTemporalScore(Math.min(10.0, res.getTemporalScore() + 2.0));
        }
    }

    private Set<String> extractRegexMatches(String text, Pattern pattern) {
        Set<String> matches = new HashSet<>();
        if (text == null) return matches;
        Matcher m = pattern.matcher(text);
        while (m.find()) {
            matches.add(m.group().trim().toUpperCase());
        }
        return matches;
    }

    public static String normalizeInstitutionName(String name) {
        if (name == null) return "";
        return name.toLowerCase()
                .replaceAll("(?i)\\b(college|institute|institution|technology|engineering|polytechnic|academy|university|of|for|the|and|&)\\b", "")
                .replaceAll("[^a-z0-9]", "")
                .trim();
    }

    public static Set<String> extractKeywords(String text) {
        if (text == null) return Collections.emptySet();
        return Arrays.stream(text.toLowerCase().split("[^a-z0-9]+"))
                .filter(w -> w.length() > 2)
                .filter(w -> !STOP_WORDS.contains(w))
                .collect(Collectors.toSet());
    }

    public static double calculateStringSimilarity(String s1, String s2) {
        if (s1 == null || s2 == null) return 0.0;
        if (s1.equalsIgnoreCase(s2)) return 1.0;
        if (s1.isEmpty() || s2.isEmpty()) return 0.0;

        int maxLen = Math.max(s1.length(), s2.length());
        int distance = levenshteinDistance(s1, s2);
        return 1.0 - ((double) distance / maxLen);
    }

    private static int levenshteinDistance(String s1, String s2) {
        int[] costs = new int[s2.length() + 1];
        for (int j = 0; j < costs.length; j++) costs[j] = j;
        for (int i = 1; i <= s1.length(); i++) {
            costs[0] = i;
            int nw = i - 1;
            for (int j = 1; j <= s2.length(); j++) {
                int cj = Math.min(1 + Math.min(costs[j], costs[j - 1]),
                        s1.charAt(i - 1) == s2.charAt(j - 1) ? nw : nw + 1);
                nw = costs[j];
                costs[j] = cj;
            }
        }
        return costs[s2.length()];
    }
}
