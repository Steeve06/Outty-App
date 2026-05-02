var admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "outty-dev-3a0b1.firebasestorage.app"
});

const db = admin.firestore();
const bucket = admin.storage().bucket('outty-dev-3a0b1.firebasestorage.app');

module.exports = { admin, db, bucket };