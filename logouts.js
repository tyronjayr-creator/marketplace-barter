/* SwapCart — Logout Handler with Glass Toast */

document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out?')) {
        localStorage.removeItem('currentUser');
        showGlassToast('You have been logged out 👋', '#0fb2a6');
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1500);
      }
    });
  }
});

/* ---- Glass Toast Utility ---- */
function showGlassToast(message, color = '#5b6ef6') {
  // Create container if not already present
  let cont = document.getElementById('glass-toast-container');
  if (!cont) {
    cont = document.createElement('div');
    cont.id = 'glass-toast-container';
    cont.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      z-index: 2000;
    `;
    document.body.appendChild(cont);
  }

  // Create toast
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    padding: 14px 20px;
    border-radius: 16px;
    backdrop-filter: blur(10px) saturate(140%);
    -webkit-backdrop-filter: blur(10px) saturate(140%);
    background: rgba(255,255,255,0.25);
    border: 1px solid rgba(255,255,255,0.3);
    color: ${color};
    font-weight: 700;
    font-size: 14px;
    box-shadow: 0 8px 30px rgba(0,0,0,0.1);
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.4s ease;
  `;
  cont.appendChild(toast);

  // Animate in
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 50);

  // Remove after 2.5s
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 400);
  }, 2500);
}
