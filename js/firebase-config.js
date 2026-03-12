import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAJX8qfKEuppyQAlna1EHAuELOXiBZcp_E",
  authDomain: "exam-conytrol.firebaseapp.com",
  projectId: "exam-conytrol",
  storageBucket: "exam-conytrol.firebasestorage.app",
  messagingSenderId: "689926425079",
  appId: "1:689926425079:web:a0a5a64261de651ac7c6f2",
  measurementId: "G-2XN374ZXKN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Expose to window for global access in scripts
window.firebase_db = db;
window.firebase_auth = auth;
window.google_provider = googleProvider;

// Expose individual Firestore methods
window.fb_collection = collection;
window.fb_query = query;
window.fb_where = where;
window.fb_getDocs = getDocs;
window.fb_signInWithPopup = signInWithPopup;

console.log("🔥 Firebase Configuration Attached and Ready");
