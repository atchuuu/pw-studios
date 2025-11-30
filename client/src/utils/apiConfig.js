const hostname = window.location.hostname;
const protocol = window.location.protocol;

// Assuming backend is always on port 5001
// If VITE_API_BASE_URL is set (e.g. for Ngrok), use it.
// Otherwise, detect dynamically.
export const API_BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api`;
