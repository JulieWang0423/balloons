// 1) Paste the firebaseConfig from Firebase console here (Project settings → Your apps → Web app).
//    Until you do, the page runs in demo mode (local only, simulated audience).
export const firebaseConfig = {
  apiKey: "AIzaSyDnit7WxIlK0Yc0i760pNDCihM-fdG8ZVY",
  authDomain: "lingxi-to-be-continued.firebaseapp.com",
  projectId: "lingxi-to-be-continued",
  storageBucket: "lingxi-to-be-continued.firebasestorage.app",
  messagingSenderId: "866907663070",
  appId: "1:866907663070:web:0d30d01d6cdbe4ef69b04f"
};

// 2) Words that stop an answer from being sent or shown. Lowercase; spaces are ignored when matching.
//    Add more any time.
export const BLOCKLIST = [
  "fuck", "shit", "bitch", "cunt", "asshole", "dick", "pussy", "nigg", "fag", "retard", "whore", "slut",
  "傻逼", "煞笔", "傻b", "操你", "草你", "肏", "妈的", "你妈", "滚蛋", "贱人", "婊子", "去你的"
];

// 3) Seconds a phone must wait between two answers.
export const COOLDOWN_SECONDS = 15;
