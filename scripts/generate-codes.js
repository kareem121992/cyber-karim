// سكريبت توليد أكواد دعوة بالجملة
//
// طريقة الاستخدام:
//   node scripts/generate-codes.js 20
// (الرقم 20 هو عدد الأكواد اللي عايز تولدها، غيّره لأي رقم تحب)
//
// مهم: لازم تسجّل دخول بحسابك (نفس إيميل وباسورد بتاع حسابك في الموقع)
// عشان قواعد الحماية في Firebase تسمح بإنشاء أكواد جديدة. هتتسأل عنهم
// أول ما تشغّل السكريبت.
//
// السكريبت هيطبع الأكواد على الشاشة وكمان يحفظهم في ملف codes-output.txt
// عشان تقدر تنسخهم بسهولة وتوزعهم على الناس.

import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { writeFileSync } from "fs";
import { createInterface } from "readline";

const firebaseConfig = {
  apiKey: "AIzaSyBlqoenjBwViZ0AcMkF_3G3SzUr3j-l28I",
  authDomain: "security-3a07e.firebaseapp.com",
  projectId: "security-3a07e",
  storageBucket: "security-3a07e.firebasestorage.app",
  messagingSenderId: "350554807786",
  appId: "1:350554807786:web:5e420a5e077018b3c16693",
  measurementId: "G-93FE3X4PJD",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // من غير حروف/أرقام بتتشابه زي O,0,I,1
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(question, (answer) => { rl.close(); resolve(answer); }));
}

async function main() {
  const count = parseInt(process.argv[2]) || 10;

  console.log("لازم تسجّل دخول بحسابك الأول (نفس حساب الموقع بتاعك):\n");
  const email = await ask("الإيميل: ");
  const password = await ask("كلمة المرور: ");

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    console.error("\n❌ فشل تسجيل الدخول:", err.message);
    process.exit(1);
  }

  console.log(`\nجاري توليد ${count} كود دعوة...\n`);

  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = generateCode();
    codes.push(code);

    const ref = doc(db, "inviteCodes", code);
    await setDoc(ref, {
      used: false,
      usedBy: null,
      createdAt: Date.now(),
    });

    console.log(`✓ ${code}`);
  }

  const outputText = codes.join("\n");
  writeFileSync("codes-output.txt", outputText);

  console.log(`\n✅ تم! ${count} كود اتولدوا وانحفظوا في Firebase.`);
  console.log(`📄 الأكواد محفوظة كمان في ملف: codes-output.txt`);
  process.exit(0);
}

main().catch((err) => {
  console.error("حصل خطأ:", err.message);
  process.exit(1);
});
