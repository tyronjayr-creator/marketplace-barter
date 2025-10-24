// logout.js — handles user logout for SwapCart
document.addEventListener('DOMContentLoaded', () => {
  const logoutBtn = document.getElementById('logoutBtn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to logout?')) {
        // Remove current user session
        localStorage.removeItem('currentUser');

        // Optional: also clear cart or session data
        // localStorage.removeItem('cart');

        // Redirect to login page
        window.location.href = 'login.html';
      }
    });
  }
});
