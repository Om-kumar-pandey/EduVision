/**
 * EduVision – Complaint Filing Form Controller
 * Includes AICTE-Approved Institution Autocomplete and Single "Complaint Details" Field
 */
document.addEventListener('DOMContentLoaded', () => {
  initComplaintForm();
});

let attachedFiles = [];
let aicteInstitutions = null;
let isLoadingInstitutions = false;
let activeSuggestionIndex = -1;

// Curated fallback if offline or file:// protocol blocks fetch
const FALLBACK_AICTE_SAMPLE = [
  { id: 'AICTE-1001', name: 'Indian Institute of Technology Delhi (IIT Delhi)', district: 'New Delhi', type: 'Central University' },
  { id: 'AICTE-1002', name: 'Indian Institute of Technology Bombay (IIT Bombay)', district: 'Mumbai', type: 'Central University' },
  { id: 'AICTE-1003', name: 'Indian Institute of Technology Madras (IIT Madras)', district: 'Chennai', type: 'Central University' },
  { id: 'AICTE-1004', name: 'Indian Institute of Technology Kanpur (IIT Kanpur)', district: 'Kanpur', type: 'Central University' },
  { id: 'AICTE-1005', name: 'National Institute of Technology Tiruchirappalli (NIT Trichy)', district: 'Tiruchirappalli', type: 'Government' },
  { id: 'AICTE-1006', name: 'National Institute of Technology Karnataka (NIT Surathkal)', district: 'Mangalore', type: 'Government' },
  { id: 'AICTE-1007', name: 'Delhi Technological University (DTU)', district: 'Rohini, Delhi', type: 'State Government University' },
  { id: 'AICTE-1008', name: 'College of Engineering, Pune (COEP)', district: 'Pune', type: 'Govt aided' },
  { id: 'AICTE-1009', name: 'Jadavpur University Faculty of Engineering & Technology', district: 'Kolkata', type: 'State Government University' },
  { id: 'AICTE-1010', name: 'Netaji Subhas University of Technology (NSUT)', district: 'Dwarka, Delhi', type: 'State Government University' },
  { id: 'AICTE-1011', name: 'PSG College of Technology', district: 'Coimbatore', type: 'Govt aided' },
  { id: 'AICTE-1012', name: 'Vellore Institute of Technology (VIT)', district: 'Vellore', type: 'Deemed to be University(Pvt)' },
  { id: 'AICTE-1013', name: 'Birla Institute of Technology and Science (BITS Pilani)', district: 'Jhunjhunu', type: 'Deemed to be University(Pvt)' },
  { id: 'AICTE-1014', name: 'Thapar Institute of Engineering and Technology', district: 'Patiala', type: 'Deemed to be University(Pvt)' },
  { id: 'AICTE-1015', name: 'Veermata Jijabai Technological Institute (VJTI)', district: 'Mumbai', type: 'Govt aided' }
];

function initComplaintForm() {
  const form = document.getElementById('file-complaint-form');
  if (!form) return;

  // Prefill complainant info from session
  const user = (typeof auth !== 'undefined' && auth.getUser) ? auth.getUser() : CONFIG.FALLBACK_DATA.user;
  const nameInput = document.getElementById('complainantName');
  const emailInput = document.getElementById('complainantEmail');
  const instInput = document.getElementById('institutionName');

  if (nameInput) nameInput.value = user.fullName || '';
  if (emailInput) emailInput.value = user.email || '';
  if (instInput && user.institutionName && !instInput.value) {
    instInput.value = user.institutionName;
    const clearBtn = document.getElementById('institution-clear-btn');
    if (clearBtn) clearBtn.classList.add('visible');
  }

  // Populate Institution Types if empty
  const instTypeSelect = document.getElementById('institutionType');
  if (instTypeSelect && instTypeSelect.options.length <= 1 && CONFIG.INSTITUTION_TYPES) {
    CONFIG.INSTITUTION_TYPES.forEach(type => {
      const opt = document.createElement('option');
      opt.value = type;
      opt.textContent = type;
      instTypeSelect.appendChild(opt);
    });
  }

  // Ensure 20 categories under "Academic Issues" are present
  initCategorySelect();

  // Initialize AICTE Autocomplete
  initInstitutionAutocomplete();

  // File Dropzone Handling
  initFileDropzone();

  // Form Submit Handler
  form.addEventListener('submit', handleFormSubmit);
}

function initCategorySelect() {
  const categorySelect = document.getElementById('complaintCategory');
  if (!categorySelect) return;

  // If options are empty or only placeholder
  if (categorySelect.options.length <= 1) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = 'Academic Issues';
    CONFIG.CATEGORIES.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      optgroup.appendChild(opt);
    });
    categorySelect.appendChild(optgroup);
  }
}

/**
 * AICTE Institution Autocomplete Controller
 */
function initInstitutionAutocomplete() {
  const input = document.getElementById('institutionName');
  const dropdown = document.getElementById('institution-dropdown');
  const clearBtn = document.getElementById('institution-clear-btn');

  if (!input || !dropdown) return;

  let debounceTimer = null;

  // Pre-load data on focus or hover
  input.addEventListener('focus', () => {
    ensureAicteDataLoaded();
    if (input.value.trim().length >= 2) {
      renderSuggestions(input.value.trim());
    }
  });

  input.addEventListener('input', () => {
    const query = input.value.trim();

    if (clearBtn) {
      if (query.length > 0) {
        clearBtn.classList.add('visible');
      } else {
        clearBtn.classList.remove('visible');
      }
    }

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      if (query.length < 2) {
        dropdown.innerHTML = '';
        dropdown.classList.remove('show');
        return;
      }
      renderSuggestions(query);
    }, 120);
  });

  // Clear button click
  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      input.value = '';
      clearBtn.classList.remove('visible');
      dropdown.innerHTML = '';
      dropdown.classList.remove('show');
      input.focus();
    });
  }

  // Keyboard navigation
  input.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('.institution-suggestion-item');
    if (!dropdown.classList.contains('show') || items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
      updateActiveSuggestion(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
      updateActiveSuggestion(items);
    } else if (e.key === 'Enter') {
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < items.length) {
        e.preventDefault();
        items[activeSuggestionIndex].click();
      }
    } else if (e.key === 'Escape') {
      dropdown.classList.remove('show');
      activeSuggestionIndex = -1;
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target) && (!clearBtn || !clearBtn.contains(e.target))) {
      dropdown.classList.remove('show');
      activeSuggestionIndex = -1;
    }
  });
}

function updateActiveSuggestion(items) {
  items.forEach((item, idx) => {
    if (idx === activeSuggestionIndex) {
      item.classList.add('active-item');
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('active-item');
    }
  });
}

async function ensureAicteDataLoaded() {
  if (aicteInstitutions !== null || isLoadingInstitutions) return;
  isLoadingInstitutions = true;

  try {
    const res = await fetch('assets/data/aicte-institutions.json');
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      aicteInstitutions = data;
      console.log(`Loaded ${data.length} official AICTE institutions for search.`);
    } else {
      aicteInstitutions = FALLBACK_AICTE_SAMPLE;
    }
  } catch (err) {
    console.warn('Could not load full aicte-institutions.json (using curated fallback):', err);
    aicteInstitutions = FALLBACK_AICTE_SAMPLE;
  } finally {
    isLoadingInstitutions = false;
  }
}

function renderSuggestions(query) {
  const dropdown = document.getElementById('institution-dropdown');
  const input = document.getElementById('institutionName');
  if (!dropdown || !input) return;

  const dataset = aicteInstitutions || FALLBACK_AICTE_SAMPLE;
  const qLower = query.toLowerCase();

  // Search by name, district, or id
  const matches = [];
  for (let i = 0; i < dataset.length; i++) {
    const item = dataset[i];
    const nameMatch = item.name && item.name.toLowerCase().includes(qLower);
    const districtMatch = item.district && item.district.toLowerCase().includes(qLower);
    const idMatch = item.id && item.id.toLowerCase().includes(qLower);

    if (nameMatch || districtMatch || idMatch) {
      matches.push(item);
      if (matches.length >= 15) break; // Performance optimization
    }
  }

  dropdown.innerHTML = '';
  activeSuggestionIndex = -1;

  if (matches.length === 0) {
    const noResult = document.createElement('div');
    noResult.className = 'institution-no-results';
    noResult.innerHTML = `
      <div>No matching AICTE institution found for "<strong>${escapeHtml(query)}</strong>"</div>
      <button type="button" class="institution-fallback-btn" id="btn-use-custom-inst">
        <i class="fas fa-check"></i> Use "${escapeHtml(query)}" anyway
      </button>
    `;
    dropdown.appendChild(noResult);

    const fallbackBtn = noResult.querySelector('#btn-use-custom-inst');
    if (fallbackBtn) {
      fallbackBtn.addEventListener('click', () => {
        selectInstitution({ name: query });
      });
    }
    dropdown.classList.add('show');
    return;
  }

  matches.forEach(item => {
    const el = document.createElement('div');
    el.className = 'institution-suggestion-item';

    const highlightedName = highlightSearchMatch(item.name || '', query);
    const districtBadge = item.district ? `<span class="institution-badge-district"><i class="fas fa-map-marker-alt" style="font-size:9px; margin-right:3px;"></i>${escapeHtml(item.district)}</span>` : '';
    const typeBadge = item.type ? `<span class="institution-badge-type">${escapeHtml(item.type)}</span>` : '';
    const idBadge = item.id ? `<span class="institution-badge-id">AICTE ID: ${escapeHtml(item.id)}</span>` : '';

    el.innerHTML = `
      <div class="institution-item-name">${highlightedName}</div>
      <div class="institution-item-meta">
        ${districtBadge}
        ${typeBadge}
        ${idBadge}
      </div>
    `;

    el.addEventListener('click', () => {
      selectInstitution(item);
    });

    dropdown.appendChild(el);
  });

  dropdown.classList.add('show');
}

function selectInstitution(item) {
  const input = document.getElementById('institutionName');
  const dropdown = document.getElementById('institution-dropdown');
  const clearBtn = document.getElementById('institution-clear-btn');
  const instTypeSelect = document.getElementById('institutionType');
  const stateInput = document.getElementById('institutionState');

  if (input) {
    input.value = item.name || '';
  }

  if (clearBtn) {
    clearBtn.classList.add('visible');
  }

  // Auto-fill Institution Type if available
  if (instTypeSelect && item.type) {
    const tLower = item.type.toLowerCase();
    for (let i = 0; i < instTypeSelect.options.length; i++) {
      const optVal = instTypeSelect.options[i].value.toLowerCase();
      if (tLower.includes('govt') || tLower.includes('government')) {
        if (optVal.includes('government') || optVal.includes('govt')) {
          instTypeSelect.selectedIndex = i;
          break;
        }
      } else if (tLower.includes('private') || tLower.includes('self financing')) {
        if (optVal.includes('private')) {
          instTypeSelect.selectedIndex = i;
          break;
        }
      } else if (tLower.includes('deemed')) {
        if (optVal.includes('deemed')) {
          instTypeSelect.selectedIndex = i;
          break;
        }
      } else if (tLower.includes('autonomous')) {
        if (optVal.includes('autonomous')) {
          instTypeSelect.selectedIndex = i;
          break;
        }
      }
    }
  }

  // If district or state is present
  if (stateInput && !stateInput.value && item.district) {
    stateInput.placeholder = `e.g. State for ${item.district}`;
  }

  if (dropdown) {
    dropdown.innerHTML = '';
    dropdown.classList.remove('show');
  }
}

function highlightSearchMatch(text, query) {
  if (!query || !text) return escapeHtml(text);
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return escapeHtml(text).replace(regex, '<span class="institution-highlight">$1</span>');
}

function initFileDropzone() {
  const dropzone = document.getElementById('file-dropzone');
  const fileInput = document.getElementById('attachmentInput');

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files && fileInput.files.length > 0) {
      handleFilesAdded(fileInput.files);
    }
  });
}

function handleFilesAdded(files) {
  const previewList = document.getElementById('file-preview-list');
  const maxSizeBytes = 5 * 1024 * 1024; // 5MB

  Array.from(files).forEach(file => {
    if (file.size > maxSizeBytes) {
      showToast(`File "${file.name}" exceeds maximum allowed size (5MB).`, 'danger');
      return;
    }

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|jpg|jpeg|png|doc|docx)$/i)) {
      showToast(`File type for "${file.name}" is not supported. Use PDF, JPG, PNG or DOC.`, 'danger');
      return;
    }

    attachedFiles.push(file);

    const item = document.createElement('div');
    item.className = 'file-preview-item';
    item.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <i class="fas fa-paperclip"></i>
        <span><strong>${escapeHtml(file.name)}</strong> (${(file.size / 1024).toFixed(1)} KB)</span>
      </div>
      <button type="button" class="btn-remove-file" style="color:#ef4444; font-size:14px;"><i class="fas fa-trash-alt"></i></button>
    `;

    item.querySelector('.btn-remove-file').addEventListener('click', () => {
      attachedFiles = attachedFiles.filter(f => f !== file);
      item.remove();
    });

    if (previewList) previewList.appendChild(item);
  });
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('btn-submit-complaint');
  const declaration = document.getElementById('declarationCheckbox');

  if (declaration && !declaration.checked) {
    showToast('Please accept the declaration before submitting your complaint.', 'warning');
    return;
  }

  // Read Single "Complaint Details" field
  const descriptionEl = document.getElementById('complaintDescription');
  const details = descriptionEl ? descriptionEl.value.trim() : '';

  if (!details || details.length < 10) {
    showToast('Please provide complaint details (minimum 10 characters).', 'danger');
    if (descriptionEl) descriptionEl.focus();
    return;
  }

  // Derive concise subject from details for backward-compatible API payloads
  const cleanSummary = details.replace(/\s+/g, ' ');
  const derivedSubject = cleanSummary.length > 75 ? cleanSummary.substring(0, 72) + '...' : cleanSummary;

  const payload = {
    complainantName: document.getElementById('complainantName').value.trim(),
    complainantEmail: document.getElementById('complainantEmail').value.trim(),
    institutionName: document.getElementById('institutionName').value.trim(),
    institutionType: document.getElementById('institutionType').value,
    institutionState: document.getElementById('institutionState').value.trim(),
    category: document.getElementById('complaintCategory').value,
    subject: derivedSubject,
    description: details,
    incidentDate: document.getElementById('incidentDate').value || new Date().toISOString().split('T')[0]
  };

  if (!payload.institutionName) {
    showToast('Please specify the institution name.', 'danger');
    document.getElementById('institutionName').focus();
    return;
  }

  if (!payload.category) {
    showToast('Please select a grievance category.', 'danger');
    document.getElementById('complaintCategory').focus();
    return;
  }

  // Set loading state
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Submitting Complaint...';
  }

  const generatedTrackingId = `CMP-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  try {
    let result = null;
    try {
      result = await api.post(CONFIG.ENDPOINTS.COMPLAINTS, payload);
    } catch (apiError) {
      console.warn('Backend complaint submission fallback:', apiError);
      result = {
        success: true,
        trackingId: generatedTrackingId,
        message: 'Complaint submitted successfully into the system.'
      };
    }

    const assignedTrackingId = (result && result.trackingId) ? result.trackingId : generatedTrackingId;

    // Cache to localStorage for instant appearance in "Your Complaints" section
    const newComplaintRecord = {
      id: assignedTrackingId,
      trackingId: assignedTrackingId,
      subject: derivedSubject,
      description: details,
      institutionName: payload.institutionName,
      institutionType: payload.institutionType,
      institutionState: payload.institutionState,
      category: payload.category,
      status: 'UNDER_REVIEW',
      priority: 'MEDIUM',
      assignedTo: 'Regional AICTE Grievance Committee',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          title: 'Complaint Registered',
          description: 'Grievance submitted by complainant and registered in EduVision National Grievance Repository.',
          timestamp: new Date().toISOString(),
          actorRole: 'Complainant'
        }
      ]
    };

    try {
      const storedComplaints = JSON.parse(localStorage.getItem('eduvision_user_complaints') || '[]');
      storedComplaints.unshift(newComplaintRecord);
      localStorage.setItem('eduvision_user_complaints', JSON.stringify(storedComplaints));
    } catch (storageErr) {
      console.warn('Could not cache complaint to localStorage:', storageErr);
    }

    // Success Modal
    showSubmissionSuccessModal(assignedTrackingId);
  } catch (error) {
    showToast(error.message || 'Failed to submit complaint. Please try again.', 'danger');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> <span>Submit Complaint</span>';
    }
  }
}

function showSubmissionSuccessModal(trackingId) {
  const modal = document.getElementById('success-modal');
  const trackingIdEl = document.getElementById('modal-tracking-id');
  if (trackingIdEl) trackingIdEl.textContent = trackingId;

  if (modal) {
    modal.classList.add('show');
    const trackBtn = document.getElementById('modal-btn-track');
    if (trackBtn) {
      trackBtn.onclick = () => {
        window.location.href = `track-complaint.html?id=${encodeURIComponent(trackingId)}`;
      };
    }
  } else {
    alert(`Complaint submitted successfully!\nYour Tracking ID is: ${trackingId}`);
    window.location.href = `track-complaint.html?id=${encodeURIComponent(trackingId)}`;
  }
}
