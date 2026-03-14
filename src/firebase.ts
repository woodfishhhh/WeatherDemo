import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import {
  appEnv,
  hasFirebaseConfig as hasFirebaseEnvConfig,
  isPlaceholderFirebaseValue,
} from "@/config/env";

const firebaseConfig = {
  apiKey: appEnv.firebase.apiKey,
  authDomain: appEnv.firebase.authDomain,
  projectId: appEnv.firebase.projectId,
  storageBucket: appEnv.firebase.storageBucket,
  messagingSenderId: appEnv.firebase.messagingSenderId,
  appId: appEnv.firebase.appId,
  measurementId: appEnv.firebase.measurementId,
};

export const hasFirebaseConfig = (): boolean =>
  hasFirebaseEnvConfig() &&
  !isPlaceholderFirebaseValue(firebaseConfig.apiKey) &&
  !isPlaceholderFirebaseValue(firebaseConfig.authDomain) &&
  !isPlaceholderFirebaseValue(firebaseConfig.projectId) &&
  !isPlaceholderFirebaseValue(firebaseConfig.storageBucket) &&
  !isPlaceholderFirebaseValue(firebaseConfig.messagingSenderId) &&
  !isPlaceholderFirebaseValue(firebaseConfig.appId);

export const firebaseApp = hasFirebaseConfig() ? initializeApp(firebaseConfig) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;

// Analytics may be unavailable in some environments, so initialize defensively.
export const firebaseAnalytics = !firebaseApp
  ? Promise.resolve(null)
  : isSupported().then((supported) => {
      if (!supported) {
        return null;
      }

      return getAnalytics(firebaseApp);
    });
