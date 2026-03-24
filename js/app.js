/**
 * feedback.js
 * Handles form submission and toast notification.
 */

function handleSubmit(e) {
  e.preventDefault();

  const toast = document.getElementById('toast');

  // Show toast
  toast.style.display = 'block';
  toast.style.opacity = '1';
  toast.style.transition = 'none';

  // Fade out after 3 seconds
  setTimeout(() => {
    toast.style.transition = 'opacity 0.5s';
    toast.style.opacity = '0';

    setTimeout(() => {
      toast.style.display = 'none';
      toast.style.opacity = '1';
    }, 500);
  }, 3000);
}
