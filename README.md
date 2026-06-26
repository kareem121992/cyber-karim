# Cyber Security Academy — موقع مستقل

موقع تعليمي كامل بنظام تسجيل دخول حقيقي (Firebase Authentication) وحفظ تقدم دائم لكل مستخدم (Firestore Database).

## التشغيل محليًا (لتجربة الموقع على جهازك قبل النشر)

1. ثبّت Node.js لو لسه مش مثبت عندك: https://nodejs.org (اختار النسخة LTS)
2. افتح Terminal / Command Prompt في مجلد المشروع ده، واكتب:

```
npm install
npm run dev
```

3. هيفتح لك رابط محلي زي `http://localhost:5173` افتحه في المتصفح وجرّب.

## ضبط حماية Firestore (مهم قبل النشر الحقيقي)

دلوقتي الداتابيز شغالة على "test mode" يعني أي حد يقدر يقرأ/يكتب — ده خطر لو الموقع بقى عام. لازم تروح:

Firebase Console → Firestore Database → تاب "Rules"، واستبدل المحتوى بده:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /leaderboard/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /inviteCodes/{code} {
      // Anyone signed in (even mid-signup) can check/redeem a code, but
      // nobody can list all codes or un-use one once it's been claimed.
      allow get: if request.auth != null;
      allow list: if false;
      allow update: if request.auth != null
                    && resource.data.used == false
                    && request.resource.data.used == true
                    && request.resource.data.usedBy == request.auth.uid;
      // Only you (the admin) can create new codes. Replace YOUR_UID_HERE
      // below with your own User UID — see "إيجاد الـ UID بتاعك" تحت.
      allow create: if request.auth != null && request.auth.uid == "YOUR_UID_HERE";
      allow delete: if false;
    }
  }
}
```

ده معناه:
- كل مستخدم يقدر يقرأ ويكتب بياناته الشخصية الكاملة (`profiles`) بس، ومحدش غيره يقدر يشوفها.
- أي مستخدم مسجّل دخول يقدر يشوف لوحة الترتيب (`leaderboard`) لكل المستخدمين، لكن يقدر يكتب بياناته هو بس (الاسم والـ XP)، علشان محدش يقدر يغيّر نقط حد غيره.
- أكواد الدعوة (`inviteCodes`) محدش يقدر يشوف القائمة كاملة أو ينشئ/يمسح كود بنفسه من المتصفح — بس يقدر "يستهلك" كود موجود وغير مستخدم لمرة واحدة. إنشاء الأكواد بيتم منك إنت بس من Firebase Console مباشرة (الخطوات تحت).

اضغط "Publish" بعد ما تلصق الكود.

### إيجاد الـ UID بتاعك (مهم قبل نشر الـ Rules فوق)

القاعدة فوق فيها `YOUR_UID_HERE` — لازم تستبدلها بالـ UID الحقيقي بتاع حسابك إنت، عشان تقدر تولّد أكواد دعوة (وميقدرش حد غيرك):

1. روح لـ Firebase Console → Authentication → تاب "Users"
2. هتلاقي قائمة بكل المستخدمين المسجلين، دوّر على إيميلك إنت بالتحديد
3. جنبه عمود اسمه "User UID" — ده نص طويل غريب الشكل، انسخه
4. ارجع لقاعدة الـ Rules فوق، واستبدل `YOUR_UID_HERE` بالـ UID اللي نسخته (مع علامات التنصيص "")
5. اضغط Publish تاني

بدون الخطوة دي، السكريبت اللي هيولّد الأكواد مش هيشتغل، لأن قاعدة الحماية مش هتعرف مين أنت بالظبط.

## إنشاء أكواد دعوة جديدة

### الطريقة السريعة (لو محتاج أكواد كتير): سكريبت جاهز

فيه سكريبت بيولّد أي عدد من الأكواد دفعة واحدة، ويحطهم في Firebase تلقائيًا.

في الـ Terminal، جوا مجلد المشروع، اكتب:

```
npm run generate-codes -- 20
```

(غيّر الرقم `20` لأي عدد أكواد عايزه)

السكريبت هيطبعلك كل كود على الشاشة أول ما يتولد، وكمان يحفظهم كلهم في ملف اسمه `codes-output.txt` جوا المشروع — افتح الملف ده وانسخ الأكواد ووزّعها زي ما تحب (واتساب، إيميل، إلخ).

كل كود بيتولد بيكون عشوائي (8 حروف وأرقام)، صعب تخمينه، وبيشتغل مرة واحدة بس زي أي كود تاني.

### الطريقة اليدوية (لو محتاج كود واحد بس)

لو عايز تعمل كود واحد بس بسرعة، تقدر تعمله يدويًا من لوحة Firebase:

1. روح لـ Firebase Console → Firestore Database → تاب "Data"
2. اضغط "Start collection" (أو لو موجودة collection اسمها `inviteCodes`، افتحها واضغط "Add document")
3. **Collection ID:** اكتب `inviteCodes`
4. **Document ID:** اكتب الكود نفسه اللي عايز تديه للشخص، مثلاً `CYBER2026X9` (يفضل خليط حروف وأرقام عشان يصعب تخمينه)
5. ضيف الحقول دي بالظبط:
   - `used` → نوعه `boolean` → القيمة `false`
   - `usedBy` → نوعه `null`
   - `createdAt` → نوعه `number` → اكتب أي رقم (مش مهم قوي، بس لازم يكون موجود)
6. احفظ (Save)

كرر الخطوات دي لكل شخص عايز تديله دعوة — كل كود مختلف، وبيتقفل تلقائيًا أول ما حد يستخدمه.

## النشر على الإنترنت (مجاني)

### الطريقة الأسهل: Vercel

1. اعمل حساب مجاني على https://vercel.com (تقدر تسجل بحساب GitHub أو Google مباشرة)
2. ارفع المجلد ده كمشروع على GitHub (أو اسحب المجلد مباشرة في صفحة Vercel "Add New Project" لو بيدعم drag & drop)
3. Vercel هيكتشف إنه مشروع Vite تلقائيًا، اضغط "Deploy"
4. بعد دقيقة هيديك رابط جاهز زي `cyber-security-academy.vercel.app`

### بديل: Netlify
نفس الخطوات تقريبًا على https://netlify.com

## ملاحظات أمان مهمة

- ملف `src/firebase.js` فيه مفاتيح Firebase الخاصة بمشروعك. الـ `apiKey` ده ليس سري بشكل خطير (Firebase مصمم كده، الحماية الحقيقية في Firestore Rules فوق)، لكن لو حابب تخفيه أكتر ممكن نستخدم Environment Variables بعدين.
- متنساش تطبق الـ Firestore Rules فوق قبل ما تشارك الرابط مع أي حد، وإلا أي حد يقدر يتلاعب ببيانات أي مستخدم.

## بنية المشروع

- `src/firebase.js` — اتصال Firebase (تسجيل دخول + قاعدة بيانات)
- `src/data.js` — كل محتوى الدروس، أسئلة CTF، التمارين، الشهادات
- `src/App.jsx` — الواجهة الكاملة ومنطق التطبيق
- `src/main.jsx` — نقطة بداية React
