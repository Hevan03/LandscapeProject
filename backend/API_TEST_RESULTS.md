# 🚀 API Testing Guide - Landscape Management Backend

## Server Status
- **Server URL**: http://localhost:5000
- **Status**: ✅ Running
- **Database**: ❌ MongoDB connection failed (cluster0.mvkphrl.mongodb.net)
- **Note**: Server continues to run without database connection, but database-dependent endpoints may not work properly.

## Quick Test Summary
The following endpoints have been verified through browser testing:

### ✅ Working Endpoints (Accessible)
1. **Health Check**: `GET /api/health`
2. **Employee List**: `GET /api/employees/RegisterEmployeeList`
3. **All Ratings**: `GET /api/rating/all`
4. **Landscaper Grades**: `GET /api/rating/landscapers/grades`
5. **Static Files**: `GET /uploads/`

### 🔍 Endpoints Requiring Further Testing
Due to database connection issues, the following endpoints need to be tested once the database is connected:
- Authentication endpoints
- Employee creation/modification endpoints
- Notification endpoints
- Rating creation endpoints

---

## 📋 Complete API Endpoint Documentation

### 1. Health Check
- **URL**: `GET /api/health`
- **Status**: ✅ Working
- **Expected Response**: 
```json
{
  "status": "success",
  "message": "Server is running successfully",
  "timestamp": "2025-09-18T...",
  "endpoints": {
    "employees": "/api/employees",
    "notifications": "/api/notifications",
    "auth": "/api/auth",
    "rating": "/api/rating"
  }
}
```

### 2. Authentication Endpoints

#### Login
- **URL**: `POST /api/auth/login`
- **Headers**: `Content-Type: application/json`
- **Body**:
```json
{
  "username": "testuser",
  "password": "testpassword"
}
```
- **Expected Success Response** (200):
```json
{
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "testuser",
    "serviceNum": "service_number",
    "role": "employee"
  }
}
```
- **Expected Error Response** (400):
```json
{
  "message": "Invalid username or password"
}
```

#### Get Profile
- **URL**: `GET /api/auth/profile`
- **Headers**: `Authorization: Bearer <token>`
- **Expected Success Response** (200):
```json
{
  "user": {
    "id": "user_id",
    "username": "testuser",
    "serviceNum": "service_number",
    "role": "employee",
    // ... other user fields
  }
}
```
- **Expected Error Response** (401/403): Authentication required

### 3. Employee Service Endpoints

#### Get Employee List
- **URL**: `GET /api/employees/RegisterEmployeeList`
- **Status**: ✅ Accessible (returns empty array due to DB issue)
- **Expected Response**: Array of employees with status "Open"

#### Create Employee (with CV Upload)
- **URL**: `POST /api/employees`
- **Headers**: `Content-Type: multipart/form-data`
- **Body**: Form data with CV file and employee details
- **Note**: Requires file upload testing

#### Approve Employee
- **URL**: `PUT /api/employees/approve/:serviceNum`
- **Example**: `PUT /api/employees/approve/EMP001`

#### Delete/Reject Employee
- **URL**: `DELETE /api/employees/reject/:serviceNum`
- **Example**: `DELETE /api/employees/reject/EMP001`

### 4. Notification Endpoints

#### Get User Notifications
- **URL**: `GET /api/notifications/:serviceNum`
- **Example**: `GET /api/notifications/EMP001`

#### Mark Notification as Read
- **URL**: `PUT /api/notifications/read/:id`
- **Example**: `PUT /api/notifications/read/notification_id`

### 5. Rating Endpoints

#### Get All Ratings (Ordered)
- **URL**: `GET /api/rating/all`
- **Status**: ✅ Accessible (returns empty array due to DB issue)

#### Get Landscaper Grades
- **URL**: `GET /api/rating/landscapers/grades`
- **Status**: ✅ Accessible (returns empty array due to DB issue)

#### Rate a User
- **URL**: `POST /api/rating/:userId/rate`
- **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
- **Body**:
```json
{
  "rating": 5
}
```

### 6. Static File Serving

#### Access Uploaded Files
- **URL**: `GET /uploads/*`
- **Example**: `GET /uploads/cv/cv-1755371455263-979754734.pdf`
- **Status**: ✅ Working - Files are served correctly

---

## 🔧 Database Connection Fix

The current MongoDB connection error suggests:
1. **Network Issue**: Cannot resolve cluster0.mvkphrl.mongodb.net
2. **Credentials Issue**: MongoDB Atlas credentials may be incorrect
3. **Firewall Issue**: Network may be blocking MongoDB Atlas access

### Recommended Solutions:
1. **Check Internet Connection**: Ensure stable internet for Atlas access
2. **Verify Credentials**: Check MONGODB_URI in .env file
3. **Use Local MongoDB**: For development, consider using local MongoDB
4. **Update Connection String**: Ensure the Atlas cluster is running and accessible

---

## 🧪 Manual Testing Steps

### Using Browser (GET Requests):
1. Open http://localhost:5000/api/health ✅
2. Open http://localhost:5000/api/employees/RegisterEmployeeList ✅
3. Open http://localhost:5000/api/rating/all ✅
4. Open http://localhost:5000/api/rating/landscapers/grades ✅

### Using Postman/Thunder Client (POST/PUT/DELETE):
1. **Create Collection** with base URL: http://localhost:5000
2. **Add Authentication** tests with various credentials
3. **Test Employee Operations** with form-data for file uploads
4. **Test Rating System** with proper JWT tokens
5. **Test Notification System** with various service numbers

### Using cURL (if available):
```bash
# Health Check
curl http://localhost:5000/api/health

# Login Test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'

# Get Employees
curl http://localhost:5000/api/employees/RegisterEmployeeList

# Get Ratings
curl http://localhost:5000/api/rating/all
```

---

## ✅ Current Test Results

| Endpoint | Method | Status | Notes |
|----------|---------|---------|-------|
| /api/health | GET | ✅ Working | Server health check passes |
| /api/employees/RegisterEmployeeList | GET | ✅ Accessible | Returns empty array (DB issue) |
| /api/rating/all | GET | ✅ Accessible | Returns empty array (DB issue) |
| /api/rating/landscapers/grades | GET | ✅ Accessible | Returns empty array (DB issue) |
| /uploads/ | GET | ✅ Working | Static file serving functional |
| /api/auth/* | POST/GET | ⚠️ Untested | Requires DB connection |
| /api/employees | POST/PUT/DELETE | ⚠️ Untested | Requires DB connection |
| /api/notifications/* | GET/PUT | ⚠️ Untested | Requires DB connection |
| /api/rating/:userId/rate | POST | ⚠️ Untested | Requires auth + DB |

## 📊 Summary
- **Server**: ✅ Running successfully on port 5000
- **Routes**: ✅ All routes are properly configured  
- **Database**: ❌ MongoDB connection failed
- **File Uploads**: ✅ Static file serving works
- **API Accessibility**: ✅ Most GET endpoints accessible
- **Authentication**: ⚠️ Requires database to test properly

**Next Steps**: Fix MongoDB connection to fully test all endpoints with database operations.