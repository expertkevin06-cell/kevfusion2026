/* Cloud optionnel : push temps réel + fond/photos diffusés + révocations.
   Firebase → Realtime Database → Auth (Anonyme + Email) → Cloud Messaging (VAPID). */
globalThis.KF_FIREBASE = {
  enabled: false,
  apiKey: "", authDomain: "", databaseURL: "", projectId: "",
  storageBucket: "", messagingSenderId: "", appId: "",
  vapidKey: ""
};
