/**
 * Quick test script to verify API authentication
 * Run this in browser console after logging in through the UI
 */

// Check if logged in
const token = localStorage.getItem('token');
const user = localStorage.getItem('user');

console.log('Token exists:', !!token);
console.log('User:', user ? JSON.parse(user) : 'Not logged in');

if (token) {
  // Test bookings endpoint
  fetch('http://localhost:5000/api/v1/bookings', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('Status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Response:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });
} else {
  console.error('No token found! Please login first.');
}


