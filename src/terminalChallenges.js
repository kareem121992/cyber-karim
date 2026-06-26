// تحديات Terminal موجّهة — كل واحدة مرتبطة باسم مفهوم من قسم Linux أو Bash
// في data.js. لو اسم المفهوم (item.n) موجود هنا، هيظهر Terminal تفاعلي
// تحت شرح المفهوم في شاشة الدرس.

export const TERMINAL_CHALLENGES = {
  // ---- من قسم Linux ----
  "pwd - أين أنا": {
    instruction: "اكتب الأمر اللي يطبعلك مكانك الحالي في النظام",
    check: (cmd) => cmd.trim() === "pwd",
    hint: "الأمر هو: pwd",
  },
  "ls - عرض الملفات": {
    instruction: "اكتب أمر يعرضلك محتوى المجلد الحالي",
    check: (cmd) => cmd.trim().startsWith("ls"),
    hint: "الأمر هو: ls",
  },
  "cd - التنقل بين المجلدات": {
    instruction: "ادخل لمجلد scripts الموجود في المجلد الحالي",
    check: (cmd, result, newState) => cmd.trim() === "cd scripts" && newState.cwd.includes("scripts"),
    hint: "الأمر هو: cd scripts",
  },
  "mkdir - إنشاء مجلد": {
    instruction: "أنشئ مجلد جديد اسمه projects",
    check: (cmd) => /^mkdir\s+projects$/.test(cmd.trim()),
    hint: "الأمر هو: mkdir projects",
  },
  "touch - إنشاء ملف فارغ": {
    instruction: "أنشئ ملف فاضي اسمه test.txt",
    check: (cmd) => /^touch\s+test\.txt$/.test(cmd.trim()),
    hint: "الأمر هو: touch test.txt",
  },
  "cat - عرض محتوى ملف": {
    instruction: "اعرض محتوى ملف readme.txt",
    check: (cmd) => cmd.trim() === "cat readme.txt",
    hint: "الأمر هو: cat readme.txt",
  },
  "rm - حذف ملفات": {
    instruction: "احذف ملف notes.txt",
    check: (cmd) => cmd.trim() === "rm notes.txt",
    hint: "الأمر هو: rm notes.txt",
  },
  "whoami - من أنا": {
    instruction: "اعرف انت مسجل دخول بأنهي مستخدم",
    check: (cmd) => cmd.trim() === "whoami",
    hint: "الأمر هو: whoami",
  },
  "grep - البحث داخل الملفات": {
    instruction: "دوّر على كلمة root جوا ملف /etc/passwd",
    check: (cmd) => cmd.trim() === "grep root /etc/passwd",
    hint: "الأمر هو: grep root /etc/passwd",
  },
  "head و tail": {
    instruction: "اعرض أول 10 سطور من ملف /var/log/auth.log",
    check: (cmd) => cmd.trim() === "head /var/log/auth.log",
    hint: "الأمر هو: head /var/log/auth.log",
  },

  // ---- من قسم Bash ----
  "Pipe - توصيل الأوامر": {
    instruction: "ابحث عن كلمة hacker جوا /etc/passwd",
    check: (cmd) => cmd.trim() === "grep hacker /etc/passwd",
    hint: "الأمر هو: grep hacker /etc/passwd",
  },
  "wc - عد السطور والكلمات": {
    instruction: "اعرف عدد السطور والكلمات في ملف readme.txt",
    check: (cmd) => cmd.trim() === "wc readme.txt",
    hint: "الأمر هو: wc readme.txt",
  },
};

// دالة مساعدة بترجع challenge object لو موجود لاسم المفهوم ده
export function getChallengeFor(itemName) {
  return TERMINAL_CHALLENGES[itemName] || null;
}
