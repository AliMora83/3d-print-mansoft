// Toast Notification System
// Provides user feedback for actions

/**
 * Show a toast notification
 * @param {string} type - 'success', 'error', 'warning', or 'info'
 * @param {string} title - Toast title
 * @param {string} message - Toast message (optional)
 * @param {number} duration - Duration in ms (default 3000)
 */
function showToast(type, title, message = '', duration = 3000) {
    const container = document.getElementById('toast-container');

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    // Icon mapping
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      ${message ? `<div class="toast-message">${message}</div>` : ''}
    </div>
    <button class="toast-close" onclick="closeToast(this)">×</button>
  `;

    // Add to container
    container.appendChild(toast);

    // Auto-remove after duration
    if (duration > 0) {
        setTimeout(() => {
            removeToast(toast);
        }, duration);
    }

    return toast;
}

/**
 * Close a toast notification
 * @param {HTMLElement} button - The close button element
 */
function closeToast(button) {
    const toast = button.closest('.toast');
    removeToast(toast);
}

/**
 * Remove a toast with animation
 * @param {HTMLElement} toast - The toast element to remove
 */
function removeToast(toast) {
    if (!toast) return;

    toast.classList.add('removing');
    setTimeout(() => {
        toast.remove();
    }, 300); // Match animation duration
}

/**
 * Show loading skeleton in a container
 * @param {string} containerId - ID of the container element
 * @param {number} count - Number of skeleton items to show
 */
function showLoadingSkeleton(containerId, count = 3) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const skeletons = Array(count).fill(0).map(() => `
    <div class="card">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text" style="width: 70%;"></div>
    </div>
  `).join('');

    container.innerHTML = `<div class="grid grid-2">${skeletons}</div>`;
}

/**
 * Show error state in a container
 * @param {string} containerId - ID of the container element
 * @param {string} message - Error message to display
 * @param {Function} retryCallback - Optional retry function
 */
function showErrorState(containerId, message = 'Something went wrong', retryCallback = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
    <div class="error-state">
      <div class="error-state-icon">⚠️</div>
      <div class="error-state-title">Oops!</div>
      <div class="error-state-message">${message}</div>
      ${retryCallback ? '<button class="btn btn-primary" onclick="' + retryCallback.name + '()">Try Again</button>' : ''}
    </div>
  `;
}
