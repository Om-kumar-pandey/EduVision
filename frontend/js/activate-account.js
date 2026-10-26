/**
 * AICTE Officer Account Activation Logic
 * Verifies 64-character activation token and configures secure credentials.
 */

document.addEventListener('DOMContentLoaded', async () => {
    'use strict';

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    const loadingState = document.getElementById('loadingState');
    const invalidState = document.getElementById('invalidState');
    const verifiedState = document.getElementById('verifiedState');
    const invalidReason = document.getElementById('invalidReason');

    if (!token) {
        loadingState.style.display = 'none';
        invalidState.style.display = 'block';
        invalidReason.textContent = 'No activation token was provided in the URL. Please use the complete activation link sent by the Super Admin.';
        return;
    }

    try {
        const result = await Api.get(CONFIG.ENDPOINTS.VERIFY_ACTIVATION_TOKEN(token));

        loadingState.style.display = 'none';
        verifiedState.style.display = 'block';

        document.getElementById('officerName').textContent = result.fullName || 'Official';
        document.getElementById('officerEmail').textContent = result.email || '-';
        document.getElementById('officerEmpId').textContent = result.employeeId || '-';
        document.getElementById('officerDesignation').textContent = result.designation || 'Officer';
        document.getElementById('officerReqId').textContent = result.requestId || '-';

        const badge = document.getElementById('officerBureauBadge');
        if (result.requestedBureauCode === 'RB') {
            badge.textContent = 'Regulation Bureau (RB)';
            badge.style.background = '#0b2545';
        } else {
            badge.textContent = 'Public Grievance Redressal (PGRC)';
            badge.style.background = '#1e3a8a';
        }

    } catch (error) {
        loadingState.style.display = 'none';
        invalidState.style.display = 'block';
        invalidReason.textContent = error.message || 'This activation token is invalid, has expired, or has already been used.';
    }
});

async function handleActivationSubmit(event) {
    event.preventDefault();

    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const btn = document.getElementById('btnActivate');
    const alertEl = document.getElementById('activationAlert');

    alertEl.style.display = 'none';
    alertEl.className = 'alert-box';

    if (newPassword !== confirmPassword) {
        alertEl.className = 'alert-box error';
        alertEl.textContent = 'Passwords do not match. Please enter identical passwords.';
        alertEl.style.display = 'block';
        return;
    }

    if (newPassword.length < 6) {
        alertEl.className = 'alert-box error';
        alertEl.textContent = 'Password must be at least 6 characters long.';
        alertEl.style.display = 'block';
        return;
    }

    try {
        btn.disabled = true;
        btn.innerHTML = `<div class="spinner" style="width:16px;height:16px;border-width:2px;"></div> Activating Account...`;

        const authResponse = await Auth.activateAccount({
            token: token,
            password: newPassword
        });

        alertEl.className = 'alert-box success';
        alertEl.textContent = 'Account successfully activated! Welcome to the AICTE Bureau Workspace. Redirecting...';
        alertEl.style.display = 'block';

        setTimeout(() => {
            window.location.href = 'bureau-workspace.html';
        }, 800);

    } catch (error) {
        btn.disabled = false;
        btn.innerHTML = `<span>Activate Account &amp; Enter Workspace</span> &rarr;`;
        alertEl.className = 'alert-box error';
        alertEl.textContent = error.message || 'Failed to activate account. Token may have expired.';
        alertEl.style.display = 'block';
    }
}
