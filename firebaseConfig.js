import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
    apiKey: "AIzaSyD95Ocg_D8oW_sCgLkAF7ihxlCMCDz3voM",
    authDomain: "projectofinalbuild.firebaseapp.com",
    projectId: "projectofinalbuild",
    storageBucket: "projectofinalbuild.firebasestorage.app",
    messagingSenderId: "598107385551",
    appId: "1:598107385551:web:901ae6c225962ffb3a11ba",
    measurementId: "G-Y57MQBGN5N"
};
  

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);


export { messaging, getToken, onMessage };
