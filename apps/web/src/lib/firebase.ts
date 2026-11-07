// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCE4tUP8sNfuP6liE308Gl3jb0X7fdN0ik",
  authDomain: "depark-hackaton.firebaseapp.com",
  projectId: "depark-hackaton",
  storageBucket: "depark-hackaton.firebasestorage.app",
  messagingSenderId: "929422487990",
  appId: "1:929422487990:web:7c0fec5f88250929b2d117",
  measurementId: "G-7N7KPSD2G1",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export default firebaseApp;
