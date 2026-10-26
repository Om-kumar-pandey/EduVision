package com.aicte.complaints.dto;

import java.util.List;

public class CsvPreviewResponse {
    private String tempFileKey;
    private String filename;
    private int totalRows;
    private int validRows;
    private int invalidRows;
    private List<CsvPreviewRow> previewRows;
    private List<String> globalErrors;

    public CsvPreviewResponse() {}
    public String getTempFileKey() { return tempFileKey; }
    public void setTempFileKey(String tempFileKey) { this.tempFileKey = tempFileKey; }
    public String getFilename() { return filename; }
    public void setFilename(String filename) { this.filename = filename; }
    public int getTotalRows() { return totalRows; }
    public void setTotalRows(int totalRows) { this.totalRows = totalRows; }
    public int getValidRows() { return validRows; }
    public void setValidRows(int validRows) { this.validRows = validRows; }
    public int getInvalidRows() { return invalidRows; }
    public void setInvalidRows(int invalidRows) { this.invalidRows = invalidRows; }
    public List<CsvPreviewRow> getPreviewRows() { return previewRows; }
    public void setPreviewRows(List<CsvPreviewRow> previewRows) { this.previewRows = previewRows; }
    public List<String> getGlobalErrors() { return globalErrors; }
    public void setGlobalErrors(List<String> globalErrors) { this.globalErrors = globalErrors; }
}
