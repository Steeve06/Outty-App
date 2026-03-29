// Frontend/jest.config.js
export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
  },
  setupFilesAfterEnv: [
    '<rootDir>/jest.setup.js'
  ],
  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/__mocks__/fileMock.js',
    '^firebase/auth$': '<rootDir>/__mocks__/firebase-auth.js',
    '^firebase/app$': '<rootDir>/__mocks__/firebase-app.js',
  },
};