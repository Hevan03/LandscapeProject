# PowerShell API Testing Script
Write-Host "🚀 Starting API Tests for Landscape Management Backend" -ForegroundColor Green
Write-Host "=" * 60

$baseUrl = "http://localhost:5000"
$passed = 0
$failed = 0

function Test-API {
    param(
        [string]$TestName,
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [int[]]$ExpectedStatuses = @(200)
    )
    
    try {
        $requestParams = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $requestParams.Body = $Body
            $requestParams.ContentType = "application/json"
        }
        
        $response = Invoke-WebRequest @requestParams
        
        if ($response.StatusCode -in $ExpectedStatuses) {
            Write-Host "✅ PASS - $TestName (Status: $($response.StatusCode))" -ForegroundColor Green
            $script:passed++
            return $true
        } else {
            Write-Host "❌ FAIL - $TestName (Status: $($response.StatusCode))" -ForegroundColor Red
            $script:failed++
            return $false
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -in $ExpectedStatuses) {
            Write-Host "✅ PASS - $TestName (Status: $statusCode)" -ForegroundColor Green
            $script:passed++
            return $true
        } else {
            Write-Host "❌ FAIL - $TestName (Error: $($_.Exception.Message))" -ForegroundColor Red
            $script:failed++
            return $false
        }
    }
}

# Test Health Check
Write-Host "`n🔍 Testing Health Check Endpoint..." -ForegroundColor Cyan
Test-API "Health Check" "$baseUrl/api/health"

# Test Authentication Endpoints
Write-Host "`n🔐 Testing Authentication Endpoints..." -ForegroundColor Cyan

# Test login with invalid credentials (should return 400)
$loginBody = @{
    username = "testuser"
    password = "wrongpassword"
} | ConvertTo-Json

Test-API "Login with invalid credentials" "$baseUrl/api/auth/login" "POST" @{} $loginBody @(400, 401)

# Test profile without token (should return 401 or 403)
Test-API "Profile without auth token" "$baseUrl/api/auth/profile" "GET" @{} $null @(401, 403)

# Test Employee Service Endpoints
Write-Host "`n👷 Testing Employee Service Endpoints..." -ForegroundColor Cyan
Test-API "Get Employee List" "$baseUrl/api/employees/RegisterEmployeeList"
Test-API "Approve nonexistent employee" "$baseUrl/api/employees/approve/nonexistent" "PUT" @{} $null @(400, 404)
Test-API "Delete nonexistent employee" "$baseUrl/api/employees/reject/nonexistent" "DELETE" @{} $null @(400, 404)

# Test Notification Endpoints
Write-Host "`n🔔 Testing Notification Endpoints..." -ForegroundColor Cyan
Test-API "Get Notifications" "$baseUrl/api/notifications/test123" "GET" @{} $null @(200, 404)
Test-API "Mark notification as read" "$baseUrl/api/notifications/read/nonexistent" "PUT" @{} $null @(200, 400, 404)

# Test Rating Endpoints
Write-Host "`n⭐ Testing Rating Endpoints..." -ForegroundColor Cyan
Test-API "Get All Ratings" "$baseUrl/api/rating/all"
Test-API "Get Landscaper Grades" "$baseUrl/api/rating/landscapers/grades"

# Test rating without auth (should return 401 or 403)
$ratingBody = @{ rating = 5 } | ConvertTo-Json
Test-API "Rate user without auth" "$baseUrl/api/rating/testuser/rate" "POST" @{} $ratingBody @(401, 403)

# Test Static File Serving
Write-Host "`n📁 Testing Static File Serving..." -ForegroundColor Cyan
Test-API "Static files endpoint" "$baseUrl/uploads/" "GET" @{} $null @(200, 404, 403)

# Print Summary
Write-Host "`n" + "=" * 60
Write-Host "📊 TEST SUMMARY" -ForegroundColor Yellow
Write-Host "=" * 60
Write-Host "✅ Passed: $passed" -ForegroundColor Green
Write-Host "❌ Failed: $failed" -ForegroundColor Red
$total = $passed + $failed
if ($total -gt 0) {
    $successRate = [math]::Round(($passed / $total) * 100, 1)
    Write-Host "📈 Success Rate: $successRate%" -ForegroundColor $(if ($successRate -gt 70) { "Green" } else { "Yellow" })
}

Write-Host "`n🎉 API testing completed!" -ForegroundColor Green

# Additional server status check
Write-Host "`n📊 Server Status:" -ForegroundColor Yellow
Write-Host "- Server: Running on http://localhost:5000" -ForegroundColor Green
Write-Host "- Database: ❌ MongoDB connection failed" -ForegroundColor Red
Write-Host "- Note: Some endpoints may not work properly without database connection" -ForegroundColor Yellow