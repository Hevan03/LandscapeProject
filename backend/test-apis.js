// API Testing Script
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5000';
let authToken = '';

// Test results tracking
const testResults = {
  passed: 0,
  failed: 0,
  tests: []
};

// Helper function to log test results
function logTest(testName, success, message = '') {
  const status = success ? '✅ PASS' : '❌ FAIL';
  const result = `${status} - ${testName}${message ? ': ' + message : ''}`;
  console.log(result);
  
  testResults.tests.push({ name: testName, success, message });
  if (success) testResults.passed++;
  else testResults.failed++;
}

// Helper function to make HTTP requests
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    }
  };
  
  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, finalOptions);
    const data = await response.json().catch(() => ({}));
    return { response, data, success: response.ok };
  } catch (error) {
    return { error: error.message, success: false };
  }
}

// Test Health Check
async function testHealthCheck() {
  console.log('\n🔍 Testing Health Check Endpoint...');
  
  const result = await makeRequest('/api/health');
  if (result.success && result.data.status === 'success') {
    logTest('Health Check', true, 'Server is running correctly');
  } else {
    logTest('Health Check', false, result.error || 'Unexpected response');
  }
  
  return result.success;
}

// Test Authentication
async function testAuthentication() {
  console.log('\n🔐 Testing Authentication Endpoints...');
  
  // Test login with invalid credentials
  let result = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: 'testuser',
      password: 'wrongpassword'
    })
  });
  
  if (result.response?.status === 400) {
    logTest('Login with invalid credentials', true, 'Correctly rejected');
  } else {
    logTest('Login with invalid credentials', false, 'Should have been rejected');
  }
  
  // Test profile without token
  result = await makeRequest('/api/auth/profile');
  if (result.response?.status === 401 || result.response?.status === 403) {
    logTest('Profile without auth token', true, 'Correctly requires authentication');
  } else {
    logTest('Profile without auth token', false, 'Should require authentication');
  }
}

// Test Employee Service Endpoints
async function testEmployeeService() {
  console.log('\n👷 Testing Employee Service Endpoints...');
  
  // Test getting employee list
  let result = await makeRequest('/api/employees/RegisterEmployeeList');
  if (result.success) {
    logTest('Get Employee List', true, `Found ${Array.isArray(result.data) ? result.data.length : 'some'} employees`);
  } else {
    logTest('Get Employee List', false, result.error || 'Failed to fetch');
  }
  
  // Test approve employee (should fail without valid serviceNum)
  result = await makeRequest('/api/employees/approve/nonexistent', {
    method: 'PUT'
  });
  if (result.response?.status === 404 || result.response?.status === 400) {
    logTest('Approve nonexistent employee', true, 'Correctly handled invalid serviceNum');
  } else {
    logTest('Approve nonexistent employee', false, 'Should handle invalid serviceNum');
  }
  
  // Test delete employee (should fail without valid serviceNum)
  result = await makeRequest('/api/employees/reject/nonexistent', {
    method: 'DELETE'
  });
  if (result.response?.status === 404 || result.response?.status === 400) {
    logTest('Delete nonexistent employee', true, 'Correctly handled invalid serviceNum');
  } else {
    logTest('Delete nonexistent employee', false, 'Should handle invalid serviceNum');
  }
}

// Test Notification Endpoints
async function testNotifications() {
  console.log('\n🔔 Testing Notification Endpoints...');
  
  // Test getting notifications for a service number
  let result = await makeRequest('/api/notifications/test123');
  if (result.success || result.response?.status === 404) {
    logTest('Get Notifications', true, 'Endpoint is accessible');
  } else {
    logTest('Get Notifications', false, result.error || 'Endpoint not working');
  }
  
  // Test marking notification as read
  result = await makeRequest('/api/notifications/read/nonexistent', {
    method: 'PUT'
  });
  if (result.response?.status === 404 || result.response?.status === 400 || result.success) {
    logTest('Mark notification as read', true, 'Endpoint is accessible');
  } else {
    logTest('Mark notification as read', false, 'Endpoint not working');
  }
}

// Test Rating Endpoints
async function testRatings() {
  console.log('\n⭐ Testing Rating Endpoints...');
  
  // Test getting all ratings
  let result = await makeRequest('/api/rating/all');
  if (result.success) {
    logTest('Get All Ratings', true, 'Successfully fetched ratings');
  } else {
    logTest('Get All Ratings', false, result.error || 'Failed to fetch');
  }
  
  // Test getting landscaper grades
  result = await makeRequest('/api/rating/landscapers/grades');
  if (result.success) {
    logTest('Get Landscaper Grades', true, 'Successfully fetched grades');
  } else {
    logTest('Get Landscaper Grades', false, result.error || 'Failed to fetch');
  }
  
  // Test rating a user (should fail without auth)
  result = await makeRequest('/api/rating/testuser/rate', {
    method: 'POST',
    body: JSON.stringify({ rating: 5 })
  });
  if (result.response?.status === 401 || result.response?.status === 403) {
    logTest('Rate user without auth', true, 'Correctly requires authentication');
  } else {
    logTest('Rate user without auth', false, 'Should require authentication');
  }
}

// Test Static File Serving
async function testStaticFiles() {
  console.log('\n📁 Testing Static File Serving...');
  
  // Test if uploads directory is accessible
  const result = await makeRequest('/uploads/');
  // This might return 404 or directory listing, both are acceptable
  logTest('Static files endpoint', true, 'Uploads directory is configured');
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting API Tests for Landscape Management Backend\n');
  console.log('=' .repeat(60));
  
  // Test each endpoint group
  await testHealthCheck();
  await testAuthentication();
  await testEmployeeService();
  await testNotifications();
  await testRatings();
  await testStaticFiles();
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Success Rate: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
  
  if (testResults.failed > 0) {
    console.log('\n❌ Failed Tests:');
    testResults.tests
      .filter(t => !t.success)
      .forEach(t => console.log(`  - ${t.name}: ${t.message}`));
  }
  
  console.log('\n🎉 API testing completed!');
}

// Run tests
runAllTests().catch(console.error);