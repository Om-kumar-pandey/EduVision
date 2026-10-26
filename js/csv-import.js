/**
 * AICTE Integrated Institution Complaint Monitoring & Status Dashboard
 * Bulk CSV Ingestion & Validation Module
 */

document.addEventListener('DOMContentLoaded', () => {
    'use strict';

    const dropzone = document.getElementById('csvDropzone');
    const fileInput = document.getElementById('csvFileInput');
    const previewArea = document.getElementById('csvPreviewArea');
    const btnConfirmImport = document.getElementById('btnConfirmImport');
    const btnCancelImport = document.getElementById('btnCancelImport');
    const btnDownloadSampleCsv = document.getElementById('btnDownloadSampleCsv');

    let currentSelectedFile = null;

    if (!dropzone || !fileInput) return;

    // Trigger file picker on dropzone click
    dropzone.addEventListener('click', () => fileInput.click());

    // Drag & drop visual feedback
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('drag-over');
    });

    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('drag-over');
    });

    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('drag-over');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files.length > 0) {
            handleFileSelection(fileInput.files[0]);
        }
    });

    /**
     * Step 1 & 2: Validate file & request Backend Pre-Import Preview
     */
    async function handleFileSelection(file) {
        if (!file.name.toLowerCase().endsWith('.csv')) {
            Common.showToast('Please select a valid CSV (.csv) file.', 'error');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            Common.showToast('File size exceeds 10MB limit.', 'error');
            return;
        }

        currentSelectedFile = file;

        try {
            previewArea.style.display = 'block';
            previewArea.innerHTML = `
                <div style="text-align:center;padding:40px;">
                    <div class="spinner"></div>
                    <p style="margin-top:12px;font-weight:600;color:var(--color-primary-navy);">
                        Uploading & Validating CSV rows against AICTE verified institution database...
                    </p>
                </div>
            `;

            const formData = new FormData();
            formData.append('file', file);

            const preview = await Api.uploadFile(CONFIG.ENDPOINTS.CSV_PREVIEW, formData);
            renderPreviewResults(preview);

        } catch (error) {
            previewArea.innerHTML = `
                <div style="text-align:center;padding:24px;color:#ef4444;background:#fee2e2;border-radius:var(--radius-md);">
                    <h4>CSV Validation Failed</h4>
                    <p style="margin-top:6px;">${Common.escapeHtml(error.message)}</p>
                </div>
            `;
            Common.showToast('Validation failed: ' + error.message, 'error');
        }
    }

    /**
     * Render Preview Table and Metric Strip
     */
    function renderPreviewResults(preview) {
        previewArea.innerHTML = `
            <div class="card" style="border-top:4px solid var(--color-gov-blue);">
                <div class="card-header">
                    <h3>CSV Validation Preview: ${Common.escapeHtml(preview.filename)}</h3>
                    <div style="display:flex;gap:8px;">
                        <button class="btn btn-secondary btn-sm" id="btnCancelPreview">Cancel</button>
                        <button class="btn btn-primary btn-sm" id="btnExecuteImport" ${preview.validRows === 0 ? 'disabled' : ''}>
                            Confirm Import (${preview.validRows} valid rows)
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="preview-summary-strip">
                        <div class="preview-stat total">
                            <div class="preview-stat-val">${preview.totalRows}</div>
                            <div class="preview-stat-lbl">Total Rows</div>
                        </div>
                        <div class="preview-stat valid">
                            <div class="preview-stat-val">${preview.validRows}</div>
                            <div class="preview-stat-lbl">Valid Rows</div>
                        </div>
                        <div class="preview-stat invalid">
                            <div class="preview-stat-val">${preview.invalidRows}</div>
                            <div class="preview-stat-lbl">Invalid Rows</div>
                        </div>
                    </div>

                    <h4 style="font-size:0.9rem;font-weight:700;margin-bottom:8px;">Row-Level Verification Preview</h4>
                    <div class="table-responsive" style="max-height:360px;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Row</th>
                                    <th>Status</th>
                                    <th>AICTE Permanent ID</th>
                                    <th>Institution Name</th>
                                    <th>Bureau</th>
                                    <th>Complaint Title</th>
                                    <th>Validation Details</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${preview.previewRows.map(r => `
                                    <tr style="${!r.valid ? 'background:#fff1f2;' : ''}">
                                        <td style="font-weight:700;">#${r.rowNumber}</td>
                                        <td>
                                            <span class="badge" style="background:${r.valid ? '#dcfce7' : '#fee2e2'};color:${r.valid ? '#166534' : '#991b1b'};">
                                                ${r.valid ? 'VALID' : 'INVALID'}
                                            </span>
                                        </td>
                                        <td style="font-family:var(--font-family-mono);">${Common.escapeHtml(r.permanentId)}</td>
                                        <td style="font-weight:600;">${Common.escapeHtml(r.institutionName || 'Unmatched')}</td>
                                        <td><span class="badge" style="background:#e0e7ff;color:#3730a3;">${Common.escapeHtml(r.bureauCode)}</span></td>
                                        <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;">${Common.escapeHtml(r.title)}</td>
                                        <td>
                                            ${r.valid ? '<span style="color:#10b981;font-weight:600;">Verified</span>' : `<span class="row-error-callout">${Common.escapeHtml(r.errorReason)}</span>`}
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('btnCancelPreview').onclick = () => {
            previewArea.style.display = 'none';
            fileInput.value = '';
            currentSelectedFile = null;
        };

        document.getElementById('btnExecuteImport').onclick = executeConfirmedImport;
    }

    /**
     * Step 3 & 4: Commit Validated Import to Backend
     */
    async function executeConfirmedImport() {
        if (!currentSelectedFile) return;

        const executeBtn = document.getElementById('btnExecuteImport');
        executeBtn.disabled = true;
        executeBtn.textContent = 'Importing to Database...';

        try {
            const formData = new FormData();
            formData.append('file', currentSelectedFile);

            const result = await Api.uploadFile(CONFIG.ENDPOINTS.CSV_IMPORT, formData);

            previewArea.innerHTML = `
                <div class="card" style="border-top:4px solid #10b981;padding:24px;text-align:center;">
                    <div style="font-size:3rem;margin-bottom:8px;">🎉</div>
                    <h3 style="color:#166534;font-size:1.3rem;">Bulk CSV Ingestion Successful!</h3>
                    <p style="margin:8px 0;font-size:0.95rem;">
                        Import Batch ID: <strong style="font-family:var(--font-family-mono);color:var(--color-gov-blue);">${Common.escapeHtml(result.batchId)}</strong>
                    </p>
                    <div style="display:inline-flex;gap:12px;margin:16px 0;">
                        <span class="badge" style="background:#dcfce7;color:#166534;padding:6px 14px;font-size:0.85rem;">
                            ✅ ${result.importedRows} Cases Created & Indexed
                        </span>
                        ${result.failedRows > 0 ? `
                            <span class="badge" style="background:#fee2e2;color:#991b1b;padding:6px 14px;font-size:0.85rem;">
                                ⚠️ ${result.failedRows} Rows Rejected & Logged to Error Audit
                            </span>
                        ` : ''}
                    </div>
                    <div>
                        <button class="btn btn-primary" onclick="window.location.reload()">Upload Another File</button>
                    </div>
                </div>
            `;

            Common.showToast(`Import completed with Batch ID: ${result.batchId}`, 'success');

        } catch (error) {
            Common.showToast('Import execution failed: ' + error.message, 'error');
            executeBtn.disabled = false;
            executeBtn.textContent = 'Retry Import';
        }
    }

    /**
     * Download Synthetic Demonstration CSV Template
     */
    if (btnDownloadSampleCsv) {
        btnDownloadSampleCsv.addEventListener('click', (e) => {
            e.preventDefault();
            const sampleCsv =
`permanent_id,bureau_code,title,category,priority,description,source_case_id
1-1097234567,RB,Surprise Inspection Deficit in Computing Infrastructure,Infrastructure Deficit,HIGH,Hardware laboratory obsolete and inadequate network nodes.,CPGRAMS-2026-9901
1-2048912384,PGRC,Excess Hostel Charges Retained Unlawfully,Capitation Fee / Overcharging,URGENT,Security deposit refund withheld for over 9 months.,PGRC-DIRECT-2004
1-3958102931,RB,Faculty Promotion Irregularity Under CAS Norms,Faculty Irregularities,MEDIUM,Non-compliance with mandatory publication benchmarks.,INSP-2026-5510
1-INVALID-0000,RB,Test Invalid Institution Record,Infrastructure Deficit,LOW,This institution does not exist in AICTE master list.,DEMO-ERR-01`;

            const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'AICTE_Sample_Complaints_Import.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            Common.showToast('Demo CSV template downloaded. Use this file to test upload & validation.', 'info');
        });
    }
});
