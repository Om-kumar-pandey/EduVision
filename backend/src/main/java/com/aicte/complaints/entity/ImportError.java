package com.aicte.complaints.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "import_errors")
public class ImportError {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "import_batch_id", nullable = false)
    private ImportBatch importBatch;

    @Column(name = "csv_row_number", nullable = false)
    private Integer csvRowNumber;

    @Column(name = "raw_data", columnDefinition = "TEXT")
    private String rawData;

    @Column(name = "error_reason", columnDefinition = "TEXT", nullable = false)
    private String errorReason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public ImportError() {}

    public ImportError(ImportBatch importBatch, Integer csvRowNumber, String rawData, String errorReason) {
        this.importBatch = importBatch;
        this.csvRowNumber = csvRowNumber;
        this.rawData = rawData;
        this.errorReason = errorReason;
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ImportBatch getImportBatch() { return importBatch; }
    public void setImportBatch(ImportBatch importBatch) { this.importBatch = importBatch; }
    public Integer getCsvRowNumber() { return csvRowNumber; }
    public void setCsvRowNumber(Integer csvRowNumber) { this.csvRowNumber = csvRowNumber; }
    public String getRawData() { return rawData; }
    public void setRawData(String rawData) { this.rawData = rawData; }
    public String getErrorReason() { return errorReason; }
    public void setErrorReason(String errorReason) { this.errorReason = errorReason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
