package com.aicte.complaints.dto;

public class CsvPreviewRow {
    private int rowNumber;
    private String permanentId;
    private String institutionName;
    private String bureauCode;
    private String title;
    private String category;
    private String priority;
    private String receiptDate;
    private boolean valid;
    private String errorReason;

    public CsvPreviewRow() {}
    public int getRowNumber() { return rowNumber; }
    public void setRowNumber(int rowNumber) { this.rowNumber = rowNumber; }
    public String getPermanentId() { return permanentId; }
    public void setPermanentId(String permanentId) { this.permanentId = permanentId; }
    public String getInstitutionName() { return institutionName; }
    public void setInstitutionName(String institutionName) { this.institutionName = institutionName; }
    public String getBureauCode() { return bureauCode; }
    public void setBureauCode(String bureauCode) { this.bureauCode = bureauCode; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }
    public String getReceiptDate() { return receiptDate; }
    public void setReceiptDate(String receiptDate) { this.receiptDate = receiptDate; }
    public boolean isValid() { return valid; }
    public void setValid(boolean valid) { this.valid = valid; }
    public String getErrorReason() { return errorReason; }
    public void setErrorReason(String errorReason) { this.errorReason = errorReason; }
}
