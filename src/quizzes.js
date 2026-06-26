// Quiz Component for Cyber Academy
export const QUIZZES = {
  linux: [
    { q: "ما هو الأمر اللي يعرضلك المجلد الحالي؟", options: ["ls", "cd", "pwd", "mkdir"], correct: 2, explanation: "pwd = Print Working Directory — يطبع المسار الحالي" },
    { q: "كيفية تغيير صلاحيات الملف لـ rwxr-xr-x؟", options: ["chmod 755 file", "chmod 777 file", "chmod 644 file", "chmod 600 file"], correct: 0, explanation: "755 = rwxr-xr-x (4+2+1=7, 4+1=5, 4+1=5)" },
    { q: "أمر إنشاء مجلد جديد:", options: ["mkfile", "mkdir", "touch", "create"], correct: 1, explanation: "mkdir = Make Directory — ينشئ مجلد جديد" },
    { q: "كيفية البحث عن ملفات بنمط معين؟", options: ["ls | grep", "find / -name", "search -f", "locate"], correct: 1, explanation: "find / -name '*.txt' — أقوى أداة للبحث" },
    { q: "أمر عرض الصلاحيات المتاحة لـ sudo:", options: ["sudo -i", "sudo -l", "sudo su", "sudo passwd"], correct: 1, explanation: "sudo -l — يعرض الصلاحيات والأوامر المسموحة" }
  ],
  bash: [
    { q: "كيفية إنشاء متغير في Bash؟", options: ["var name = value", "NAME=value", "set NAME value", "define NAME"], correct: 1, explanation: "NAME=value — بدون مسافات حول =" },
    { q: "رمز الـ Pipe في Bash:", options: [">", "<", "|", "&"], correct: 2, explanation: "| — يمرر output من أمر لآخر" },
    { q: "أمر الحلقة for في Bash:", options: ["for i in list; do", "for (i in list)", "foreach i", "loop i"], correct: 0, explanation: "for i in list; do ... done — الصيغة الصحيحة" },
    { q: "كيف تشيل آخر سطر من ملف؟", options: ["tail -1 file", "head -1 file", "last file", "end file"], correct: 0, explanation: "tail -1 يجيب آخر سطر، tail -n يجيب آخر n سطر" },
    { q: "رمز تحويل output لملف (مع حذف المحتوى القديم):", options: [">>", ">", "|", "&"], correct: 1, explanation: "> يكتب على الملف من الأول، >> يضيف في الآخر" }
  ],
  python_basics: [
    { q: "كيف تطبع 'Hello' في Python؟", options: ["echo 'Hello'", "print('Hello')", "console.log('Hello')", "puts 'Hello'"], correct: 1, explanation: "print() هي دالة الطباعة في Python" },
    { q: "نوع البيانات 3.14 في Python:", options: ["int", "str", "float", "double"], correct: 2, explanation: "float = أعداد عشرية في Python" },
    { q: "كيف تنشئ قائمة (list) في Python؟", options: ["{1,2,3}", "[1,2,3]", "(1,2,3)", "<1,2,3>"], correct: 1, explanation: "[] للـ list، {} للـ dict/set، () للـ tuple" },
    { q: "أمر تثبيت مكتبة في Python:", options: ["npm install", "pip install", "apt install", "get install"], correct: 1, explanation: "pip install اسم_المكتبة — مدير حزم Python" },
    { q: "كيف تعرّف دالة في Python؟", options: ["function myFunc():", "def myFunc():", "func myFunc():", "define myFunc():"], correct: 1, explanation: "def اسم_الدالة(): — الكلمة المحجوزة في Python" }
  ],
  python_functions: [
    { q: "ما معنى *args في Python؟", options: ["متغير عادي", "قائمة من الـ arguments", "قاموس من الـ arguments", "خطأ"], correct: 1, explanation: "*args بتسمح للدالة تاخد أي عدد من الـ arguments كـ tuple" },
    { q: "ما معنى **kwargs؟", options: ["قائمة", "قاموس key=value", "أرقام فقط", "خطأ"], correct: 1, explanation: "**kwargs = keyword arguments — بتجيها كـ dictionary" },
    { q: "كيف ترجع قيمة من دالة؟", options: ["send", "return", "output", "give"], correct: 1, explanation: "return القيمة — يرجّع القيمة ويوقف الدالة" },
    { q: "ما هو الـ lambda في Python؟", options: ["حلقة", "دالة مجهولة صغيرة", "متغير", "class"], correct: 1, explanation: "lambda x: x*2 — دالة سريعة في سطر واحد" },
    { q: "ما هو decorator في Python؟", options: ["لون الكود", "دالة بتعدّل دالة تانية", "نوع بيانات", "حلقة"], correct: 1, explanation: "@decorator — بيضيف وظيفة لدالة بدون ما تغيّرها" }
  ],
  python_oop: [
    { q: "ماذا تعني OOP؟", options: ["Object Oriented Programming", "Output Operation Process", "Online Open Platform", "Operating Over Protocol"], correct: 0, explanation: "OOP = البرمجة الكائنية — أساس Python الحديث" },
    { q: "ما هو الـ __init__ في Python؟", options: ["دالة حذف الـ object", "constructor — بيتشغل عند إنشاء object", "دالة خاصة بالطباعة", "import خاص"], correct: 1, explanation: "__init__ = constructor — بيتنادى تلقائياً عند new object" },
    { q: "ما معنى self في Python class؟", options: ["الـ class نفسها", "الـ object الحالي", "متغير عادي", "خطأ"], correct: 1, explanation: "self بيشير للـ instance الحالي — زي this في لغات تانية" },
    { q: "ما هو الـ inheritance؟", options: ["نسخ الكود", "class بترث خصائص class تانية", "حذف class", "دمج ملفين"], correct: 1, explanation: "class Child(Parent): — الـ Child بيرث كل حاجة في الـ Parent" },
    { q: "ما هو الـ polymorphism؟", options: ["نوع بيانات", "نفس الدالة بتتصرف مختلف على objects مختلفة", "مكتبة Python", "خطأ في الكود"], correct: 1, explanation: "Polymorphism = نفس الاسم، سلوك مختلف حسب الـ object" }
  ],
  hacking: [
    { q: "ما هو الـ Footprinting؟", options: ["طباعة معلومات", "جمع معلومات عن الهدف قبل الاختراق", "حذف الآثار", "تشفير البيانات"], correct: 1, explanation: "Footprinting = المرحلة الأولى — جمع معلومات عن الهدف" },
    { q: "ما هو الـ CVE؟", options: ["نوع هجوم", "قاعدة بيانات للثغرات المعروفة", "أداة اختراق", "بروتوكول شبكة"], correct: 1, explanation: "CVE = Common Vulnerabilities and Exposures — رقم تعريفي لكل ثغرة" },
    { q: "ما هو الـ Payload في الاختراق؟", options: ["رسالة خطأ", "الكود الخبيث اللي بيتنفذ بعد الاستغلال", "اسم الضحية", "نوع الشبكة"], correct: 1, explanation: "Payload = الحمولة — الكود اللي بيتنفذ بعد نجاح الاستغلال" },
    { q: "ما هو الـ Privilege Escalation؟", options: ["تسجيل الخروج", "رفع الصلاحيات من user عادي لـ root/admin", "تثبيت برنامج", "فتح port"], correct: 1, explanation: "Privilege Escalation = ترقية الصلاحيات بعد الوصول للنظام" },
    { q: "ما هو الـ Zero-Day؟", options: ["ثغرة قديمة", "ثغرة غير معروفة للمصنّع بعد", "هجوم بالشبكة", "فيروس معروف"], correct: 1, explanation: "Zero-Day = ثغرة مش متعلّقة بعد — أخطر أنواع الثغرات" }
  ],
  webpen: [
    { q: "ما هو الـ SQL Injection؟", options: ["هجوم على الشبكة", "حقن كود SQL في input لاختراق قاعدة البيانات", "فيروس", "تشفير"], correct: 1, explanation: "SQL Injection = أخطر ثغرة في تطبيقات الويب — OWASP #3" },
    { q: "ما هو الـ XSS؟", options: ["بروتوكول", "Cross-Site Scripting — حقن JavaScript في صفحة ويب", "نوع تشفير", "هجوم شبكة"], correct: 1, explanation: "XSS = Cross-Site Scripting — تنفيذ JavaScript في متصفح الضحية" },
    { q: "ما هو الـ CSRF؟", options: ["نوع قاعدة بيانات", "هجوم يخلي المستخدم ينفذ طلبات بدون علمه", "بروتوكول تشفير", "أداة scanning"], correct: 1, explanation: "CSRF = Cross-Site Request Forgery — تزوير طلبات المستخدم" },
    { q: "ما هو أداة Burp Suite؟", options: ["أداة تشفير", "proxy لاعتراض وتعديل طلبات HTTP", "نظام تشغيل", "قاعدة بيانات"], correct: 1, explanation: "Burp Suite = أشهر أداة لاختبار أمان تطبيقات الويب" },
    { q: "ما هو الـ Directory Traversal؟", options: ["إنشاء مجلدات", "الوصول لملفات خارج المجلد المسموح", "حذف موقع", "تشفير ملفات"], correct: 1, explanation: "../../../etc/passwd — التنقل للخارج للوصول لملفات حساسة" }
  ],
  netbasics: [
    { q: "ما هو الـ IP Address؟", options: ["اسم الجهاز", "عنوان رقمي فريد لكل جهاز على الشبكة", "كلمة مرور الشبكة", "نوع كابل"], correct: 1, explanation: "IP = Internet Protocol Address — هوية كل جهاز على الشبكة" },
    { q: "ما الفرق بين TCP و UDP؟", options: ["لا فرق", "TCP موثوق وبطيء، UDP سريع وغير موثوق", "UDP أبطأ", "TCP للفيديو فقط"], correct: 1, explanation: "TCP = مضمون التسليم، UDP = سريع بدون ضمان — كل واحد له استخداماته" },
    { q: "ما هو الـ DNS؟", options: ["نوع كابل", "يحوّل أسماء النطاقات لـ IP addresses", "جدار حماية", "بروتوكول تشفير"], correct: 1, explanation: "DNS = Domain Name System — دفتر عناوين الإنترنت" },
    { q: "ما هو الـ Port 443؟", options: ["FTP", "HTTP", "HTTPS", "SSH"], correct: 2, explanation: "443 = HTTPS — الاتصال المشفّر بالمواقع" },
    { q: "ما هو الـ Subnet Mask؟", options: ["عنوان الموقع", "يحدد الجزء الخاص بالشبكة والجزء الخاص بالجهاز في الـ IP", "اسم الشبكة", "كلمة مرور"], correct: 1, explanation: "255.255.255.0 مثلاً — يحدد حدود الشبكة المحلية" }
  ],
  netpen: [
    { q: "ما هو الـ Nmap؟", options: ["محرر نصوص", "أداة مسح الشبكات والمنافذ", "متصفح", "قاعدة بيانات"], correct: 1, explanation: "Nmap = Network Mapper — أشهر أداة لمسح الشبكات واكتشاف الأجهزة" },
    { q: "ما هو الـ ARP Spoofing؟", options: ["تشفير الشبكة", "خداع جدول ARP لاعتراض حركة البيانات", "تسريع الشبكة", "إنشاء شبكة"], correct: 1, explanation: "ARP Spoofing = انتحال هوية جهاز على الشبكة المحلية" },
    { q: "ما هو الـ Man-in-the-Middle؟", options: ["هجوم على قاعدة بيانات", "المهاجم يضع نفسه بين طرفين للتجسس", "هجوم على الموقع", "تشفير"], correct: 1, explanation: "MITM = المهاجم يعترض الاتصال بين طرفين بدون علمهم" },
    { q: "ما هو الـ Wireshark؟", options: ["أداة اختراق مواقع", "أداة تحليل حركة الشبكة (packet analyzer)", "جدار حماية", "VPN"], correct: 1, explanation: "Wireshark = أشهر أداة لتحليل packets الشبكة" },
    { q: "ما هو الـ DoS attack؟", options: ["سرقة كلمات المرور", "إغراق الخادم بطلبات لتعطيله", "اختراق قاعدة بيانات", "تشفير الملفات"], correct: 1, explanation: "DoS = Denial of Service — تعطيل الخدمة بإغراقها بالطلبات" }
  ],
  windows: [
    { q: "ما هو الـ Active Directory؟", options: ["مجلد في Windows", "نظام إدارة المستخدمين والأجهزة في الشبكات", "متصفح Microsoft", "نوع فيروس"], correct: 1, explanation: "Active Directory = نظام Microsoft لإدارة المستخدمين والصلاحيات في الشركات" },
    { q: "ما هو الـ Registry في Windows؟", options: ["سجل للبرامج المثبّتة", "قاعدة بيانات تحفظ إعدادات النظام والبرامج", "نوع ملف", "أمر CMD"], correct: 1, explanation: "Registry = قلب Windows — يحفظ كل إعدادات النظام" },
    { q: "ما هو الـ PowerShell؟", options: ["برنامج تحرير صور", "shell قوي لأتمتة مهام Windows", "متصفح", "مضاد فيروسات"], correct: 1, explanation: "PowerShell = CMD متطور — أداة أساسية للـ pentester على Windows" },
    { q: "ما هو الـ Pass-the-Hash؟", options: ["تمرير ملف", "استخدام hash كلمة المرور مباشرة للدخول بدون كسرها", "نوع تشفير", "هجوم شبكة"], correct: 1, explanation: "PtH = استخدام NTLM hash للمصادقة مباشرة — هجوم شائع على Windows" },
    { q: "ما هو الـ UAC في Windows؟", options: ["برنامج تشفير", "User Account Control — يطلب إذن قبل تنفيذ أي عملية حساسة", "نوع فيروس", "بروتوكول شبكة"], correct: 1, explanation: "UAC = نظام الحماية اللي بيظهر نافذة 'هل تسمح لهذا التطبيق'" }
  ],
  android: [
    { q: "ما هو الـ APK؟", options: ["نوع صورة", "ملف تثبيت التطبيقات على Android", "بروتوكول شبكة", "نوع قاعدة بيانات"], correct: 1, explanation: "APK = Android Package Kit — ملف التثبيت في Android" },
    { q: "ما هو الـ ADB؟", options: ["نوع فيروس", "Android Debug Bridge — أداة التحكم في Android من الكمبيوتر", "متجر تطبيقات", "نوع شاشة"], correct: 1, explanation: "ADB = Android Debug Bridge — تحكم كامل في الجهاز من terminal" },
    { q: "ما هو الـ Root في Android؟", options: ["مجلد النظام", "الحصول على صلاحيات كاملة على النظام", "نوع شاشة", "إعادة تشغيل"], correct: 1, explanation: "Root = صلاحيات superuser على Android — مثل sudo في Linux" },
    { q: "ما هو الـ Drozer؟", options: ["لعبة", "إطار اختبار أمان تطبيقات Android", "متجر تطبيقات", "نوع فيروس"], correct: 1, explanation: "Drozer = أشهر أداة لاختبار أمان تطبيقات Android" },
    { q: "ما هو الـ Smali؟", options: ["لغة برمجة جديدة", "لغة assembly لـ Android Dalvik VM", "نوع قاعدة بيانات", "بروتوكول شبكة"], correct: 1, explanation: "Smali = لغة الـ bytecode في Android — تستخدمها عند reverse engineering" }
  ],
  osint: [
    { q: "ماذا يعني OSINT؟", options: ["Open Source Intelligence", "Online Security Internet Tool", "Operating System Interface", "Output Signal Input"], correct: 0, explanation: "OSINT = Open Source Intelligence — جمع المعلومات من مصادر مفتوحة عامة" },
    { q: "ما هو الـ Google Dorking؟", options: ["حذف نتائج جوجل", "استخدام عمليات بحث متقدمة للعثور على معلومات حساسة", "إنشاء موقع", "هجوم على جوجل"], correct: 1, explanation: "Google Dorks = site:, filetype:, inurl: — للبحث بدقة عن معلومات مخفية" },
    { q: "ما هو الـ Shodan؟", options: ["موقع أخبار", "محرك بحث للأجهزة المتصلة بالإنترنت", "شبكة اجتماعية", "أداة تشفير"], correct: 1, explanation: "Shodan = جوجل الهاكرز — يبحث عن كاميرات، سيرفرات، وأجهزة مكشوفة" },
    { q: "ما هو الـ Maltego؟", options: ["لغة برمجة", "أداة رسم علاقات بين المعلومات (link analysis)", "متصفح", "VPN"], correct: 1, explanation: "Maltego = يرسم خريطة العلاقات بين الأشخاص والمواقع والشركات" },
    { q: "ما هو الـ Wayback Machine؟", options: ["آلة زمن", "أرشيف الإنترنت — يحفظ نسخ قديمة من المواقع", "أداة hacking", "نوع شبكة"], correct: 1, explanation: "archive.org/web — تقدر تشوف أي موقع زي ما كان من سنين" }
  ],
  cloud: [
    { q: "ما هو الـ S3 Bucket في AWS؟", options: ["نوع سيرفر", "خدمة تخزين ملفات في السحابة من Amazon", "قاعدة بيانات", "شبكة افتراضية"], correct: 1, explanation: "S3 = Simple Storage Service — أشهر خدمة تخزين في AWS" },
    { q: "ما هو الـ IAM في AWS؟", options: ["نوع تشفير", "Identity and Access Management — إدارة المستخدمين والصلاحيات", "قاعدة بيانات", "شبكة"], correct: 1, explanation: "IAM = التحكم في من يصل لإيه في AWS" },
    { q: "ما هو الـ Misconfigured S3 Bucket؟", options: ["خطأ في الشبكة", "bucket مفتوح للعموم بدون قصد — ثغرة شائعة", "نوع تشفير", "هجوم DDoS"], correct: 1, explanation: "S3 buckets مفتوحة = من أكثر الثغرات الشائعة في Cloud" },
    { q: "ما هو الـ Serverless في Cloud؟", options: ["شبكة بدون سيرفرات", "تشغيل كود بدون إدارة سيرفرات (Lambda, Functions)", "حذف السيرفر", "نوع قاعدة بيانات"], correct: 1, explanation: "Serverless = الكود بيشتغل بدون ما تهتم بالـ infrastructure" },
    { q: "ما هو الـ SSRF في Cloud؟", options: ["نوع تشفير", "Server-Side Request Forgery — خداع السيرفر يعمل طلبات داخلية", "بروتوكول شبكة", "نوع قاعدة بيانات"], correct: 1, explanation: "SSRF في Cloud خطير جداً — ممكن يوصل للـ metadata endpoint ويسرق credentials" }
  ],
  hacking_tools: [
    { q: "ما هو الـ Metasploit؟", options: ["متصفح", "إطار استغلال الثغرات الأشهر في العالم", "قاعدة بيانات", "نظام تشغيل"], correct: 1, explanation: "Metasploit = السلاح الأساسي للـ pentester — آلاف الـ exploits جاهزة" },
    { q: "ما هو الـ Hydra؟", options: ["نوع شبكة", "أداة كسر كلمات المرور بالـ brute force", "متصفح", "VPN"], correct: 1, explanation: "Hydra = أسرع أداة لكسر كلمات المرور على البروتوكولات المختلفة" },
    { q: "ما هو الـ John the Ripper؟", options: ["شخصية كارتون", "أداة كسر التشفير وكلمات المرور", "نوع فيروس", "أداة شبكة"], correct: 1, explanation: "John the Ripper = أداة كسر الـ hashes وكلمات المرور المشفّرة" },
    { q: "ما هو الـ Aircrack-ng؟", options: ["مكيف هواء", "مجموعة أدوات اختبار أمان شبكات WiFi", "متصفح", "نظام تشغيل"], correct: 1, explanation: "Aircrack-ng = أشهر أداة لاختبار أمان شبكات الـ WiFi" },
    { q: "ما هو الـ Nikto؟", options: ["اسم شخص", "أداة مسح ثغرات خوادم الويب", "نوع قاعدة بيانات", "بروتوكول"], correct: 1, explanation: "Nikto = أداة مجانية تفحص سيرفرات الويب عن الثغرات المعروفة" }
  ]
};
