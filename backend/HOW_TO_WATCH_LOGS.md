# How to Watch Backend Logs

## 📋 Quick Start

### Method 1: Development Mode (Recommended)
```bash
# Navigate to backend directory
cd backend

# Start the server in development mode
npm run start:dev
```

**What you'll see:**
- All API requests and responses
- Error logs with full stack traces
- Database query logs (if enabled)
- Server startup messages
- Hot reload notifications

### Method 2: Debug Mode (More Detailed)
```bash
# Start with debug logging enabled
npm run start:debug
```

This provides:
- More verbose logging
- Debug information
- Better error stack traces

### Method 3: Production Mode
```bash
# Build first
npm run build

# Then start
npm run start:prod
```

## 🔍 What Gets Logged

### Automatic Logging
The backend automatically logs:

1. **Server Errors (500+)**
   - Full error stack trace
   - Request method and URL
   - Request body
   - Request query parameters
   - Request route parameters

2. **Client Errors (400-499)**
   - Error message
   - Request method and URL
   - Status code

3. **Server Startup**
   - Port number
   - Swagger documentation URL
   - Application status

### Example Log Output

**Server Error (500):**
```
[HttpExceptionFilter] ❌ POST /api/v1/bookings - Status: 500
[HttpExceptionFilter] Error: [Full stack trace here]
[HttpExceptionFilter] Request body: {
  "originCityId": "temp-rawalpindi-id",
  "destinationCityId": "temp-islamabad-id",
  ...
}
```

**Client Error (400):**
```
[HttpExceptionFilter] ⚠️ POST /api/v1/bookings - Status: 400 - Validation failed
```

## 🛠️ Tips for Better Logging

### 1. Keep Terminal Open
- Keep the terminal where you ran `npm run start:dev` visible
- All logs appear in real-time in that terminal

### 2. Filter Logs (if using terminal)
```bash
# On Windows PowerShell - filter for errors only
npm run start:dev | Select-String "error|Error|ERROR|❌|⚠️"

# On Linux/Mac - filter for errors only
npm run start:dev | grep -i "error\|❌\|⚠️"
```

### 3. Save Logs to File
```bash
# Windows PowerShell
npm run start:dev *> backend-logs.txt

# Linux/Mac
npm run start:dev > backend-logs.txt 2>&1
```

### 4. Use Multiple Terminals
- Terminal 1: Run backend (`npm run start:dev`)
- Terminal 2: Run frontend (`npm run dev`)
- Terminal 3: Watch specific logs or run other commands

## 🐛 Troubleshooting with Logs

### When You See a 500 Error:

1. **Check the terminal** where backend is running
2. **Look for the error log** - it will show:
   - The exact error message
   - The full stack trace
   - The request data that caused the error

3. **Common issues to check:**
   - Database connection errors
   - Missing required fields
   - Invalid data types
   - Foreign key violations
   - Validation errors

### Example: Booking Creation Error

If you see:
```
❌ POST /api/v1/bookings - Status: 500
Error: [Error details here]
Request body: { ... }
```

**What to do:**
1. Copy the error message
2. Check the request body - see what data was sent
3. Verify:
   - All required fields are present
   - Data types are correct
   - Foreign keys (cityId, serviceId) exist in database
   - Date formats are correct

## 📊 Log Levels

The backend uses NestJS Logger with these levels:
- **ERROR** (❌) - Server errors (500+)
- **WARN** (⚠️) - Client errors (400-499)
- **LOG** - General information
- **DEBUG** - Detailed debugging (when using `start:debug`)

## 🔗 Related Files

- `backend/src/common/filters/http-exception.filter.ts` - Error logging configuration
- `backend/src/main.ts` - Application bootstrap and startup logs
- `backend/package.json` - Available scripts

## 💡 Pro Tips

1. **Use VS Code Terminal**: Split terminal to see both frontend and backend logs
2. **Use Browser DevTools**: Check Network tab for API request/response details
3. **Combine Logs**: Check both browser console (frontend) and terminal (backend) for full picture
4. **Search Logs**: Use Ctrl+F in terminal to search for specific errors or endpoints

## ✅ Quick Checklist

When debugging an issue:
- [ ] Backend server is running (`npm run start:dev`)
- [ ] Terminal showing backend logs is visible
- [ ] Checked terminal for error messages
- [ ] Checked browser console for frontend errors
- [ ] Checked Network tab for API request details
- [ ] Verified request body matches expected format

