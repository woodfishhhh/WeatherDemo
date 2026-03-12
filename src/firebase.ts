import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "REMOVED_API_KEY",
  authDomain: "woodweather-236b7.firebaseapp.com",
  projectId: "woodweather-236b7",
  storageBucket: "woodweather-236b7.firebasestorage.app",
  messagingSenderId: "623233743588",
  appId: "1:623233743588:web:f342a8f79cc4f08f644af1",
  measurementId: "G-DX7S386NF7",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const db = getFirestore(firebaseApp);

// Analytics may be unavailable in some environments, so initialize defensively.
export const firebaseAnalytics = isSupported().then((supported) => {
  if (!supported) {
    return null;
  }

  return getAnalytics(firebaseApp);
});
