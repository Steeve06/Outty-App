# PBI 01: SSO Authentication (5 Points) 
To achieve the 5-point goal, PBI 01 has been broken down into specific technical tasks for the team.
## Task 1.1: Firebase Project Setup

Configure Google and Apple sign-in providers in the Firebase Console.

## Task 1.2: Frontend Provider Integration (React Native)

Install and configure @react-native-firebase/auth and implement the "Login with Google" button UI.

## Task 1.3: Backend Auth Middleware (Node.js)

Create a middleware function in Express to verify Firebase ID tokens using the firebase-admin SDK.

## Task 1.4: User Shadow Table (PostgreSQL)

Initialize the PostgreSQL database and create a users table to store the uid and basic SSO metadata.
+1

## Task 1.5: JWT & Session Management

Establish secure session handling between the mobile client and the Node.js API.

## Task 1.6: Security Testing

Verify that unauthenticated requests to protected routes are rejected with a 401 status.
