package com.aicte.complaints.dto;

import java.time.LocalDateTime;

public class ImportErrorDto {
    private Long id;
    private Long importBatchId;
    private Integer csvRowNumber;
    private String rawData;
    private String errorReason;
    private LocalDateTime createdAt;

    public ImportErrorDto() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getImportBatchId() { return importBatchId; }
    public void setImportBatchId(Long importBatchId) { this.importBatchId = importBatchId; }
    public Integer getCsvRowNumber() { return csvRowNumber; }
    public void setCsvRowNumber(Integer csvRowNumber) { this.csvRowNumber = csvRowNumber; }
    public String getRawData() { return rawData; }
    public void setRawData(String rawData) { this.rawData = rawData; }
    public String getErrorReason() { return errorReason; }
    public void setErrorReason(String errorReason) { this.errorReason = errorReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
