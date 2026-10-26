/**
 * EduVision – User Profile & Account Settings Controller
 */
document.addEventListener('DOMContentLoaded', () => {
  initProfilePage();
});

async function initProfilePage() {
  const user = auth.getUser() || CONFIG.FALLBACK_DATA.user;
  populateProfileData(user);

  // Profile Update Form
  const profileForm = document.getElementById('edit-profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', handleProfileUpdate);
  }

  // Password Change Form
  const passwordForm = document.getElementById('change-password-form');
  if (passwordForm) {
    passwordForm.addEventListener('submit', handlePasswordChange);
  }
}

function populateProfileData(user) {
  // Readonly displays
  const nameDisplay = document.getElementById('profile-display-name');
  const roleDisplay = document.getElementById('profile-display-role');
  const instDisplay = document.getElementById('profile-display-inst');
  const emailDisplay = document.getElementById('profile-display-email');

  if (nameDisplay) nameDisplay.textContent = user.fullName || 'Rahul Sharma';
  if (roleDisplay) roleDisplay.textContent = auth.formatRole(user.role);
  if (instDisplay) instDisplay.textContent = user.institutionName || 'AICTE Affiliated Institute';
  if (emailDisplay) emailDisplay.textContent = user.email || 'rahul.sharma@eduvision.in';

  // Form Inputs
  const nameInput = document.getElementById('profileFullName');
  const emailInput = document.getElementById('profileEmail');
  const phoneInput = document.getElementById('profilePhone');
  const instInput = document.getElementById('profileInstitution');

  if (nameInput) nameInput.value = user.fullName || '';
  if (emailInput) emailInput.value = user.email || '';
  if (phoneInput && user.phoneNumber) phoneInput.value = user.phoneNumber;
  if (instInput) instInput.value = user.institutionName || '';
}

async function handleProfileUpdate(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-save-profile');
  const fullName = document.getElementById('profileFullName').value.trim();
  const phoneNumber = document.getElementById('profilePhone')?.value.trim();
  const institutionName = document.getElementById('profileInstitution')?.value.trim();

  if (!fullName) {
    showToast('Name cannot be empty.', 'danger');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Saving...';
  }

  try {
    const updated = await api.put(CONFIG.ENDPOINTS.PROFILE, { fullName, phoneNumber, institutionName });
    auth.setUser(updated || { ...auth.getUser(), fullName, phoneNumber, institutionName });
    showToast('Profile updated successfully!', 'success');
    populateProfileData(auth.getUser());
  } catch (err) {
    console.warn('Backend profile update fallback:', err);
    // Local update
    const cur = auth.getUser() || CONFIG.FALLBACK_DATA.user;
    const updated = { ...cur, fullName, phoneNumber, institutionName };
    auth.setUser(updated);
    showToast('Profile updated (Local session).', 'success');
    populateProfileData(updated);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
    }
  }
}

async function handlePasswordChange(e) {
  e.preventDefault();
  const btn = document.getElementById('btn-save-password');
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (newPassword.length < 8) {
    showToast('New password must be at least 8 characters long.', 'danger');
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast('New passwords do not match.', 'danger');
    return;
  }

  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Updating Password...';
  }

  try {
    await api.post(CONFIG.ENDPOINTS.CHANGE_PASSWORD, { currentPassword, newPassword });
    showToast('Password changed successfully!', 'success');
    document.getElementById('change-password-form').reset();
  } catch (err) {
    console.warn('Backend password change error:', err);
    showToast(err.message || 'Failed to change password.', 'danger');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-key"></i> Update Password';
    }
  }
}
