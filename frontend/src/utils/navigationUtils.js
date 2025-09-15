// Utility functions for navigation and routing

export const navigateAfterAuth = (user) => {
  // Navigate to prompts page after successful auth
  window.location.href = '/prompts';
};

export const showWelcomeMessage = (userName) => {
  // You could implement a toast notification here
  console.log(`ברוך הבא ${userName}!`);
};