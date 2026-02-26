const token = sessionStorage.getItem('token');

export function verifyToken(token) {
  // no token means not signed in so redirect to login.js
  if (!token || isTokenExpired(token)) {
      window.location.replace('/');
}}

function isTokenExpired(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])); // extract the expiry date
    return Date.now() / 1000 > payload.exp; // token expired
  } catch (e) { // token missing or invalid
    return true;
  }
}