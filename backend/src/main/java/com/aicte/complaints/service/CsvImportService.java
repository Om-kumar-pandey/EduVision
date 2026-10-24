package com.aicte.complaints.service;

import com.aicte.complaints.dto.*;
import com.aicte.complaints.entity.*;
import com.aicte.complaints.exception.BadRequestException;
import com.aicte.complaints.exception.ResourceNotFoundException;
import com.aicte.complaints.repository.*;
import com.aicte.complaints.security.UserPrincipal;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CsvImportService {

    private final InstitutionRepository institutionRepository;
    private final BureauRepository bureauRepository;
    private final CaseRepository caseRepository;
    private final ImportBatchRepository importBatchRepository;
    private final ImportErrorRepository importErrorRepository;
    private final UserRepository userRepository;
    private final CaseActionRepository caseActionRepository;
    private final CaseService caseService;
    private final OverlapService overlapService;
    private final AuditLogService auditLogService;

    public CsvImportService(InstitutionRepository institutionRepository,
                            BureauRepository bureauRepository,
                            CaseRepository caseRepository,
                            ImportBatchRepository importBatchRepository,
                            ImportErrorRepository importErrorRepository,
                            UserRepository userRepository,
                            CaseActionRepository caseActionRepository,
                            CaseService caseService,
                            OverlapService overlapService,
                            AuditLogService auditLogService) {
        this.institutionRepository = institutionRepository;
        this.bureauRepository = bureauRepository;
        this.caseRepository = caseRepository;
        this.importBatchRepository = importBatchRepository;
        this.importErrorRepository = importErrorRepository;
        this.userRepository = userRepository;
        this.caseActionRepository = caseActionRepository;
        this.caseService = caseService;
        this.overlapService = overlapService;
        this.auditLogService = auditLogService;
    }

    public CsvPreviewResponse previewCsv(MultipartFile file) {
        validateFile(file);

        List<CsvPreviewRow> previewRows = new ArrayList<>();
        List<String> globalErrors = new ArrayList<>();
        int validCount = 0;
        int invalidCount = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).setIgnoreHeaderCase(true).setTrim(true).build())) {

            Map<String, Integer> headerMap = csvParser.getHeaderMap();
            if (!headerMap.containsKey("permanent_id") || !headerMap.containsKey("bureau_code") || !headerMap.containsKey("title")) {
                throw new BadRequestException("CSV header must contain at least 'permanent_id', 'bureau_code', and 'title' columns.");
            }

            int rowNumber = 1;
            Set<String> seenRecordsInBatch = new HashSet<>();

            for (CSVRecord record : csvParser) {
                rowNumber++;
                CsvPreviewRow row = new CsvPreviewRow();
                row.setRowNumber(rowNumber);

                String permanentId = getRecordValue(record, "permanent_id");
                String bureauCode = getRecordValue(record, "bureau_code");
                String title = getRecordValue(record, "title");
                String category = getRecordValue(record, "category");
                String priority = getRecordValue(record, "priority");
                String receiptDate = getRecordValue(record, "receipt_date");

                row.setPermanentId(permanentId);
                row.setBureauCode(bureauCode);
                row.setTitle(title);
                row.setCategory(category != null ? category : "General Grievance");
                row.setPriority(priority != null ? priority : "MEDIUM");
                row.setReceiptDate(receiptDate);

                StringBuilder errorBuilder = new StringBuilder();

                // 1. Validate Permanent ID
                if (permanentId == null || permanentId.trim().isEmpty()) {
                    errorBuilder.append("Permanent ID is required. ");
                } else {
                    Optional<Institution> instOpt = institutionRepository.findByPermanentId(permanentId.trim());
                    if (instOpt.isEmpty()) {
                        errorBuilder.append("Institution Permanent ID '").append(permanentId).append("' not found in database. ");
                    } else {
                        row.setInstitutionName(instOpt.get().getName());
                    }
                }

                // 2. Validate Bureau Code
                if (bureauCode == null || bureauCode.trim().isEmpty()) {
                    errorBuilder.append("Bureau code is required. ");
                } else {
                    Optional<Bureau> bureauOpt = bureauRepository.findByCodeIgnoreCase(bureauCode.trim());
                    if (bureauOpt.isEmpty() || !Boolean.TRUE.equals(bureauOpt.get().getIsActive())) {
                        errorBuilder.append("Bureau code '").append(bureauCode).append("' is invalid or inactive. ");
                    }
                }

                // 3. Validate Title
                if (title == null || title.trim().isEmpty()) {
                    errorBuilder.append("Complaint title is required. ");
                }

                // 4. Duplicate Check within batch
                String batchKey = (permanentId != null ? permanentId.trim() : "") + "|" +
                                  (bureauCode != null ? bureauCode.trim().toUpperCase() : "") + "|" +
                                  (title != null ? title.trim().toLowerCase() : "");
                if (seenRecordsInBatch.contains(batchKey)) {
                    errorBuilder.append("Duplicate record identified within the uploaded CSV file. ");
                } else {
                    seenRecordsInBatch.add(batchKey);
                }

                if (errorBuilder.length() > 0) {
                    row.setValid(false);
                    row.setErrorReason(errorBuilder.toString().trim());
                    invalidCount++;
                } else {
                    row.setValid(true);
                    validCount++;
                }

                previewRows.add(row);
            }

        } catch (BadRequestException bre) {
            throw bre;
        } catch (Exception ex) {
            throw new BadRequestException("Failed to parse CSV file: " + ex.getMessage());
        }

        CsvPreviewResponse response = new CsvPreviewResponse();
        response.setFilename(file.getOriginalFilename());
        response.setTotalRows(previewRows.size());
        response.setValidRows(validCount);
        response.setInvalidRows(invalidCount);
        response.setPreviewRows(previewRows);
        response.setGlobalErrors(globalErrors);
        return response;
    }

    @Transactional
    public ImportBatchDto importCsv(MultipartFile file, UserPrincipal adminPrincipal) {
        validateFile(file);

        User adminUser = (adminPrincipal != null) ? userRepository.findById(adminPrincipal.getId()).orElse(null) : null;
        if (adminUser == null) {
            throw new BadRequestException("Authenticated administrator is required for bulk CSV imports.");
        }

        String batchId = generateBatchId();
        ImportBatch batch = new ImportBatch();
        batch.setBatchId(batchId);
        batch.setFilename(file.getOriginalFilename() != null ? file.getOriginalFilename() : "import.csv");
        batch.setStatus("PROCESSING");
        batch.setImportedBy(adminUser);
        ImportBatch savedBatch = importBatchRepository.save(batch);

        List<ImportError> errors = new ArrayList<>();
        List<CaseEntity> newlyCreatedCases = new ArrayList<>();
        int validRows = 0;
        int failedRows = 0;
        int totalRows = 0;
        int rowNumber = 1;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).setIgnoreHeaderCase(true).setTrim(true).build())) {

            Set<String> seenKeys = new HashSet<>();

            for (CSVRecord record : csvParser) {
                rowNumber++;
                totalRows++;

                String permanentId = getRecordValue(record, "permanent_id");
                String bureauCode = getRecordValue(record, "bureau_code");
                String title = getRecordValue(record, "title");
                String category = getRecordValue(record, "category");
                String priority = getRecordValue(record, "priority");
                String description = getRecordValue(record, "description");
                String sourceCaseId = getRecordValue(record, "source_case_id");

                StringBuilder errorReason = new StringBuilder();
                Institution inst = null;
                Bureau bureau = null;

                if (permanentId == null || permanentId.trim().isEmpty()) {
                    errorReason.append("Permanent ID is missing. ");
                } else {
                    Optional<Institution> instOpt = institutionRepository.findByPermanentId(permanentId.trim());
                    if (instOpt.isEmpty()) {
                        errorReason.append("Permanent ID '").append(permanentId).append("' not recognized. ");
                    } else {
                        inst = instOpt.get();
                    }
                }

                if (bureauCode == null || bureauCode.trim().isEmpty()) {
                    errorReason.append("Bureau code is missing. ");
                } else {
                    Optional<Bureau> bureauOpt = bureauRepository.findByCodeIgnoreCase(bureauCode.trim());
                    if (bureauOpt.isEmpty() || !Boolean.TRUE.equals(bureauOpt.get().getIsActive())) {
                        errorReason.append("Bureau code '").append(bureauCode).append("' is invalid or inactive. ");
                    } else {
                        bureau = bureauOpt.get();
                    }
                }

                if (title == null || title.trim().isEmpty()) {
                    errorReason.append("Title is required. ");
                }

                String duplicateKey = (permanentId != null ? permanentId.trim() : "") + "|" +
                                      (bureauCode != null ? bureauCode.trim().toUpperCase() : "") + "|" +
                                      (title != null ? title.trim().toLowerCase() : "");
                if (seenKeys.contains(duplicateKey)) {
                    errorReason.append("Duplicate row detected in batch. ");
                } else {
                    seenKeys.add(duplicateKey);
                }

                if (errorReason.length() > 0) {
                    failedRows++;
                    ImportError err = new ImportError(savedBatch, rowNumber, record.toString(), errorReason.toString().trim());
                    errors.add(err);
                } else {
                    validRows++;
                    CaseEntity c = new CaseEntity();
                    c.setCaseNumber(caseService.generateUniqueCaseNumber());
                    c.setSourceCaseId(sourceCaseId != null ? sourceCaseId.trim() : "CSV-" + batchId + "-R" + rowNumber);
                    c.setInstitution(inst);
                    c.setBureau(bureau);
                    c.setTitle(title.trim());
                    c.setDescription(description != null && !description.trim().isEmpty() ? description.trim() : title.trim());
                    c.setCategory(category != null && !category.trim().isEmpty() ? category.trim() : "Bulk Import");
                    c.setPriority(priority != null && !priority.trim().isEmpty() ? priority.toUpperCase() : "MEDIUM");
                    c.setStatus("RECEIVED");
                    c.setReceiptDate(LocalDateTime.now());
                    c.setExpectedDisposalDate(c.getReceiptDate().plusDays(45));
                    c.setCreatedBy(adminUser);

                    CaseEntity savedCase = caseRepository.save(c);

                    CaseAction action = new CaseAction(
                            savedCase,
                            adminUser,
                            "STATUS_CHANGE",
                            null,
                            "RECEIVED",
                            "Case created via validated bulk CSV import batch " + batchId + " (Row " + rowNumber + ")."
                    );
                    caseActionRepository.save(action);
                    newlyCreatedCases.add(savedCase);
                }
            }

            if (!errors.isEmpty()) {
                importErrorRepository.saveAll(errors);
            }

            savedBatch.setTotalRows(totalRows);
            savedBatch.setValidRows(validRows);
            savedBatch.setImportedRows(validRows);
            savedBatch.setFailedRows(failedRows);
            savedBatch.setStatus(failedRows == 0 ? "COMPLETED" : (validRows > 0 ? "COMPLETED" : "FAILED"));
            importBatchRepository.save(savedBatch);

            // Trigger cross-bureau overlap detection on all imported valid cases
            for (CaseEntity newCase : newlyCreatedCases) {
                overlapService.checkForOverlaps(newCase);
            }

            auditLogService.logAction(
                    adminUser,
                    adminUser.getEmail(),
                    "BULK_CSV_IMPORT",
                    "IMPORT_BATCH",
                    batchId,
                    "CSV import completed: " + validRows + " imported, " + failedRows + " errors.",
                    "127.0.0.1"
            );

        } catch (Exception ex) {
            savedBatch.setStatus("FAILED");
            importBatchRepository.save(savedBatch);
            throw new BadRequestException("Error processing CSV import: " + ex.getMessage());
        }

        return mapBatchToDto(savedBatch, errors);
    }

    @Transactional(readOnly = true)
    public PagedResponse<ImportBatchDto> getImportBatches(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ImportBatch> batchPage = importBatchRepository.findAllByOrderByCreatedAtDesc(pageable);

        List<ImportBatchDto> dtos = batchPage.getContent().stream()
                .map(b -> mapBatchToDto(b, null))
                .collect(Collectors.toList());

        return new PagedResponse<>(
                dtos,
                batchPage.getNumber(),
                batchPage.getSize(),
                batchPage.getTotalElements(),
                batchPage.getTotalPages(),
                batchPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    public ImportBatchDto getBatchById(Long id) {
        ImportBatch batch = importBatchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Import batch not found with ID: " + id));

        List<ImportError> errors = importErrorRepository.findByImportBatchIdOrderByCsvRowNumberAsc(id);
        return mapBatchToDto(batch, errors);
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded CSV file cannot be empty.");
        }
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.toLowerCase().endsWith(".csv")) {
            throw new BadRequestException("Only valid .csv files are supported for bulk imports.");
        }
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new BadRequestException("File size exceeds 10MB maximum limit.");
        }
    }

    private String getRecordValue(CSVRecord record, String column) {
        if (record.isMapped(column)) {
            String val = record.get(column);
            return val != null ? val.trim() : null;
        }
        return null;
    }

    private synchronized String generateBatchId() {
        String dateStr = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        long count = importBatchRepository.count() + 1;
        return String.format("BATCH-%s-%03d", dateStr, count);
    }

    public ImportBatchDto mapBatchToDto(ImportBatch b, List<ImportError> errors) {
        ImportBatchDto dto = new ImportBatchDto();
        dto.setId(b.getId());
        dto.setBatchId(b.getBatchId());
        dto.setFilename(b.getFilename());
        dto.setTotalRows(b.getTotalRows());
        dto.setValidRows(b.getValidRows());
        dto.setImportedRows(b.getImportedRows());
        dto.setFailedRows(b.getFailedRows());
        dto.setStatus(b.getStatus());
        if (b.getImportedBy() != null) {
            dto.setImportedByUserId(b.getImportedBy().getId());
            dto.setImportedByUserName(b.getImportedBy().getFullName());
        }
        dto.setCreatedAt(b.getCreatedAt());

        if (errors != null) {
            dto.setErrors(errors.stream().map(e -> {
                ImportErrorDto ed = new ImportErrorDto();
                ed.setId(e.getId());
                ed.setImportBatchId(b.getId());
                ed.setCsvRowNumber(e.getCsvRowNumber());
                ed.setRawData(e.getRawData());
                ed.setErrorReason(e.getErrorReason());
                ed.setCreatedAt(e.getCreatedAt());
                return ed;
            }).collect(Collectors.toList()));
        }
        return dto;
    }
}
