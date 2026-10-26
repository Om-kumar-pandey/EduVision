package com.aicte.complaints.dto;

import java.util.List;

public class MonthlyTrendDto {
    private List<String> labels;
    private List<Long> inflowCounts;
    private List<Long> disposalCounts;

    public MonthlyTrendDto() {}
    public MonthlyTrendDto(List<String> labels, List<Long> inflowCounts, List<Long> disposalCounts) {
        this.labels = labels;
        this.inflowCounts = inflowCounts;
        this.disposalCounts = disposalCounts;
    }
    public List<String> getLabels() { return labels; }
    public void setLabels(List<String> labels) { this.labels = labels; }
    public List<Long> getInflowCounts() { return inflowCounts; }
    public void setInflowCounts(List<Long> inflowCounts) { this.inflowCounts = inflowCounts; }
    public List<Long> getDisposalCounts() { return disposalCounts; }
    public void setDisposalCounts(List<Long> disposalCounts) { this.disposalCounts = disposalCounts; }
}
