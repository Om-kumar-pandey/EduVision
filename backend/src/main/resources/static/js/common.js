/**
 * AICTE Integrated Institution Complaint Monitoring & Status Dashboard
 * Common UI Helpers, Toasts, Modals, and Formatters
 */

const Common = (function() {
    'use strict';

    // Toast container initialization
    let toastContainer = null;
    function getToastContainer() {
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }
        return toastContainer;
    }

    return {
        /**
         * Escape HTML string to prevent XSS
         */
        escapeHtml(str) {
            if (str === null || str === undefined) return '';
            return String(str)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        },

        /**
         * Format ISO date string to localized date
         */
        formatDate(dateStr) {
            if (!dateStr) return '—';
            try {
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) return dateStr;
                return date.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });
            } catch (e) {
                return dateStr;
            }
        },

        /**
         * Format ISO date string to localized date & time
         */
        formatDateTime(dateStr) {
            if (!dateStr) return '—';
            try {
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) return dateStr;
                return date.toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                });
            } catch (e) {
                return dateStr;
            }
        },

        /**
         * Generate Status Badge HTML
         */
        getStatusBadge(status, isOverdue = false) {
            const safeStatus = (status || 'UNKNOWN').toUpperCase();
            let badgeClass = 'badge-received';
            let label = safeStatus.replace('_', ' ');

            if (safeStatus === 'UNDER_PROCESS') {
                badgeClass = 'badge-underprocess';
            } else if (safeStatus === 'DISPOSED') {
                badgeClass = 'badge-disposed';
            } else if (safeStatus === 'TRANSFERRED') {
                badgeClass = 'badge-transferred';
            }

            let html = `<span class="badge ${badgeClass}">${label}</span>`;
            if (isOverdue && safeStatus !== 'DISPOSED') {
                html += ` <span class="badge badge-overdue" title="Case has breached expected disposal deadline">OVERDUE</span>`;
            }
            return html;
        },

        /**
         * Generate Priority Badge HTML
         */
        getPriorityBadge(priority) {
            const p = (priority || 'MEDIUM').toUpperCase();
            let badgeClass = 'badge-priority-medium';

            if (p === 'URGENT') {
                badgeClass = 'badge-priority-urgent';
            } else if (p === 'HIGH') {
                badgeClass = 'badge-priority-high';
            } else if (p === 'LOW') {
                badgeClass = 'badge-priority-low';
            }

            return `<span class="badge ${badgeClass}">${p}</span>`;
        },

        /**
         * Show Toast Notification
         */
        showToast(message, type = 'info', duration = 4000) {
            const container = getToastContainer();
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;

            let icon = 'ℹ️';
            if (type === 'success') icon = '✅';
            else if (type === 'error') icon = '❌';
            else if (type === 'warning') icon = '⚠️';

            toast.innerHTML = `
                <div style="display:flex;align-items:center;gap:8px;">
                    <span>${icon}</span>
                    <span>${this.escapeHtml(message)}</span>
                </div>
                <button style="color:var(--color-text-muted);font-size:1.1rem;padding:0 4px;" onclick="this.parentElement.remove()">&times;</button>
            `;

            container.appendChild(toast);

            setTimeout(() => {
                if (toast.parentElement) {
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateX(100%)';
                    toast.style.transition = 'all 0.3s ease';
                    setTimeout(() => toast.remove(), 300);
                }
            }, duration);
        },

        /**
         * Open Modal by ID
         */
        openModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        },

        /**
         * Close Modal by ID
         */
        closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        },

        /**
         * Generic Confirmation Dialog
         */
        confirm(message, onConfirm) {
            let overlay = document.getElementById('globalConfirmModal');
            if (!overlay) {
                overlay = document.createElement('div');
                overlay.id = 'globalConfirmModal';
                overlay.className = 'modal-overlay';
                overlay.innerHTML = `
                    <div class="modal-container" style="max-width: 440px;">
                        <div class="modal-header">
                            <h3>Confirm Action</h3>
                            <button class="modal-close-btn" id="confirmModalClose">&times;</button>
                        </div>
                        <div class="modal-body">
                            <p id="confirmModalMessage" style="font-size: 0.95rem; line-height: 1.5; color: var(--color-text-primary);"></p>
                        </div>
                        <div class="modal-footer">
                            <button class="btn btn-secondary" id="confirmModalCancel">Cancel</button>
                            <button class="btn btn-primary" id="confirmModalProceed">Confirm</button>
                        </div>
                    </div>
                `;
                document.body.appendChild(overlay);
            }

            const msgEl = document.getElementById('confirmModalMessage');
            const proceedBtn = document.getElementById('confirmModalProceed');
            const cancelBtn = document.getElementById('confirmModalCancel');
            const closeBtn = document.getElementById('confirmModalClose');

            msgEl.textContent = message;

            const closeAction = () => {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            };

            cancelBtn.onclick = closeAction;
            closeBtn.onclick = closeAction;

            proceedBtn.onclick = () => {
                closeAction();
                if (typeof onConfirm === 'function') onConfirm();
            };

            overlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        },

        /**
         * Setup Mobile Sidebar Toggle & Off-Canvas Drawer Navigation
         */
        initMobileNav() {
            const toggleBtns = document.querySelectorAll('.mobile-menu-toggle, #mobileSidebarToggle');
            const sidebar = document.querySelector('.sidebar');
            let backdrop = document.querySelector('.sidebar-backdrop, #sidebarBackdrop');

            if (sidebar && !backdrop) {
                backdrop = document.createElement('div');
                backdrop.className = 'sidebar-backdrop';
                backdrop.id = 'sidebarBackdrop';
                sidebar.parentNode.insertBefore(backdrop, sidebar.nextSibling);
            }

            const closeSidebar = () => {
                if (sidebar) sidebar.classList.remove('open', 'active');
                if (backdrop) backdrop.classList.remove('active', 'show');
                document.body.style.overflow = '';
            };

            const toggleSidebar = (e) => {
                if (e) e.stopPropagation();
                if (!sidebar) return;
                const isOpen = sidebar.classList.contains('open') || sidebar.classList.contains('active');
                if (isOpen) {
                    closeSidebar();
                } else {
                    sidebar.classList.add('open', 'active');
                    if (backdrop) backdrop.classList.add('active', 'show');
                    document.body.style.overflow = 'hidden';
                }
            };

            toggleBtns.forEach(btn => {
                btn.addEventListener('click', toggleSidebar);
            });

            if (backdrop) {
                backdrop.addEventListener('click', closeSidebar);
            }

            if (sidebar) {
                sidebar.querySelectorAll('.nav-link, .nav-item a').forEach(link => {
                    link.addEventListener('click', closeSidebar);
                });
            }
        }
    };
})();

// Auto-initialize mobile toggle when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    Common.initMobileNav();
});
