/* global jest */

const verifyIdTokenMock = jest.fn();

const admin = {
  auth: jest.fn(() => ({
    verifyIdToken: verifyIdTokenMock,
  })),
};

const db = {
  collection: jest.fn(() => ({
    doc: jest.fn(() => ({
      get: jest.fn(() =>
        Promise.resolve({
          data: jest.fn(() => ({ role: 'admin', email: 'test@example.com' })),
        })
      ),
    })),
  })),
};

module.exports = { admin, db, verifyIdTokenMock };