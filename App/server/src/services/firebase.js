var admin = require("firebase-admin");
var serviceAccount = require("../../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "outty-dev-3a0b1.appspot.com"
});

const db = admin.firestore();
const bucket = admin.storage().bucket('outty-dev-3a0b1.appspot.com');

module.exports = { admin, db, bucket}; 