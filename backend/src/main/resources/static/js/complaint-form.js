/**
 * EduVision Portal - Complaint Filing Form Handler (complaint-form.js)
 */
const ComplaintForm = (() => {
  const init = () => {
    const form = document.getElementById('fileComplaintForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const complainantName = document.getElementById('compName')?.value.trim();
      const email = document.getElementById('compEmail')?.value.trim();
      const institutionName = document.getElementById('compInstitution')?.value.trim();
      const institutionType = document.getElementById('compInstitutionType')?.value;
      const category = document.getElementById('compCategory')?.value;
      const incidentDate = document.getElementById('compIncidentDate')?.value;
      const subject = document.getElementById('compSubject')?.value.trim();
      const description = document.getElementById('compDescription')?.value.trim();
      const declaration = document.getElementById('compDeclaration')?.checked;

      // Validation
      if (!complainantName || !email || !institutionName || !category || !subject || !description) {
        if (window.showToast) window.showToast('Please complete all required fields.', 'error');
        return;
      }

      if (!declaration) {
        if (window.showToast) window.showToast('Please confirm the declaration checkbox.', 'error');
        return;
      }

      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn ? submitBtn.innerHTML : 'Submit Complaint';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting to AICTE...';
      }

      const payload = {
        institutionName,
        institutionType,
        category,
        subject,
        description,
        incidentDate: incidentDate || null,
        declarationAccepted: declaration
      };

      try {
        const response = await API.post('/complaints', payload);
        if (response && response.data) {
          const generatedId = response.data.trackingId;

          // Close modal if embedded
          const modal = document.getElementById('fileComplaintModal');
          if (modal) modal.classList.remove('active');

          form.reset();

          // Open Success Modal
          const successModal = document.getElementById('submissionSuccessModal');
          if (successModal) {
            document.getElementById('successGeneratedId').textContent = generatedId;
            successModal.classList.add('active');
          } else {
            alert(`Grievance submitted successfully! Your tracking ID is: ${generatedId}`);
            window.location.href = `track-complaint.html?id=${generatedId}`;
          }

          if (window.Dashboard) {
            window.Dashboard.loadSummary();
          }

          if (window.showToast) {
            window.showToast(`Complaint ${generatedId} lodged successfully!`, 'success');
          }
        }
      } catch (err) {
        console.error('Submission failed:', err);
        if (window.showToast) {
          window.showToast(err.message || 'Failed to submit complaint. Please check your connection.', 'error');
        } else {
          alert('Error: ' + err.message);
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      }
    });
  };

  return { init };
})();

window.ComplaintForm = ComplaintForm;
