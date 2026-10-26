package com.aicte.complaints.dto;

import java.time.LocalDateTime;
import java.util.List;

public class ImportBatchDto {
    private Long id;
    private String batchId;
    private String filename;
    private Integer totalRows;
    private Integer validRows;
    private Integer importedRows;
    private Integer failedRows;
    private String status;
    private Long importedByUserId;
    private String importedByUserName;
    private LocalDateTime createdAt;
    private List<ImportErrorDto> errors;

    public ImportBatchDto() {}
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBatchId() { return batchId; }
    public void setBatchId(String batchId) { this.batchId = batchId; }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public Integer getTotalRows() { return totalRows; }
    public void setTotalRows(Integer totalRows) { this.totalRows = totalRows; }
    public Integer getValidRows() { return validRows; }
    public void setValidRows(Integer validRows) { this.validRows = validRows; }
    public Integer getImportedRows() { return importedRows; }
    public void setImportedRows(Integer importedRows) { this.importedRows = importedRows; }
    public Integer getFailedRows() { return failedRows; }
    public void setFailedRows(Integer failedRows) { this.failedRows = failedRows; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getImportedByUserId() { return importedByUserId; }
    public void setImportedByUserId(Long importedByUserId) { this.importedByUserId = importedByUserId; }
    public String getImportedByUserName() { return importedByUserName; }
    public void setImportedByUserName(String importedByUserName) { this.importedByUserName = importedByUserName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<ImportErrorDto> getErrors() { return errors; }
    public void setErrors(List<ImportErrorDto> errors) { this.errors = errors; }
}
