// firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";  // ✅ Only auth, no Google provider needed
import { getFirestore } from "firebase/firestore";

// ✅ Your existing config
const firebaseConfig = {
  apiKey: "AIzaSyCgvQyOynar6mZTQqfCQhsbMBYSBQKG-JM",
  authDomain: "ahaar-bea9e.firebaseapp.com",
  projectId: "ahaar-bea9e",
  storageBucket: "ahaar-bea9e.appspot.com",
  messagingSenderId: "716431663736",
  appId: "1:716431663736:web:6ceed59ff7a140f0edc38d",
  measurementId: "G-NLD1CCNBEY"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Initialize services
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Export to use in Login/Register components
export { auth, db };
