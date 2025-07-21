// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD--iLk_JDFtSeHQ_KH3DBxLPzA_eak9Zw",
  authDomain: "it-support-dashboard-1db40.firebaseapp.com",
  projectId: "it-support-dashboard-1db40",
  storageBucket: "it-support-dashboard-1db40.appspot.com",
  messagingSenderId: "543273589175",
  appId: "1:543273589175:web:30d52dc31432d753ab7032"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and firestore instances
export const auth = getAuth(app);
export const db = getFirestore(app);