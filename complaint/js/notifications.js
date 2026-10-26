/**
 * EduVision – Notifications Dropdown & Badge Controller
 */
document.addEventListener('DOMContentLoaded', () => {
  initNotifications();
});

let notificationsList = [];

async function initNotifications() {
  await loadNotifications();

  const markAllBtn = document.getElementById('btn-mark-all-read');
  if (markAllBtn) {
    markAllBtn.addEventListener('click', handleMarkAllRead);
  }
}

async function loadNotifications() {
  try {
    const data = await api.get(CONFIG.ENDPOINTS.NOTIFICATIONS);
    if (Array.isArray(data)) {
      notificationsList = data;
    } else {
      notificationsList = CONFIG.FALLBACK_DATA.notifications;
    }
  } catch (err) {
    notificationsList = CONFIG.FALLBACK_DATA.notifications;
  }

  renderNotifications();
}

function renderNotifications() {
  const container = document.getElementById('notifications-list-container');
  const badgeEl = document.getElementById('notification-badge-count');

  const unreadCount = notificationsList.filter(n => !n.read).length;

  if (badgeEl) {
    if (unreadCount > 0) {
      badgeEl.textContent = unreadCount;
      badgeEl.style.display = 'flex';
    } else {
      badgeEl.style.display = 'none';
    }
  }

  if (!container) return;

  if (notificationsList.length === 0) {
    container.innerHTML = `<div style="padding: 16px; text-align: center; color: #64748b; font-size: 12.5px;">No notifications.</div>`;
    return;
  }

  container.innerHTML = notificationsList.map(n => `
    <div class="dropdown-item ${n.read ? '' : 'unread-notif'}" style="${!n.read ? 'background-color: #f0f7ff;' : ''}; cursor: pointer;" onclick="handleNotificationClick(${n.id})">
      <i class="fas fa-bell" style="color: ${n.read ? '#94a3b8' : '#2563eb'};"></i>
      <div style="flex: 1;">
        <div style="font-weight: 600; font-size: 12.5px; color: #1e293b;">${escapeHtml(n.title)}</div>
        <div style="font-size: 11.5px; color: #475569; line-height: 1.3;">${escapeHtml(n.message)}</div>
        <div style="font-size: 10px; color: #94a3b8; margin-top: 2px;">${escapeHtml(n.time || 'Just now')}</div>
      </div>
      ${!n.read ? '<span style="width: 8px; height: 8px; border-radius: 50%; background: #2563eb;"></span>' : ''}
    </div>
  `).join('');
}

window.handleNotificationClick = async function(id) {
  try {
    await api.patch(CONFIG.ENDPOINTS.MARK_NOTIFICATION_READ.replace('{id}', id), {});
  } catch (e) {
    // ignore
  }
  const item = notificationsList.find(n => n.id === id);
  if (item) item.read = true;
  renderNotifications();
};

async function handleMarkAllRead(e) {
  if (e) e.preventDefault();
  try {
    await api.patch(CONFIG.ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ, {});
  } catch (e) {
    // ignore
  }
  notificationsList.forEach(n => n.read = true);
  renderNotifications();
  showToast('All notifications marked as read', 'info');
}
