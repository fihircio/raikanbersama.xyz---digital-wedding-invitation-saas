# 🔍 Debugging Guide: Empty Page Issue

## Current Status
- ✅ Backend API is running on port 3001
- ✅ Frontend is running on port 5174
- ✅ Database is seeded with data
- ✅ Authentication is working
- ❓ Pages showing empty/blank

## Step-by-Step Debugging

### 1. Check Browser Console
1. Open http://localhost:5174 in your browser
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for any **red errors**

Common errors to look for:
- `Cannot read property 'map' of undefined`
- `TypeError: ...`
- `Network request failed`

### 2. Check Network Tab
1. In DevTools, go to **Network** tab
2. Refresh the page
3. Click on "Urus Tetamu" button
4. Check if you see:
   - `/api/invitations` request
   - Status code (should be 200)
   - Response data

### 3. Test API Directly

Run this in your terminal:

```bash
# Test health endpoint
curl http://localhost:3001/api/health

# Test invitations (will fail without token)
curl http://localhost:3001/api/invitations
```

### 4. Check LocalStorage

In browser console, run:
```javascript
console.log('Token:', localStorage.getItem('token'));
console.log('User:', localStorage.getItem('user'));
```

### 5. Manual Test

In browser console, run this to test API:
```javascript
fetch('http://localhost:3001/api/invitations', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('API Response:', data))
.catch(err => console.error('API Error:', err));
```

## Common Issues & Solutions

### Issue 1: "Cannot read property 'map' of undefined"
**Cause:** Data is not in expected format
**Solution:** Check if API returns `data.data` or just `data`

### Issue 2: 401 Unauthorized
**Cause:** Token is invalid or missing
**Solution:** 
1. Logout and login again
2. Check if token is saved in localStorage

### Issue 3: CORS Error
**Cause:** Backend not allowing frontend origin
**Solution:** Backend should have CORS enabled for localhost:5174

### Issue 4: Blank Page (No Errors)
**Cause:** CSS issue or component not rendering
**Solution:**
1. Check if elements exist in DOM (Inspect Element)
2. Look for `display: none` or `visibility: hidden`
3. Check if data is actually being set in state

## Quick Fixes

### Fix 1: Clear Cache
```bash
# In browser
Ctrl+Shift+Delete → Clear cache
# Or hard refresh
Ctrl+Shift+R
```

### Fix 2: Restart Both Servers
```bash
# Kill backend
kill $(lsof -ti:3001)

# Kill frontend  
kill $(lsof -ti:5174)

# Restart backend
cd backend && npm run dev

# Restart frontend (in new terminal)
npm run dev
```

### Fix 3: Check Data Structure

Add console.log in DashboardPage.tsx line 46:
```typescript
if (response.ok) {
  const data = await response.json();
  console.log('📦 API Response:', data);
  console.log('📦 Invitations:', data.data);
  setInvitations(data.data);
}
```

## What to Report

If issue persists, provide:
1. **Console errors** (screenshot)
2. **Network tab** showing API request/response
3. **What you see** on the page (screenshot)
4. **Browser** you're using

## Emergency Reset

If nothing works:
```bash
# Clear all data
localStorage.clear()

# Logout and login again
# Re-seed database
cd backend && npm run seed
```
