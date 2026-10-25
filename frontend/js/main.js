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
 * Populate user avatar, name, and role in top navigation
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
