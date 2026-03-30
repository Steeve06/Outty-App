/* global jest, test, expect, beforeEach */

const request = require('supertest');
const express = require('express');

jest.mock('../firebase');

const { admin, db, verifyIdTokenMock } = require('../firebase');
const { verifyToken, requireRole } = require('../middleware/auth');

const app = express();
app.use(express.json());

app.get('/api/me', verifyToken, async (req, res) => {
  const userDoc = await db.collection('users').doc(req.user.uid).get();
  const userData = userDoc.data();
  res.json({ role: userData?.role });
});

app.get('/api/dashboard', verifyToken, (req, res) => {
  res.json({ message: `Welcome, ${req.user.email}` });
});

app.get('/api/admin', verifyToken, requireRole('admin'), (req, res) => {
  res.json({ message: 'Welcome to the admin panel' });
});

// Reset mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  // Restore default db mock
  db.collection.mockReturnValue({
    doc: jest.fn(() => ({
      get: jest.fn(() =>
        Promise.resolve({
          data: jest.fn(() => ({ role: 'admin', email: 'test@example.com' })),
        })
      ),
    })),
  });
});

// TEST 1: No token → 401
test('returns 401 when no token is provided', async () => {
  const res = await request(app).get('/api/me');
  expect(res.statusCode).toBe(401);
  expect(res.body.error).toBe('No token provided');
});

// TEST 2: Invalid token → 401
test('returns 401 for invalid token', async () => {
  verifyIdTokenMock.mockRejectedValueOnce(new Error('Invalid token'));

  const res = await request(app)
    .get('/api/me')
    .set('Authorization', 'Bearer invalidtoken');

  expect(res.statusCode).toBe(401);
  expect(res.body.error).toBe('Invalid token');
});

// TEST 3: Valid token returns role
test('returns user role with valid token', async () => {
  verifyIdTokenMock.mockResolvedValueOnce({
    uid: 'user123',
    email: 'test@example.com',
  });

  const res = await request(app)
    .get('/api/me')
    .set('Authorization', 'Bearer validtoken');

  expect(res.statusCode).toBe(200);
  expect(res.body.role).toBe('admin');
});

// TEST 4: Valid user accesses dashboard
test('allows logged-in user to access dashboard', async () => {
  verifyIdTokenMock.mockResolvedValueOnce({
    uid: 'user123',
    email: 'test@example.com',
  });

  const res = await request(app)
    .get('/api/dashboard')
    .set('Authorization', 'Bearer validtoken');

  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe('Welcome, test@example.com');
});

// TEST 5: Non-admin blocked from admin route
test('blocks non-admin from admin route', async () => {
  verifyIdTokenMock.mockResolvedValueOnce({
    uid: 'user123',
    email: 'test@example.com',
  });

  db.collection.mockReturnValueOnce({
    doc: jest.fn(() => ({
      get: jest.fn(() =>
        Promise.resolve({
          data: jest.fn(() => ({ role: 'user' })),
        })
      ),
    })),
  });

  const res = await request(app)
    .get('/api/admin')
    .set('Authorization', 'Bearer validtoken');

  expect(res.statusCode).toBe(403);
  expect(res.body.error).toBe('Access denied');
});

// TEST 6: Admin accesses admin route
test('allows admin to access admin route', async () => {
  verifyIdTokenMock.mockResolvedValueOnce({
    uid: 'user123',
    email: 'test@example.com',
  });

  const res = await request(app)
    .get('/api/admin')
    .set('Authorization', 'Bearer validtoken');

  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe('Welcome to the admin panel');
});