// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyC7cC-1-r8MLK7Mayn5a0k8sSOLnQ5Xd_o",
    authDomain: "education-app-23bb7.firebaseapp.com",
    projectId: "education-app-23bb7",
    storageBucket: "education-app-23bb7.appspot.com",
    messagingSenderId: "1056754366034",
    appId: "1:1056754366034:web:320d564f437fc58a71d18b",
    measurementId: "G-DW424M7ZD4"
  };

const analytics = getAnalytics(app);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
