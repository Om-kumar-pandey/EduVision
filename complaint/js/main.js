/**
 * EduVision – Global Application UI Controller
 */
document.addEventListener('DOMContentLoaded', () => {
  initUserBar();
  initSidebar();
  initDropdowns();
  initGlobalSearch();
});

/**
 * Global Utility Functions
 */
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
window.escapeHtml = escapeHtml;

function formatDateString(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    const day = d.getDate().toString().padStart(2, '0');
    const month = d.toLocaleString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch (e) {
    return iso;
  }
}
window.formatDateString = formatDateString;

function getStatusBadgeInfo(status) {
  if (!status) return { label: 'Submitted', cssClass: 'submitted' };
  const s = String(status).toUpperCase().replace(/\s+/g, '_');
  switch (s) {
    case 'IN_PROCESS':
      return { label: 'In Process', cssClass: 'in-process' };
    case 'UNDER_REVIEW':
      return { label: 'Under Review', cssClass: 'under-review' };
    case 'RESOLVED':
      return { label: 'Resolved', cssClass: 'resolved' };
    case 'REJECTED':
      return { label: 'Rejected', cssClass: 'rejected' };
    case 'SUBMITTED':
      return { label: 'Submitted', cssClass: 'submitted' };
    case 'CLOSED':
      return { label: 'Closed', cssClass: 'closed' };
    default:
      return { label: status, cssClass: 'in-process' };
  }
}
window.getStatusBadgeInfo = getStatusBadgeInfo;

/**
 * Toast notifications
 */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  let iconClass = 'fa-info-circle';
  if (type === 'success') iconClass = 'fa-check-circle';
  if (type === 'danger') iconClass = 'fa-exclamation-circle';
  if (type === 'warning') iconClass = 'fa-exclamation-triangle';

  toast.innerHTML = `
    <i class="fas ${iconClass} toast-icon"></i>
    <div class="toast-msg">${message}</div>
    <i class="fas fa-times toast-close"></i>
  `;

  toast.querySelector('.toast-close').addEventListener('click', () => {
    toast.remove();
  });

  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}
window.showToast = showToast;

/**
 * Populate user avatar, name, role and dynamic hero banner
 */
function initUserBar() {
  const user = auth.getUser() || CONFIG.FALLBACK_DATA.user;

  const nameEls = document.querySelectorAll('.user-name-label');
  nameEls.forEach(el => el.textContent = user.fullName || 'Rahul Sharma');

  const roleEls = document.querySelectorAll('.user-role-label');
  roleEls.forEach(el => el.textContent = auth.formatRole(user.role));

  const avatarEls = document.querySelectorAll('.user-avatar-circle');
  avatarEls.forEach(el => {
    el.src = user.avatarUrl || 'assets/images/avatar-rahul.svg';
    el.alt = user.fullName || 'User';
  });

  // Dynamic Hero Banner role pill based on logged-in user role
  updateHeroBannerRole(user);

  // If user is Admin or AICTE_OFFICER, add Admin Dashboard link to sidebar if not present
  if (user && (user.role === 'ADMIN' || user.role === 'AICTE_OFFICER')) {
    const navList = document.querySelector('.sidebar-nav-list');
    if (navList && !document.querySelector('.admin-nav-link')) {
      const adminLi = document.createElement('li');
      adminLi.className = 'sidebar-nav-item admin-nav-link';
      adminLi.innerHTML = `
        <a href="admin-dashboard.html">
          <i class="fas fa-shield-alt"></i>
          <span>Admin Portal</span>
        </a>
      `;
      navList.appendChild(adminLi);
    }
  }
}

/**
 * Dynamically displays only the logged in user's role in the Hero Banner
 */
function updateHeroBannerRole(user) {
  const container = document.getElementById('hero-role-pill-container') || document.querySelector('.audience-pills-row');
  if (!container) return;

  const role = (user && user.role ? user.role.toUpperCase() : 'STUDENT');

  let icon = 'fa-user-graduate';
  let label = 'Student';

  switch (role) {
    case 'STUDENT':
      icon = 'fa-user-graduate';
      label = 'Student';
      break;
    case 'TEACHER':
      icon = 'fa-chalkboard-teacher';
      label = 'Teacher';
      break;
    case 'HOD':
      icon = 'fa-user-tie';
      label = 'HOD';
      break;
    case 'INSTITUTION_HEAD':
      icon = 'fa-university';
      label = 'Institution Head';
      break;
    case 'AICTE_OFFICER':
      icon = 'fa-user-shield';
      label = 'AICTE Officer';
      break;
    case 'ADMIN':
      icon = 'fa-user-shield';
      label = 'Administrator';
      break;
    default:
      icon = 'fa-user';
      label = auth.formatRole(role);
      break;
  }

  container.innerHTML = `
    <span class="audience-pill" id="active-user-role-pill">
      <i class="fas ${icon}"></i> ${escapeHtml(label)}
    </span>
  `;
}
window.updateHeroBannerRole = updateHeroBannerRole;

/**
 * Handle mobile sidebar toggle and active nav links
 */
function initSidebar() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.sidebar-nav-item a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    const parentLi = link.closest('.sidebar-nav-item');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      parentLi.classList.add('active');
    } else {
      parentLi.classList.remove('active');
    }
  });

  // Mobile menu button
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  const backdrop = document.querySelector('.sidebar-backdrop');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('mobile-open');
      if (backdrop) backdrop.classList.toggle('show');
    });
  }

  if (backdrop) {
    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      backdrop.classList.remove('show');
    });
  }
}

/**
 * Handle user profile dropdown and notifications dropdown
 */
function initDropdowns() {
  const profileMenuBtn = document.getElementById('user-profile-menu-btn');
  const profileDropdown = document.getElementById('user-profile-dropdown');
  const notifBtn = document.getElementById('nav-notifications-btn');
  const notifDropdown = document.getElementById('notifications-dropdown');

  if (profileMenuBtn && profileDropdown) {
    profileMenuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('show');
      if (notifDropdown) notifDropdown.classList.remove('show');
    });
  }

  if (notifBtn && notifDropdown) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('show');
      if (profileDropdown) profileDropdown.classList.remove('show');
    });
  }

  document.addEventListener('click', (e) => {
    if (profileDropdown && !profileDropdown.contains(e.target)) {
      profileDropdown.classList.remove('show');
    }
    if (notifDropdown && !notifDropdown.contains(e.target)) {
      notifDropdown.classList.remove('show');
    }
  });

  // Logout links
  const logoutLinks = document.querySelectorAll('.btn-logout-action');
  logoutLinks.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      auth.logout();
    });
  });
}

/**
 * Global search functionality
 */
function initGlobalSearch() {
  const searchInput = document.getElementById('global-search-input');
  if (!searchInput) return;

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (!query) return;

      if (query.toUpperCase().startsWith('CMP-')) {
        window.location.href = `track-complaint.html?id=${encodeURIComponent(query)}`;
      } else {
        window.location.href = `my-complaints.html?search=${encodeURIComponent(query)}`;
      }
    }
  });
}
