# Testing Booking API

## Step 1: Login to Get Token

```bash
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "username": "your_username",
    "email": null,
    "role": "USER"
  }
}
```

## Step 2: Use Token in Booking Requests

### Get All Bookings
```bash
GET http://localhost:5000/api/v1/bookings
Authorization: Bearer {paste_access_token_here}
```

### Create Booking
```bash
POST http://localhost:5000/api/v1/bookings
Authorization: Bearer {paste_access_token_here}
Content-Type: application/json

{
  "originCityId": "city-uuid",
  "destinationCityId": "city-uuid",
  "serviceId": "service-uuid",
  "consigneeName": "John Doe",
  "consigneePhone": "03001234567",
  "consigneeAddress": "123 Main St",
  "shipperName": "Jane Smith",
  "shipperPhone": "03009876543",
  "shipperAddress": "456 Park Ave",
  "weight": 2.5,
  "pieces": 1,
  "chargeableWeight": 2.5,
  "paymentMode": "PREPAID",
  "rate": 1000,
  "totalAmount": 1500
}
```

### Track Booking by CN
```bash
GET http://localhost:5000/api/v1/bookings/track/CN123456
Authorization: Bearer {paste_access_token_here}
```

## Testing from Browser Console

If testing from browser console after logging in:

```javascript
// Check if token exists
localStorage.getItem('token')

// Make a request
fetch('http://localhost:5000/api/v1/bookings', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(console.log)
```

## Common Issues

1. **401 Unauthorized**: 
   - Make sure you're logged in first
   - Token might be expired (default: 24h)
   - Token not included in Authorization header

2. **403 Forbidden**:
   - User doesn't have permission
   - Trying to access another user's booking

3. **500 Internal Server Error**:
   - Check backend logs
   - Verify database connection
   - Check JWT_SECRET is set in .env


