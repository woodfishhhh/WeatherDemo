import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { appEnv } from "@/config/env";

const firebaseConfig = {
  apiKey: appEnv.firebase.apiKey,
  authDomain: appEnv.firebase.authDomain,
  projectId: appEnv.firebase.projectId,
  storageBucket: appEnv.firebase.storageBucket,
  messagingSenderId: appEnv.firebase.messagingSenderId,
  appId: appEnv.firebase.appId,
  measurementId: appEnv.firebase.measurementId,
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
