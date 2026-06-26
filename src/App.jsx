import { useState, useEffect, useRef } from "react";
import { ORDER, LESSONS, CTF_LEVELS, EXERCISES, HACK_EXERCISES, CERTS, LEVELS, getLevel, getNextLevel } from "./data.js";
import { signUp, logIn, logOut, watchAuth, loadProfile, saveProfile, fetchLeaderboard, redeemInviteCode, deleteCurrentUser } from "./firebase.js";
import { TerminalComponent } from "./TerminalComponent.jsx";
import KaliTerminal from "./KaliTerminal.jsx";
import { PythonComponent } from "./PythonComponent.jsx";
import { TutorialsPage } from "./TutorialsPage.jsx";
import { ProgressDashboard } from "./ProgressDashboard.jsx";
import { LABS, ACHIEVEMENTS } from "./labs.js";
import { LinuxSimulatorComponent } from "./LinuxSimulatorComponent.jsx";
import { QUIZZES } from "./quizzes.js";
import { RoadmapView } from "./RoadmapView.jsx";
import { SettingsPage } from "./SettingsPage.jsx";

export default function App() {
  const [prog, setProg] = useState({});
  const [xp, setXp] = useState(0);
  const [screen, setScreen] = useState("landing");
  const [activeTab, setActiveTab] = useState("learn");
  const [curId, setCurId] = useState("linux");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [levelUp, setLevelUp] = useState(null);
  const [certName, setCertName] = useState("");
  const [nameModal, setNameModal] = useState(false);
  const [certPreview, setCertPreview] = useState(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  const canvasRef = useRef(null);
  const [loaded, setLoaded] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState("dark"); // "dark" | "light"
  const [language, setLanguage] = useState("ar"); // "ar" | "en"
  const [authChecking, setAuthChecking] = useState(true);
  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authInviteCode, setAuthInviteCode] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  const [exCode, setExCode] = useState({});
  const [exSolved, setExSolved] = useState([]);
  const [exResult, setExResult] = useState({});
  const [hexCode, setHexCode] = useState({});
  const [hexSolved, setHexSolved] = useState([]);
  const [hexResult, setHexResult] = useState({});

  const [ctfLevel, setCtfLevel] = useState(null);
  const [ctfIdx, setCtfIdx] = useState(0);
  const [ctfInput, setCtfInput] = useState("");
  const [ctfScore, setCtfScore] = useState(0);
  const [ctfTimeLeft, setCtfTimeLeft] = useState(0);
  const [ctfDone, setCtfDone] = useState(false);
  const [ctfFeedback, setCtfFeedback] = useState(null);
  const [ctfCompleted, setCtfCompleted] = useState([]);
  const ctfTimerRef = useRef(null);

  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(false);
  const [lbError, setLbError] = useState(false);
  const [selectedLab, setSelectedLab] = useState(null);
  const [labActiveTask, setLabActiveTask] = useState(0);
  const [labCode, setLabCode] = useState({});
  const [labOutput, setLabOutput] = useState({});
  const [labSolved, setLabSolved] = useState({});

  // ── Streak state ──────────────────────────────────────────────
  const [streak, setStreak] = useState(0);
  const [lastLoginDate, setLastLoginDate] = useState(null); // "YYYY-MM-DD"
  const [streakModal, setStreakModal] = useState(null); // null | "new" | "broken" | "continue"
  const [streakToday, setStreakToday] = useState(false); // already counted today?

  // Watch Firebase auth state
  useEffect(() => {
    // Timeout: if Firebase does not respond in 5s, stop loading
    const timeout = setTimeout(() => {
      setAuthChecking(false);
    }, 5000);
    const unsub = watchAuth((u) => {
      clearTimeout(timeout);
      setUser(u);
      setAuthChecking(false);
      if (!u) {
        // Logged out: reset local state and show landing/auth screen
        setProg({}); setXp(0); setExSolved([]); setHexSolved([]);
        setCtfCompleted([]); setCertName(""); setLoaded(false);
        setStreak(0); setLastLoginDate(null); setStreakToday(false); setStreakModal(null);
        setScreen("landing");
      }
    });
    return () => { clearTimeout(timeout); unsub(); };
  }, []);

  // Load saved progress from Firestore once we know who the user is
  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const data = await loadProfile(user.uid);
        if (data) {
          setProg(data.prog || {});
          setXp(data.xp || 0);
          setExSolved(data.exSolved || []);
          setHexSolved(data.hexSolved || []);
          setCtfCompleted(data.ctfCompleted || []);
          setCertName(data.certName || "");
          // ── Streak calculation ──────────────────────────────
          const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
          const savedLast = data.lastLoginDate || null;
          const savedStreak = data.streak || 0;
          if (savedLast === todayStr) {
            // Already logged in today — just restore
            setStreak(savedStreak);
            setLastLoginDate(savedLast);
            setStreakToday(true);
          } else if (savedLast) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().slice(0, 10);
            if (savedLast === yesterdayStr) {
              // Consecutive day — increment streak
              const newStreak = savedStreak + 1;
              setStreak(newStreak);
              setLastLoginDate(todayStr);
              setStreakToday(true);
              if (newStreak >= 3) setStreakModal("continue");
              else setStreakModal("new");
            } else {
              // Missed a day — reset streak
              setStreak(1);
              setLastLoginDate(todayStr);
              setStreakToday(true);
              if (savedStreak >= 3) setStreakModal("broken");
              else setStreakModal("new");
            }
          } else {
            // First time ever — start streak at 1
            setStreak(1);
            setLastLoginDate(todayStr);
            setStreakToday(true);
            setStreakModal("new");
          }
          // ────────────────────────────────────────────────────
        }
      } catch (e) {
        // No profile yet for new users, that's fine
      }
      setLoaded(true);
    })();
  }, [user]);


  // Save all progress together to Firestore whenever it changes (after initial load)
  useEffect(() => {
    if (!loaded || !user) return;
    const data = { prog, xp, exSolved, hexSolved, ctfCompleted, certName, streak, lastLoginDate };
    (async () => {
      try {
        await saveProfile(user.uid, data);
        setSaveError(false);
      } catch (e) {
        setSaveError(true);
      }
    })();
  }, [prog, xp, exSolved, hexSolved, ctfCompleted, certName, streak, lastLoginDate, loaded, user]);

  async function handleAuthSubmit(e) {
    e.preventDefault();
    setAuthError("");

    if (authMode === "signup" && !authInviteCode.trim()) {
      setAuthError("يجب إدخال كود الدعوة لإنشاء حساب");
      return;
    }

    setAuthBusy(true);
    try {
      if (authMode === "signup") {
        // 1. إنشاء الحساب أولاً
        const cred = await signUp(authEmail, authPassword);
        // 2. استخدام كود الدعوة — لو فشل نحذف الحساب
        try {
          await redeemInviteCode(authInviteCode, cred.user.uid);
        } catch (codeErr) {
          await deleteCurrentUser();
          const codeMap = {
            "invite/not-found": "كود الدعوة غير صحيح",
            "invite/already-used": "كود الدعوة استُخدم من قبل",
          };
          setAuthError(codeMap[codeErr.message] || "كود الدعوة غير صالح");
          setAuthBusy(false);
          return;
        }
      } else {
        await logIn(authEmail, authPassword);
      }
    } catch (err) {
      const map = {
        "auth/email-already-in-use": "هذا الإيميل مسجل بالفعل، جرّب تسجيل الدخول",
        "auth/invalid-email": "صيغة الإيميل غير صحيحة",
        "auth/weak-password": "كلمة المرور ضعيفة، استخدم 6 حروف على الأقل",
        "auth/user-not-found": "لا يوجد حساب بهذا الإيميل",
        "auth/wrong-password": "كلمة المرور غير صحيحة",
        "auth/invalid-credential": "الإيميل أو كلمة المرور غير صحيحة",
      };
      setAuthError(map[err.code] || "حدث خطأ، حاول مرة أخرى");
    }
    setAuthBusy(false);
  }

  async function handleLogout() {
    await logOut();
  }

  async function loadLeaderboard() {
    setLbLoading(true);
    setLbError(false);
    try {
      const data = await fetchLeaderboard(50);
      data.sort((a, b) => (b.xp || 0) - (a.xp || 0));
      setLeaderboard(data);
    } catch (e) {
      setLbError(true);
    }
    setLbLoading(false);
  }

  useEffect(() => {
    const init = {}; EXERCISES.forEach(e => init[e.id] = e.starter); setExCode(init);
    const init2 = {}; HACK_EXERCISES.forEach(e => init2[e.id] = e.starter); setHexCode(init2);
  }, []);

  useEffect(() => {
    if (certPreview && canvasRef.current) drawCert(certPreview);
  }, [certPreview, certName]);

  // CTF timer
  useEffect(() => {
    if (ctfLevel === null || ctfDone) return;
    ctfTimerRef.current = setInterval(() => {
      setCtfTimeLeft(t => {
        if (t <= 1) { setCtfDone(true); clearInterval(ctfTimerRef.current); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(ctfTimerRef.current);
  }, [ctfLevel, ctfDone]);

  // Streak milestone toasts
  useEffect(() => {
    if (!streakToday || !loaded) return;
    if ([3,7,14,30,60,100].includes(streak)) {
      const msgs = {
        3:  "🔥 3 أيام متتالية! بدأت تتعود",
        7:  "🔥 أسبوع كامل! أنت جدي",
        14: "🔥 أسبوعين! هاكر حقيقي",
        30: "🏆 شهر كامل! أسطورة!",
        60: "🌟 شهرين! ما في حد زيك",
        100:"👑 100 يوم! الملك!"
      };
      setTimeout(() => showToast(msgs[streak] || "🔥 "+streak+" يوم!", "#ffd700"), 800);
    }
  }, [streak, streakToday, loaded]);

  function addXp(amount) {
    const oldLevel = getLevel(xp);
    const newXp = xp + amount;
    const newLevel = getLevel(newXp);
    setXp(newXp);
    if (newLevel.name !== oldLevel.name) setLevelUp(newLevel);
  }

  function showToast(msg, color="#ffd700") {
    setToast({msg,color});
    setTimeout(() => setToast(null), 2200);
  }

  function isUnlocked(id) {
    const idx = ORDER.indexOf(id);
    if (idx <= 0) return true;
    const prev = ORDER[idx-1];
    const lesson = LESSONS.find(l => l.id === prev);
    const done = prog[prev] || [];
    return done.length >= Math.ceil(lesson.items.length * 0.7);
  }

  function toggleItem(lessonId, itemName, itemXp) {
    setProg(p => {
      const done = p[lessonId] || [];
      const exists = done.includes(itemName);
      if (!exists) { addXp(itemXp); showToast("+" + itemXp + " XP ✓", "#3ddc84"); }
      return { ...p, [lessonId]: exists ? done.filter(x=>x!==itemName) : [...done, itemName] };
    });
  }

  function checkExercise(ex) {
    const code = exCode[ex.id] || "";
    const passed = ex.checks.every(c => code.includes(c.val));
    if (passed) {
      if (!exSolved.includes(ex.id)) { setExSolved(s => [...s, ex.id]); addXp(ex.xp); showToast("✅ صحيح! +"+ex.xp+" XP","#3ddc84"); }
      setExResult(r => ({...r, [ex.id]: {ok:true, out:ex.expected}}));
    } else {
      setExResult(r => ({...r, [ex.id]: {ok:false, out:"❌ الكود مش مكتمل — راجع الـ Hint"}}));
      showToast("❌ حاول تاني","#ff5555");
    }
  }

  function checkHex(ex) {
    const code = hexCode[ex.id] || "";
    const passed = ex.checks.every(c => code.includes(c.val));
    if (passed) {
      if (!hexSolved.includes(ex.id)) { setHexSolved(s => [...s, ex.id]); addXp(ex.xp); showToast("✅ صحيح! +"+ex.xp+" XP","#3ddc84"); }
      setHexResult(r => ({...r, [ex.id]: {ok:true, out:ex.expected}}));
    } else {
      setHexResult(r => ({...r, [ex.id]: {ok:false, out:"❌ استخدم الـ Hint كمرجع"}}));
      showToast("❌ حاول تاني","#ff5555");
    }
  }

  function startCtfLevel(idx) {
    const lvl = CTF_LEVELS[idx];
    setCtfLevel(idx);
    setCtfIdx(0);
    setCtfInput("");
    setCtfScore(0);
    setCtfTimeLeft(lvl.timeLimit);
    setCtfDone(false);
    setCtfFeedback(null);
    setScreen("ctf_play");
  }

  function submitCtfAnswer() {
    const lvl = CTF_LEVELS[ctfLevel];
    const q = lvl.items[ctfIdx];
    const ans = ctfInput.trim().toLowerCase();
    const correct = ans === q.a.toLowerCase() || ans === q.al.toLowerCase() || (q.al && ans.includes(q.al.toLowerCase())) || q.a.toLowerCase().includes(ans) && ans.length > 2;
    if (correct) {
      setCtfScore(s => s + 1);
      setCtfFeedback({ok:true, msg:"✅ صحيح!"});
      addXp(10);
    } else {
      setCtfFeedback({ok:false, msg:"❌ الإجابة: " + q.a});
    }
    setTimeout(() => {
      setCtfFeedback(null);
      setCtfInput("");
      if (ctfIdx + 1 >= lvl.items.length) {
        setCtfDone(true);
        clearInterval(ctfTimerRef.current);
        if (!ctfCompleted.includes(ctfLevel)) {
          setCtfCompleted(c => [...c, ctfLevel]);
          addXp(100);
          showToast("🏆 المستوى اكتمل! +100 XP","#ffd700");
        }
      } else {
        setCtfIdx(i => i + 1);
      }
    }, 1200);
  }

  function isCertUnlocked(certId) {
    if (certId === "master") return LESSONS.every(l => (prog[l.id]||[]).length >= Math.ceil(l.items.length*0.7));
    const lesson = LESSONS.find(l => l.id === certId);
    if (!lesson) return false;
    return (prog[certId]||[]).length >= Math.ceil(lesson.items.length*0.7);
  }

  function openCert(cert) {
    if (!isCertUnlocked(cert.id)) { showToast("🔒 أكمل المرحلة أولاً"); return; }
    if (!certName.trim()) { setNameModal(true); return; }
    setCertPreview(cert);
  }

  function drawCert(cert) {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W=1200, H=850;
    canvas.width=W; canvas.height=H;
    ctx.fillStyle="#0a0b0d"; ctx.fillRect(0,0,W,H);
    const grad = ctx.createRadialGradient(W/2,H/2,50,W/2,H/2,600);
    grad.addColorStop(0, cert.color+"18"); grad.addColorStop(1,"transparent");
    ctx.fillStyle=grad; ctx.fillRect(0,0,W,H);
    ctx.strokeStyle=cert.color+"40"; ctx.lineWidth=2; ctx.strokeRect(30,30,W-60,H-60);
    ctx.strokeStyle=cert.color+"20"; ctx.lineWidth=1; ctx.strokeRect(44,44,W-88,H-88);
    ctx.fillStyle=cert.color+"20"; ctx.beginPath(); ctx.roundRect(W/2-180,80,360,34,17); ctx.fill();
    ctx.strokeStyle=cert.color+"40"; ctx.lineWidth=1; ctx.stroke();
    ctx.fillStyle=cert.color; ctx.font="bold 12px monospace"; ctx.textAlign="center";
    ctx.fillText("CYBER SECURITY ACADEMY · CERTIFICATE", W/2, 102);
    ctx.font="60px serif"; ctx.fillText(cert.icon, W/2, 220);
    ctx.fillStyle="#ffffff"; ctx.font="bold 50px Cairo, sans-serif"; ctx.fillText("شهادة إتمام", W/2, 300);
    ctx.fillStyle=cert.color; ctx.font="bold 26px Cairo, sans-serif"; ctx.fillText(cert.title, W/2, 345);
    const lg=ctx.createLinearGradient(200,0,W-200,0);
    lg.addColorStop(0,"transparent"); lg.addColorStop(0.5,cert.color); lg.addColorStop(1,"transparent");
    ctx.strokeStyle=lg; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(200,380); ctx.lineTo(W-200,380); ctx.stroke();
    ctx.fillStyle="#7480a0"; ctx.font="18px Cairo, sans-serif"; ctx.fillText("تُمنح هذه الشهادة إلى", W/2, 420);
    ctx.fillStyle="#ffffff"; ctx.font="bold 60px Cairo, sans-serif";
    ctx.shadowColor=cert.color; ctx.shadowBlur=20;
    ctx.fillText(certName, W/2, 505);
    ctx.shadowBlur=0;
    ctx.fillStyle="#7480a0"; ctx.font="16px Cairo, sans-serif"; ctx.fillText(cert.desc, W/2, 555);
    ctx.strokeStyle=lg; ctx.beginPath(); ctx.moveTo(200,590); ctx.lineTo(W-200,590); ctx.stroke();
    const now=new Date();
    const dateStr=now.toLocaleDateString("ar-EG",{year:"numeric",month:"long",day:"numeric"});
    const certId="CSA-"+cert.id.toUpperCase()+"-"+Math.random().toString(36).substr(2,6).toUpperCase();
    ctx.fillStyle="#3a4060"; ctx.font="14px monospace";
    ctx.textAlign="left"; ctx.fillText("CERT ID: "+certId, 80, 640);
    ctx.textAlign="right"; ctx.fillText("DATE: "+dateStr, W-80, 640);
    ctx.beginPath(); ctx.arc(W/2,695,45,0,Math.PI*2); ctx.fillStyle=cert.color+"15"; ctx.fill();
    ctx.strokeStyle=cert.color+"50"; ctx.lineWidth=2; ctx.stroke();
    ctx.font="26px serif"; ctx.textAlign="center"; ctx.fillText("🔐", W/2, 706);
    ctx.fillStyle="#1a2030"; ctx.font="12px monospace";
    ctx.fillText("Cyber Security Academy — From Zero to Hero", W/2, 780);
  }

  function downloadCert() {
    const link = document.createElement("a");
    link.download = "cert-"+certPreview.id+"-"+certName+".png";
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  }

  const C = theme === "dark"
    ? { bg:"#0a0e27", bg2:"#1a1f3a", bg3:"#252d45", y:"#00ff88", y2:"rgba(0,255,136,0.12)",
        green:"#00ff88", red:"#ff0055", orange:"#ffaa00", blue:"#00ffff", purple:"#ff00ff",
        border:"rgba(0,255,136,0.2)", border2:"rgba(0,255,255,0.1)", text:"#e0e0e0", text2:"#b0b8d0", text3:"#7a85a0" }
    : { bg:"#f0f4f8", bg2:"#ffffff", bg3:"#e2e8f0", y:"#008844", y2:"rgba(0,136,68,0.1)",
        green:"#008844", red:"#cc0033", orange:"#cc7700", blue:"#0066cc", purple:"#8800cc",
        border:"rgba(0,136,68,0.25)", border2:"rgba(0,102,204,0.15)", text:"#1a202c", text2:"#4a5568", text3:"#718096" };
  
  // Color palette for each lesson
  const lessonColors = {
    linux: { primary: "#00ff88", dark: "#005c2f", light: "rgba(0,255,136,0.1)", glow: "0 0 20px #00ff8840" },
    bash: { primary: "#00ddff", dark: "#004466", light: "rgba(0,221,255,0.1)", glow: "0 0 20px #00ddff40" },
    python_basics: { primary: "#3776ab", dark: "#1a2638", light: "rgba(55,118,171,0.1)", glow: "0 0 20px #3776ab40" },
    python_functions: { primary: "#ffcc00", dark: "#664400", light: "rgba(255,204,0,0.1)", glow: "0 0 20px #ffcc0040" },
    python_oop: { primary: "#ff6b6b", dark: "#663333", light: "rgba(255,107,107,0.1)", glow: "0 0 20px #ff6b6b40" },
    python_files: { primary: "#4ecdc4", dark: "#1a5c57", light: "rgba(78,205,196,0.1)", glow: "0 0 20px #4ecdc440" },
    hacking: { primary: "#ff1744", dark: "#660a1a", light: "rgba(255,23,68,0.1)", glow: "0 0 20px #ff174440" },
    webpen: { primary: "#ff7043", dark: "#662211", light: "rgba(255,112,67,0.1)", glow: "0 0 20px #ff704340" },
    netbasics: { primary: "#29b6f6", dark: "#0d3a5c", light: "rgba(41,182,246,0.1)", glow: "0 0 20px #29b6f640" },
    netpen: { primary: "#ab47bc", dark: "#4a1a5c", light: "rgba(171,71,188,0.1)", glow: "0 0 20px #ab47bc40" },
    windows: { primary: "#0078d4", dark: "#001a4d", light: "rgba(0,120,212,0.1)", glow: "0 0 20px #0078d440" },
    android: { primary: "#3ddc84", dark: "#1a5c3a", light: "rgba(61,220,132,0.1)", glow: "0 0 20px #3ddc8440" },
    osint: { primary: "#00bcd4", dark: "#0d4a57", light: "rgba(0,188,212,0.1)", glow: "0 0 20px #00bcd440" },
    cloud: { primary: "#00d9ff", dark: "#004466", light: "rgba(0,217,255,0.1)", glow: "0 0 20px #00d9ff40" },
  };

  const totalItems = LESSONS.reduce((s,l) => s+l.items.length, 0);
  const totalDone = LESSONS.reduce((s,l) => s+(prog[l.id]||[]).length, 0);
  const curLesson = LESSONS.find(l => l.id === curId);
  const lessonColor = lessonColors[curId] || { primary: C.y, dark: "#664400", light: "rgba(255,215,0,0.1)", glow: "0 0 20px #ffd70040" };
  
  // Apply color to current lesson
  if (curLesson && !curLesson.color) {
    curLesson.color = lessonColor.primary;
    curLesson.glow = lessonColor.glow;
  }
  const curDone = prog[curId] || [];
  const curItems = curLesson?.items || [];
  const canFinish = curDone.length >= Math.ceil(curItems.length * 0.7);
  const filteredItems = curItems.filter(item => !search || item.n.toLowerCase().includes(search.toLowerCase()) || item.d.toLowerCase().includes(search.toLowerCase()));
  const level = getLevel(xp);
  const nextLevel = getNextLevel(xp);
  const xpToNext = nextLevel ? nextLevel.min - xp : 0;
  const xpPct = nextLevel ? ((xp - level.min) / (nextLevel.min - level.min)) * 100 : 100;

  const tagColor = {"مبتدئ":"#00ff88","متوسط":"#ffaa00","متقدم":"#ff0055"};

  function fmtTime(s) {
    const m = Math.floor(s/60), sec = s%60;
    return String(m).padStart(2,'0')+":"+String(sec).padStart(2,'0');
  }

  if (authChecking) {
    return (
      <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Cairo,sans-serif"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:14}}>🔐</div>
          <div style={{fontFamily:"monospace",fontSize:12,color:C.text2}}>جاري التحقق من الحساب...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Cairo,sans-serif",direction:"rtl",padding:16}}>
        <div style={{maxWidth:380,width:"100%"}}>
          <div style={{textAlign:"center",marginBottom:28}}>
            <div style={{fontFamily:"monospace",fontSize:20,fontWeight:700,color:"#fff",marginBottom:6}}>
              Cyber<span style={{color:C.y}}>.</span>Academy
            </div>
            <div style={{fontSize:12,color:C.text2}}>سجّل دخولك لتبدأ أو تكمل رحلتك</div>
          </div>
          <div style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:16,padding:26}}>
            <div style={{display:"flex",gap:6,marginBottom:20,background:C.bg3,borderRadius:10,padding:4}}>
              <button onClick={()=>{setAuthMode("login");setAuthError("");}}
                style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"monospace",fontSize:12,
                  background:authMode==="login"?C.y+"20":"transparent",color:authMode==="login"?C.y:C.text2}}>
                تسجيل دخول
              </button>
              <button onClick={()=>{setAuthMode("signup");setAuthError("");}}
                style={{flex:1,padding:"9px 0",borderRadius:8,border:"none",cursor:"pointer",fontFamily:"monospace",fontSize:12,
                  background:authMode==="signup"?C.y+"20":"transparent",color:authMode==="signup"?C.y:C.text2}}>
                حساب جديد
              </button>
            </div>
            <form onSubmit={handleAuthSubmit}>
              <div style={{marginBottom:12}}>
                <label style={{fontSize:11,color:C.text2,display:"block",marginBottom:6}}>البريد الإلكتروني</label>
                <input type="email" required value={authEmail} onChange={e=>setAuthEmail(e.target.value)}
                  placeholder="you@example.com" dir="ltr"
                  style={{width:"100%",background:C.bg3,border:"1px solid "+C.border2,borderRadius:8,padding:"10px 14px",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>
              <div style={{marginBottom:16}}>
                <label style={{fontSize:11,color:C.text2,display:"block",marginBottom:6}}>كلمة المرور</label>
                <input type="password" required minLength={6} value={authPassword} onChange={e=>setAuthPassword(e.target.value)}
                  placeholder="••••••••" dir="ltr"
                  style={{width:"100%",background:C.bg3,border:"1px solid "+C.border2,borderRadius:8,padding:"10px 14px",color:"#fff",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
              </div>

              {authMode === "signup" && (
                <div style={{marginBottom:16}}>
                  <label style={{fontSize:11,color:C.text2,display:"block",marginBottom:6}}>🔑 كود الدعوة</label>
                  <input type="text" value={authInviteCode} onChange={e=>setAuthInviteCode(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX" dir="ltr"
                    style={{width:"100%",background:C.bg3,border:"1px solid rgba(255,215,0,0.4)",borderRadius:8,padding:"10px 14px",color:C.y,fontSize:14,outline:"none",boxSizing:"border-box",letterSpacing:3,textTransform:"uppercase",fontFamily:"monospace",textAlign:"center"}}/>
                </div>
              )}

              {authError && (
                <div style={{fontSize:12,color:C.red,marginBottom:14,textAlign:"center"}}>{authError}</div>
              )}
              <button type="submit" disabled={authBusy}
                style={{width:"100%",background:"linear-gradient(135deg,rgba(255,215,0,0.25),rgba(255,215,0,0.1))",border:"1px solid rgba(255,215,0,0.5)",borderRadius:10,padding:"12px 0",fontFamily:"monospace",fontSize:13,color:C.y,cursor:authBusy?"default":"pointer",fontWeight:700,opacity:authBusy?0.6:1}}>
                {authBusy?"جاري المعالجة...":authMode==="login"?"دخول →":"إنشاء حساب →"}
              </button>
            </form>
          </div>
          <div style={{textAlign:"center",marginTop:20,fontSize:10,color:C.text3,fontFamily:"monospace"}}>
            بياناتك محفوظة بأمان ومرتبطة بحسابك فقط
          </div>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Cairo,sans-serif"}}>
        <div style={{textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:14}}>🔐</div>
          <div style={{fontFamily:"monospace",fontSize:12,color:C.text2}}>جاري تحميل بياناتك...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{background:C.bg,minHeight:"100vh",color:C.text,fontFamily:"Cairo,sans-serif",direction:"rtl"}}>

      {screen!=="landing" && (
      <div style={{position:"sticky",top:0,zIndex:200,background:"rgba(10,11,13,0.97)",backdropFilter:"blur(20px)",borderBottom:"1px solid "+C.border,padding:"0 clamp(12px,4vw,40px)"}}>
        <div style={{height:52,display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontFamily:"monospace",fontSize:"clamp(12px,2vw,15px)",fontWeight:700,color:"#fff",cursor:"pointer",whiteSpace:"nowrap"}}
            onClick={()=>{setScreen("landing");}}>
            Cyber<span style={{color:C.y}}>.</span>Academy
          </span>
          <div style={{flex:1}}/>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",justifyContent:"flex-end"}}>
            <span style={{fontSize:11,fontFamily:"monospace",color:level.color,fontWeight:700,whiteSpace:"nowrap"}}>{level.name}</span>
            <div style={{width:70,height:3,background:C.bg3,borderRadius:2,overflow:"hidden"}}>
              <div style={{height:"100%",background:C.y,borderRadius:2,width:xpPct+"%"}}/>
            </div>
            <span style={{fontSize:11,fontFamily:"monospace",color:C.text3,whiteSpace:"nowrap"}}>{xp} XP</span>
            {streak > 0 && (
              <span title={`تسلسل ${streak} يوم متتالي`}
                onClick={()=>setStreakModal(streakToday?"continue":"new")}
                style={{fontSize:11,fontFamily:"monospace",cursor:"pointer",whiteSpace:"nowrap",
                  background: streak>=7 ? "rgba(255,215,0,0.15)" : streak>=3 ? "rgba(255,152,0,0.12)" : "rgba(255,255,255,0.06)",
                  border: "1px solid "+(streak>=7?"#ffd700":streak>=3?"#ff9800":"#444"),
                  borderRadius:6,padding:"1px 7px",
                  color: streak>=7?"#ffd700":streak>=3?"#ff9800":C.text3}}>
                🔥 {streak}
              </span>
            )}
            {saveError && <span title="فشل حفظ التقدم، تحقق من الاتصال" style={{fontSize:13,color:C.red}}>⚠️</span>}
            <button onClick={handleLogout} title="تسجيل الخروج"
              style={{fontSize:11,fontFamily:"monospace",color:C.text3,background:"none",border:"none",cursor:"pointer",padding:"2px 4px"}}>
              🚪
            </button>
          </div>
        </div>
        <div style={{display:"flex",gap:4,paddingBottom:6,overflowX:"auto"}}>
          {[["learn","📚 تعلم"],["practice","💻 تدريب"],["hacktools","🛠️ الأدوات"],["labs","🔬 المعامل"],["ctf","🏁 CTF"],["leaderboard","🥇 الترتيب"],["certs","🏆 الشهادات"],["stats","📊 إحصائياتي"],["settings","⚙️ الإعدادات"]].map(([tab,label])=>(
            <button key={tab} onClick={()=>{setActiveTab(tab);setScreen(tab==="learn"?"home":tab);if(tab==="leaderboard")loadLeaderboard();}}
              style={{fontSize:11,fontFamily:"monospace",padding:"4px 12px",borderRadius:6,
                color:activeTab===tab?C.y:C.text2,background:activeTab===tab?C.y2:"none",
                border:activeTab===tab?"1px solid "+C.border:"1px solid transparent",cursor:"pointer",whiteSpace:"nowrap"}}>
              {label}
            </button>
          ))}
          {screen==="lesson" && (
            <button onClick={()=>{setScreen("home");setActiveTab("learn");}}
              style={{fontSize:11,fontFamily:"monospace",padding:"4px 12px",color:C.text3,background:"none",border:"none",cursor:"pointer",marginRight:"auto"}}>
              ← الخريطة
            </button>
          )}
        </div>
      </div>
      )}

      {toast && (
        <div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:toast.color+"22",border:"1px solid "+toast.color,borderRadius:8,padding:"9px 20px",fontFamily:"monospace",fontSize:12,color:toast.color,zIndex:500,whiteSpace:"nowrap"}}>
          {toast.msg}
        </div>
      )}

      {/* ── Streak Modal ──────────────────────────────────────── */}
      {streakModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.88)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:600,padding:16}} onClick={()=>setStreakModal(null)}>
          <div style={{background:C.bg2,border:"2px solid "+(streakModal==="broken"?"#ff5252":"#ffd700"),borderRadius:24,padding:"36px 40px",textAlign:"center",maxWidth:340,width:"100%"}} onClick={e=>e.stopPropagation()}>
            {streakModal === "broken" ? (
              <>
                <div style={{fontSize:56,marginBottom:10}}>💔</div>
                <div style={{fontSize:22,fontWeight:900,color:"#ff5252",marginBottom:10}}>انكسر الـ Streak!</div>
                <div style={{fontSize:14,color:C.text2,marginBottom:18,lineHeight:1.8}}>
                  فاتك يوم وضاع الـ streak 😢<br/>
                  ابدأ من جديد وحافظ على تسلسلك
                </div>
                <div style={{fontSize:28,fontWeight:900,color:"#ff5252",fontFamily:"monospace",marginBottom:20}}>
                  🔥 1 يوم
                </div>
              </>
            ) : streakModal === "continue" ? (
              <>
                <div style={{fontSize:56,marginBottom:10}}>🔥</div>
                <div style={{fontSize:22,fontWeight:900,color:"#ffd700",marginBottom:10}}>أنت على الطريق الصح! 💪</div>
                <div style={{fontSize:14,color:C.text2,marginBottom:18,lineHeight:1.8}}>
                  رجعت تاني — تسلسلك مستمر 💪<br/>
                  استمر كل يوم وما تخليش الـ streak يكسر
                </div>
                <div style={{fontSize:40,fontWeight:900,color:"#ffd700",fontFamily:"monospace",marginBottom:20}}>
                  🔥 {streak} يوم
                </div>
              </>
            ) : (
              <>
                <div style={{fontSize:56,marginBottom:10}}>🎯</div>
                <div style={{fontSize:22,fontWeight:900,color:"#ffd700",marginBottom:10}}>أول يوم في رحلتك!</div>
                <div style={{fontSize:14,color:C.text2,marginBottom:18,lineHeight:1.8}}>
                  ارجع كل يوم وحافظ على تسلسلك —<br/>
                  الاستمرارية هي سر النجاح 🌟
                </div>
                <div style={{fontSize:28,fontWeight:900,color:"#ffd700",fontFamily:"monospace",marginBottom:20}}>
                  🔥 {streak} يوم
                </div>
              </>
            )}
            <button onClick={()=>setStreakModal(null)}
              style={{background:"#ffd700",color:"#000",border:"none",borderRadius:10,padding:"10px 32px",fontFamily:"Cairo,sans-serif",fontWeight:900,fontSize:15,cursor:"pointer"}}>
              {streakModal==="broken" ? "هبدأ من جديد 💪" : "يلا نتعلم! 🚀"}
            </button>
          </div>
        </div>
      )}

      {nameModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,padding:16}}>
          <div style={{background:C.bg2,border:"2px solid "+C.y,borderRadius:20,padding:"32px 36px",textAlign:"center",maxWidth:360,width:"100%"}}>
            <div style={{fontSize:40,marginBottom:10}}>👤</div>
            <div style={{fontSize:18,fontWeight:900,color:"#fff",marginBottom:14}}>اكتب اسمك</div>
            <input value={certName} onChange={e=>setCertName(e.target.value)} placeholder="مثال: Ahmed Mohamed" autoFocus
              style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,borderRadius:8,padding:"10px 14px",fontFamily:"Cairo,sans-serif",fontSize:14,color:"#fff",outline:"none",direction:"rtl",marginBottom:14,boxSizing:"border-box"}}/>
            <button onClick={()=>{if(certName.trim())setNameModal(false);}}
              style={{background:C.y+"20",border:"1px solid "+C.y+"50",borderRadius:8,padding:"10px 28px",color:C.y,cursor:"pointer",fontFamily:"monospace",fontSize:12}}>
              تأكيد ←
            </button>
          </div>
        </div>
      )}

      {certPreview && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400,padding:12,overflowY:"auto"}}
          onClick={(e)=>{if(e.target===e.currentTarget)setCertPreview(null);}}>
          <div style={{background:C.bg2,border:"1px solid "+certPreview.color+"40",borderRadius:14,padding:16,maxWidth:700,width:"100%"}}>
            <canvas ref={canvasRef} style={{width:"100%",height:"auto",display:"block",borderRadius:8}}/>
            <div style={{display:"flex",gap:10,marginTop:14,justifyContent:"center",flexWrap:"wrap"}}>
              <button onClick={downloadCert} style={{background:"linear-gradient(135deg,rgba(255,215,0,0.18),rgba(255,215,0,0.08))",border:"1px solid rgba(255,215,0,0.4)",borderRadius:10,padding:"10px 28px",fontFamily:"monospace",fontSize:13,color:C.y,cursor:"pointer"}}>
                📥 تحميل PNG
              </button>
              <button onClick={()=>setCertPreview(null)} style={{background:"none",border:"1px solid "+C.border2,borderRadius:10,padding:"10px 28px",fontFamily:"monospace",fontSize:13,color:C.text2,cursor:"pointer"}}>
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {levelUp && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400}}
          onClick={()=>setLevelUp(null)}>
          <div style={{background:C.bg2,border:"2px solid "+levelUp.color,borderRadius:20,padding:"44px 55px",textAlign:"center",boxShadow:"0 0 60px "+levelUp.color+"40"}}>
            <div style={{fontSize:56,marginBottom:12}}>⬆️</div>
            <div style={{fontSize:30,fontWeight:900,color:levelUp.color,marginBottom:6}}>LEVEL UP!</div>
            <div style={{fontSize:20,color:levelUp.color}}>{levelUp.name}</div>
            <button onClick={()=>setLevelUp(null)} style={{marginTop:20,background:"none",border:"1px solid "+levelUp.color,borderRadius:8,padding:"8px 24px",color:levelUp.color,cursor:"pointer",fontFamily:"monospace",fontSize:12}}>استمر ←</button>
          </div>
        </div>
      )}

      <div style={{maxWidth:1100,margin:"0 auto",padding: screen==="landing"?0:"16px clamp(12px,4vw,40px) 80px"}}>

        {screen==="landing" && (
          <div style={{minHeight:"100vh"}}>
            <div style={{textAlign:"center",padding:"clamp(50px,10vw,110px) 16px clamp(30px,6vw,60px)"}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(255,215,0,0.08)",border:"1px solid rgba(255,215,0,0.2)",borderRadius:20,padding:"7px 22px",fontFamily:"monospace",fontSize:11,color:C.y,letterSpacing:2,marginBottom:24}}>
                🔐 CYBER SECURITY · من الصفر حتى الاحتراف
              </div>
              <h1 style={{fontSize:"clamp(28px,7vw,68px)",fontWeight:900,color:"#fff",lineHeight:1.1,marginBottom:18}}>
                تعلّم <span style={{color:C.y,textShadow:"0 0 50px rgba(255,215,0,0.4)"}}>الأمن السيبراني</span><br/>والاختراق الأخلاقي
              </h1>
              <p style={{fontSize:"clamp(13px,2vw,17px)",color:C.text2,maxWidth:600,margin:"0 auto 32px",lineHeight:1.9}}>
                من Linux وBash وPython، لـ 60 أداة اختراق، اختراق الويب والشبكات وWindows Server وAndroid وOSINT — مع 13 مستوى CTF و904 سؤال
              </p>
              <button onClick={()=>{setScreen("home");setActiveTab("learn");}}
                style={{background:"linear-gradient(135deg,rgba(255,215,0,0.25),rgba(255,215,0,0.1))",border:"1px solid rgba(255,215,0,0.5)",borderRadius:12,padding:"16px 48px",fontFamily:"monospace",fontSize:16,color:C.y,cursor:"pointer",letterSpacing:1,fontWeight:700}}>
                🚀 ابدأ الرحلة
              </button>
              <div style={{display:"flex",gap:"clamp(16px,4vw,40px)",justifyContent:"center",flexWrap:"wrap",marginTop:50}}>
                {[["13","قسم تعليمي"],["60","أداة اختراق"],["904","سؤال CTF"],["35","تدريب عملي"],["14","شهادة"]].map(([n,l],i)=>(
                  <div key={i} style={{textAlign:"center"}}>
                    <div style={{fontFamily:"monospace",fontSize:"clamp(22px,5vw,36px)",fontWeight:700,color:C.y}}>{n}</div>
                    <div style={{fontSize:11,color:C.text3,marginTop:4}}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{padding:"30px 16px",borderTop:"1px solid "+C.border2}}>
              <h2 style={{textAlign:"center",fontSize:"clamp(18px,4vw,28px)",fontWeight:900,color:"#fff",marginBottom:30}}>رحلتك التعليمية الكاملة</h2>
              <div style={{display:"flex",flexWrap:"wrap",justifyContent:"center",gap:8,maxWidth:1100,margin:"0 auto"}}>
                {LESSONS.map((l,i)=>(
                  <div key={l.id} style={{background:C.bg2,border:"1px solid "+C.border2,borderRadius:12,padding:"14px 16px",textAlign:"center",minWidth:110}}>
                    <div style={{fontSize:24,marginBottom:4}}>{l.icon}</div>
                    <div style={{fontSize:11,fontWeight:700,color:"#fff"}}>{l.title}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{padding:"50px 16px",textAlign:"center",borderTop:"1px solid "+C.border2}}>
              <button onClick={()=>{setScreen("home");setActiveTab("learn");}}
                style={{background:"linear-gradient(135deg,rgba(255,215,0,0.25),rgba(255,215,0,0.1))",border:"1px solid rgba(255,215,0,0.5)",borderRadius:12,padding:"16px 48px",fontFamily:"monospace",fontSize:16,color:C.y,cursor:"pointer",fontWeight:700}}>
                🚀 ابدأ الآن مجاناً
              </button>
              <div style={{marginTop:30,fontSize:11,color:C.text3,fontFamily:"monospace"}}>Cyber Security Academy © 2026 — للاستخدام التعليمي والأخلاقي فقط</div>
            </div>
          </div>
        )}

        {screen==="home" && (
          <RoadmapView
            LESSONS={LESSONS}
            ORDER={ORDER}
            prog={prog}
            isUnlocked={isUnlocked}
            setCurId={(id) => { setCurId(id); setSearch(""); }}
            setScreen={setScreen}
            lessonColors={lessonColors}
            C={C}
          />
        )}

        {screen==="lesson" && curLesson && (
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16,paddingBottom:12,borderBottom:"2px solid "+curLesson.color+"40"}}>
              <div style={{fontSize:"clamp(14px,2.5vw,18px)",fontWeight:900,color:curLesson.color,flex:1,textShadow:"0 0 20px "+curLesson.glow}}>{curLesson.icon} {curLesson.title}</div>
              <span style={{fontFamily:"monospace",fontSize:11,color:C.text2}}>{curDone.length}/{curItems.length}</span>
            </div>
            {curId === 'linux' && (
              <div style={{marginBottom:20,marginTop:20}}>
                <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:10}}>🖥️ محاكي Linux حقيقي — بيئة كاملة في المتصفح!</div>
                <KaliTerminal />
              </div>
            )}
            {curId === 'bash' && (
              <div style={{marginBottom:20,marginTop:20}}>
                <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:10}}>🖥️ Terminal تفاعلي — جرب الأوامر بنفسك:</div>
                <KaliTerminal />
              </div>
            )}
            {curId === 'webpen' && (
              <div style={{marginBottom:20,marginTop:20}}>
                <WebVulnTrainer />
              </div>
            )}
            {curId && curId.includes('python') && (
              <div style={{marginBottom:20,marginTop:20}}>
                <div style={{fontSize:12,fontWeight:700,color:C.text,marginBottom:10}}>🐍 Python Code Playground — اكتب وشغّل الكود:</div>
                <PythonComponent />
              </div>
            )}
            <div style={{maxWidth:500,marginBottom:20}}>
              <div style={{display:"flex",alignItems:"center",gap:8,background:C.bg2,border:"1px solid "+curLesson.color+"30",borderRadius:8,padding:"0 14px"}}>
                <span style={{color:curLesson.color}}>🔍</span>
                <input style={{flex:1,background:"none",border:"none",outline:"none",color:C.text,fontFamily:"monospace",fontSize:12,padding:"10px 0",direction:"rtl"}}
                  placeholder="ابحث..." value={search} onChange={e=>setSearch(e.target.value)}/>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(290px,1fr))",gap:10}}>
              {filteredItems.map((item,i) => {
                const done = (prog[curId]||[]).includes(item.n);
                return (
                  <div key={i} onClick={()=>toggleItem(curId, item.n, curLesson.xp)}
                    style={{background:done?"linear-gradient(160deg,"+curLesson.glow+",rgba(20,23,32,0.95))":C.bg2,border:"1px solid "+(done?curLesson.color+"50":C.border2),borderRadius:12,overflow:"hidden",cursor:"pointer"}}>
                    <div style={{padding:"11px 13px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid rgba(255,255,255,0.04)"}}>
                      <span style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:curLesson.color}}>{item.n}</span>
                      <div style={{width:17,height:17,borderRadius:"50%",border:"2px solid "+(done?curLesson.color:C.text3),background:done?curLesson.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,color:done?"#000":"transparent",flexShrink:0}}>✓</div>
                    </div>
                    <div style={{padding:"8px 13px",fontSize:11,color:C.text2,lineHeight:1.6}}>{item.d}</div>
                    {item.explain && (
                      <div style={{padding:"10px 13px",fontSize:12,color:"#80deea",background:"rgba(0,188,212,0.08)",borderTop:"1px solid rgba(0,188,212,0.15)",lineHeight:1.8,direction:"rtl",textAlign:"right"}}>📖 {item.explain}</div>
                    )}
                    <pre style={{margin:0,background:"rgba(0,0,0,0.55)",borderTop:"1px solid "+curLesson.color+"15",padding:"9px 13px",fontFamily:"monospace",fontSize:10,lineHeight:1.7,direction:"ltr",textAlign:"left",overflowX:"auto",whiteSpace:"pre",color:curLesson.color}}>{item.c}</pre>
                    <div style={{padding:"6px 13px 10px"}}>
                      <span style={{fontSize:9,fontFamily:"monospace",padding:"2px 6px",borderRadius:4,background:tagColor[item.l]+"20",color:tagColor[item.l],border:"1px solid "+tagColor[item.l]+"40"}}>{item.l}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {canFinish && !search && (
              <div style={{textAlign:"center",marginTop:30}}>
                <button onClick={()=>{addXp(curLesson.xp*3);showToast("🏆 مرحلة مكتملة!",curLesson.color);
                  if(curLesson.next){setCurId(curLesson.next);}else{setScreen("home");}}}
                  style={{background:"linear-gradient(135deg,"+curLesson.glow+","+curLesson.color+"08)",border:"1px solid "+curLesson.color+"50",borderRadius:12,padding:"14px 36px",fontFamily:"monospace",fontSize:14,color:curLesson.color,cursor:"pointer"}}>
                  [ ✓ إنهاء وفتح التالية ]
                </button>
              </div>
            )}
          </div>
        )}

        {screen==="practice" && (
          <div>
            <h2 style={{fontSize:"clamp(18px,4vw,26px)",fontWeight:900,color:"#fff",marginBottom:6}}>💻 تدريب عملي</h2>
            <p style={{fontSize:12,color:C.text2,marginBottom:20,fontFamily:"monospace"}}>// اكتب الكود — اضغط تحقق — {exSolved.length}/{EXERCISES.length} مكتمل</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>
              {EXERCISES.map(ex => {
                const solved = exSolved.includes(ex.id);
                const result = exResult[ex.id];
                return (
                  <div key={ex.id} style={{background:C.bg2,border:"1px solid "+(solved?"rgba(61,220,132,0.3)":C.border2),borderRadius:14,padding:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,gap:8}}>
                      <span style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:solved?C.green:"#fff"}}>{solved?"✅ ":""}{ex.title}</span>
                      <span style={{fontSize:10,fontFamily:"monospace",padding:"2px 7px",borderRadius:4,background:C.y+"15",color:C.y}}>+{ex.xp} XP</span>
                    </div>
                    <div style={{fontSize:12,color:C.text2,marginBottom:8}}>{ex.desc}</div>
                    <textarea value={exCode[ex.id]||""} onChange={e=>setExCode(p=>({...p,[ex.id]:e.target.value}))} spellCheck={false}
                      style={{width:"100%",minHeight:100,background:"#000",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,padding:10,fontFamily:"monospace",fontSize:11,color:C.orange,direction:"ltr",resize:"vertical",outline:"none",marginBottom:8}}/>
                    <div style={{display:"flex",gap:6,marginBottom:8}}>
                      <button onClick={()=>checkExercise(ex)} style={{flex:1,background:C.green+"15",border:"1px solid "+C.green+"40",borderRadius:6,padding:8,fontFamily:"monospace",fontSize:11,color:C.green,cursor:"pointer"}}>▶ تحقق</button>
                      <details style={{flex:1}}>
                        <summary style={{background:C.bg3,border:"1px solid "+C.border2,borderRadius:6,padding:8,fontFamily:"monospace",fontSize:11,color:C.text2,cursor:"pointer",textAlign:"center"}}>💡 Hint</summary>
                        <pre style={{marginTop:6,background:"rgba(0,0,0,0.4)",borderRadius:6,padding:8,fontFamily:"monospace",fontSize:10,color:C.text2,direction:"ltr",whiteSpace:"pre-wrap"}}>{ex.hint}</pre>
                      </details>
                    </div>
                    {result && (
                      <div style={{background:result.ok?"rgba(61,220,132,0.08)":"rgba(255,85,85,0.08)",borderRadius:8,padding:"8px 12px"}}>
                        <pre style={{margin:0,fontFamily:"monospace",fontSize:11,color:result.ok?C.green:C.red,whiteSpace:"pre-wrap"}}>{result.out}</pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {screen==="hacktools" && (
          <div>
            <h2 style={{fontSize:"clamp(18px,4vw,26px)",fontWeight:900,color:"#fff",marginBottom:6}}>🛠️ تطبيق أدوات الاختراق</h2>
            <p style={{fontSize:12,color:C.text2,marginBottom:16,fontFamily:"monospace"}}>// {hexSolved.length}/{HACK_EXERCISES.length} مكتمل</p>
            <div style={{background:"rgba(255,85,85,0.05)",border:"1px solid rgba(255,85,85,0.2)",borderRadius:10,padding:"12px 16px",marginBottom:16,fontSize:12,color:"#cc4444"}}>
              ⚠️ <strong style={{color:C.red}}>للاستخدام الأخلاقي فقط</strong>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:14}}>
              {HACK_EXERCISES.map(ex => {
                const solved = hexSolved.includes(ex.id);
                const result = hexResult[ex.id];
                return (
                  <div key={ex.id} style={{background:C.bg2,border:"1px solid "+(solved?"rgba(61,220,132,0.3)":C.border2),borderRadius:14,padding:16}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,gap:8}}>
                      <span style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:solved?C.green:C.y}}>{solved?"✅ ":""}{ex.title}</span>
                      <span style={{fontSize:10,fontFamily:"monospace",padding:"2px 7px",borderRadius:4,background:C.y+"15",color:C.y}}>+{ex.xp} XP</span>
                    </div>
                    <div style={{fontSize:12,color:C.text2,marginBottom:8}}>{ex.desc}</div>
                    <textarea value={hexCode[ex.id]||""} onChange={e=>setHexCode(p=>({...p,[ex.id]:e.target.value}))} spellCheck={false}
                      style={{width:"100%",minHeight:100,background:"#000",border:"1px solid rgba(255,255,255,0.06)",borderRadius:8,padding:10,fontFamily:"monospace",fontSize:11,color:C.orange,direction:"ltr",resize:"vertical",outline:"none",marginBottom:8}}/>
                    <div style={{display:"flex",gap:6,marginBottom:8}}>
                      <button onClick={()=>checkHex(ex)} style={{flex:1,background:C.green+"15",border:"1px solid "+C.green+"40",borderRadius:6,padding:8,fontFamily:"monospace",fontSize:11,color:C.green,cursor:"pointer"}}>▶ تحقق</button>
                      <details style={{flex:1}}>
                        <summary style={{background:C.bg3,border:"1px solid "+C.border2,borderRadius:6,padding:8,fontFamily:"monospace",fontSize:11,color:C.text2,cursor:"pointer",textAlign:"center"}}>💡 الكود الكامل</summary>
                        <pre style={{marginTop:6,background:"rgba(0,0,0,0.4)",borderRadius:6,padding:8,fontFamily:"monospace",fontSize:10,color:C.text2,direction:"ltr",whiteSpace:"pre-wrap",maxHeight:180,overflowY:"auto"}}>{ex.hint}</pre>
                      </details>
                    </div>
                    {result && (
                      <div style={{background:result.ok?"rgba(61,220,132,0.08)":"rgba(255,85,85,0.08)",borderRadius:8,padding:"8px 12px"}}>
                        <pre style={{margin:0,fontFamily:"monospace",fontSize:11,color:result.ok?C.green:C.red,whiteSpace:"pre-wrap"}}>{result.out}</pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {screen==="ctf" && (
          <div>
            <h2 style={{fontSize:"clamp(18px,4vw,26px)",fontWeight:900,color:"#fff",marginBottom:6}}>🏁 تحديات CTF — 13 مستوى</h2>
            <p style={{fontSize:12,color:C.text2,marginBottom:20,fontFamily:"monospace"}}>// {ctfCompleted.length}/13 مستوى مكتمل · 904 سؤال إجمالي</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
              {CTF_LEVELS.map((lvl, idx) => {
                const completed = ctfCompleted.includes(idx);
                const locked = idx > 0 && !ctfCompleted.includes(idx-1);
                return (
                  <div key={idx} onClick={()=>!locked && startCtfLevel(idx)}
                    style={{background:C.bg2,border:"1px solid "+(completed?"rgba(61,220,132,0.4)":lvl.color+"30"),borderRadius:14,padding:18,cursor:locked?"not-allowed":"pointer",opacity:locked?0.4:1,textAlign:"center"}}>
                    <div style={{fontSize:32,marginBottom:8}}>{lvl.icon}</div>
                    <div style={{fontSize:13,fontWeight:700,color:completed?C.green:lvl.color,marginBottom:6}}>{lvl.name}</div>
                    <div style={{fontSize:10,color:C.text3,fontFamily:"monospace",marginBottom:8}}>{lvl.items.length} سؤال · {fmtTime(lvl.timeLimit)}</div>
                    <span style={{fontSize:10,fontFamily:"monospace",padding:"3px 10px",borderRadius:6,background:completed?"rgba(61,220,132,0.15)":locked?"rgba(255,255,255,0.05)":lvl.color+"15",color:completed?C.green:locked?C.text3:lvl.color}}>
                      {completed?"✓ مكتمل":locked?"🔒 مقفل":"▶ ابدأ"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {screen==="ctf_play" && ctfLevel!==null && (
          <div>
            {!ctfDone ? (
              <div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
                  <span style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:CTF_LEVELS[ctfLevel].color}}>{CTF_LEVELS[ctfLevel].icon} {CTF_LEVELS[ctfLevel].name}</span>
                  <span style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:ctfTimeLeft<60?C.red:C.text}}>⏱️ {fmtTime(ctfTimeLeft)}</span>
                </div>
                <div style={{height:4,background:C.bg3,borderRadius:2,overflow:"hidden",marginBottom:24}}>
                  <div style={{height:"100%",background:CTF_LEVELS[ctfLevel].color,width:((ctfIdx)/CTF_LEVELS[ctfLevel].items.length*100)+"%"}}/>
                </div>
                <div style={{textAlign:"center",fontSize:11,color:C.text3,fontFamily:"monospace",marginBottom:8}}>
                  سؤال {ctfIdx+1} من {CTF_LEVELS[ctfLevel].items.length} · النتيجة: {ctfScore}
                </div>
                <div style={{background:C.bg2,border:"1px solid "+CTF_LEVELS[ctfLevel].color+"30",borderRadius:16,padding:"30px 24px",textAlign:"center",maxWidth:560,margin:"0 auto"}}>
                  <div style={{fontSize:16,color:"#fff",marginBottom:20,lineHeight:1.7}}>{CTF_LEVELS[ctfLevel].items[ctfIdx].q}</div>
                  <input value={ctfInput} onChange={e=>setCtfInput(e.target.value)} onKeyDown={e=>e.key==="Enter" && !ctfFeedback && submitCtfAnswer()}
                    autoFocus disabled={!!ctfFeedback}
                    placeholder="اكتب إجابتك..."
                    style={{width:"100%",background:C.bg3,border:"1px solid "+C.border,borderRadius:8,padding:"12px 16px",fontFamily:"monospace",fontSize:14,color:"#fff",outline:"none",direction:"ltr",textAlign:"center",boxSizing:"border-box",marginBottom:14}}/>
                  {ctfFeedback ? (
                    <div style={{fontFamily:"monospace",fontSize:13,color:ctfFeedback.ok?C.green:C.red}}>{ctfFeedback.msg}</div>
                  ) : (
                    <button onClick={submitCtfAnswer} style={{background:CTF_LEVELS[ctfLevel].color+"20",border:"1px solid "+CTF_LEVELS[ctfLevel].color+"50",borderRadius:8,padding:"10px 30px",fontFamily:"monospace",fontSize:13,color:CTF_LEVELS[ctfLevel].color,cursor:"pointer"}}>
                      تأكيد ←
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div style={{textAlign:"center",padding:"40px 16px"}}>
                <div style={{fontSize:60,marginBottom:16}}>{ctfScore >= CTF_LEVELS[ctfLevel].items.length*0.6 ? "🏆" : "⏰"}</div>
                <div style={{fontSize:22,fontWeight:900,color:"#fff",marginBottom:8}}>{ctfTimeLeft<=0 ? "انتهى الوقت!" : "انتهى المستوى!"}</div>
                <div style={{fontFamily:"monospace",fontSize:16,color:CTF_LEVELS[ctfLevel].color,marginBottom:20}}>النتيجة: {ctfScore} / {CTF_LEVELS[ctfLevel].items.length}</div>
                <button onClick={()=>setScreen("ctf")} style={{background:C.y+"20",border:"1px solid "+C.y+"50",borderRadius:8,padding:"10px 30px",fontFamily:"monospace",fontSize:13,color:C.y,cursor:"pointer"}}>
                  ← العودة للمستويات
                </button>
              </div>
            )}
          </div>
        )}

        {screen==="certs" && (
          <div>
            <h2 style={{fontSize:"clamp(18px,4vw,26px)",fontWeight:900,color:"#fff",marginBottom:6}}>🏆 شهاداتك</h2>
            <p style={{fontSize:12,color:C.text2,marginBottom:8,fontFamily:"monospace"}}>// أكمل 70% من كل مرحلة لفتح شهادتها</p>
            <div style={{maxWidth:380,marginBottom:24,display:"flex",alignItems:"center",gap:8,background:C.bg2,border:"1px solid "+C.border,borderRadius:8,padding:"0 14px"}}>
              <span style={{color:C.text3,fontSize:12}}>👤</span>
              <input value={certName} onChange={e=>setCertName(e.target.value)} placeholder="اكتب اسمك (سيظهر في الشهادة)"
                style={{flex:1,background:"none",border:"none",outline:"none",color:C.text,fontFamily:"Cairo,sans-serif",fontSize:13,padding:"10px 0",direction:"rtl"}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14}}>
              {CERTS.map(cert => {
                const unlocked = isCertUnlocked(cert.id);
                return (
                  <div key={cert.id} onClick={()=>openCert(cert)}
                    style={{background:C.bg2,border:"1px solid "+(unlocked?cert.color+"40":C.border2),borderRadius:14,padding:18,cursor:"pointer",opacity:unlocked?1:0.5}}>
                    <div style={{fontSize:32,marginBottom:8}}>{cert.icon}</div>
                    <div style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:cert.color,marginBottom:6}}>{cert.title}</div>
                    <div style={{fontSize:10,color:C.text2,marginBottom:10}}>{cert.desc}</div>
                    <div style={{textAlign:"center",background:unlocked?cert.color+"15":"rgba(255,255,255,0.04)",borderRadius:8,padding:8,fontFamily:"monospace",fontSize:10,color:unlocked?cert.color:C.text3}}>
                      {unlocked?"🏆 احصل عليها":"🔒 مقفلة"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {screen==="leaderboard" && (
          <div>
            <h2 style={{fontSize:"clamp(18px,4vw,26px)",fontWeight:900,color:"#fff",marginBottom:6}}>🥇 لوحة الترتيب</h2>
            <p style={{fontSize:12,color:C.text2,marginBottom:20,fontFamily:"monospace"}}>// أفضل 50 هاكر حسب نقاط الـ XP</p>

            {lbLoading && (
              <div style={{textAlign:"center",padding:40,color:C.text2,fontFamily:"monospace",fontSize:12}}>جاري التحميل...</div>
            )}

            {lbError && (
              <div style={{textAlign:"center",padding:40}}>
                <div style={{color:C.red,fontSize:12,fontFamily:"monospace",marginBottom:12}}>تعذر تحميل لوحة الترتيب</div>
                <button onClick={loadLeaderboard} style={{background:C.y+"15",border:"1px solid "+C.y+"40",borderRadius:8,padding:"8px 20px",fontFamily:"monospace",fontSize:11,color:C.y,cursor:"pointer"}}>إعادة المحاولة</button>
              </div>
            )}

            {!lbLoading && !lbError && leaderboard.length === 0 && (
              <div style={{textAlign:"center",padding:40,color:C.text3,fontFamily:"monospace",fontSize:12}}>لا يوجد مستخدمون بعد</div>
            )}

            {!lbLoading && !lbError && leaderboard.length > 0 && (
              <div style={{background:C.bg2,border:"1px solid "+C.border2,borderRadius:14,overflow:"hidden"}}>
                {leaderboard.map((row, idx) => {
                  const isMe = user && row.uid === user.uid;
                  const medal = idx===0?"🥇":idx===1?"🥈":idx===2?"🥉":null;
                  return (
                    <div key={row.uid} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 16px",borderBottom:idx<leaderboard.length-1?"1px solid rgba(255,255,255,0.04)":"none",background:isMe?"rgba(255,215,0,0.06)":"transparent"}}>
                      <div style={{width:30,textAlign:"center",fontFamily:"monospace",fontSize:medal?18:13,color:medal?undefined:C.text3,fontWeight:700}}>
                        {medal || (idx+1)}
                      </div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:isMe?700:400,color:isMe?C.y:"#fff",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                          {row.displayName || "هاكر بدون اسم"} {isMe && <span style={{fontSize:10,color:C.text3}}>(أنت)</span>}
                        </div>
                        <div style={{fontSize:10,color:C.text3,fontFamily:"monospace"}}>{row.ctfSolved || 0} مستوى CTF مكتمل</div>
                      </div>
                      <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:C.y,whiteSpace:"nowrap"}}>{row.xp || 0} XP</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}


        {screen==="stats" && (
          <div>
            <h2 style={{fontSize:"clamp(18px,4vw,26px)",fontWeight:900,color:"#fff",marginBottom:20}}>📊 إحصائياتي</h2>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:12,marginBottom:20}}>
              {[
                {icon:"⚡",label:"إجمالي XP",val:xp,color:C.y},
                {icon:"🏆",label:"المستوى",val:level.name,color:level.color},
                {icon:"📚",label:"مفاهيم تعلمتها",val:totalDone+"/"+totalItems,color:C.green},
                {icon:"🏁",label:"مستويات CTF",val:ctfCompleted.length+"/13",color:C.blue},
                {icon:"💻",label:"تمارين كود",val:exSolved.length+"/"+EXERCISES.length,color:"#82aaff"},
                {icon:"🛠️",label:"أدوات اختراق",val:hexSolved.length+"/"+HACK_EXERCISES.length,color:C.orange},
                {icon:"🔥",label:"تسلسل الأيام",val:streak+" يوم",color:streak>=7?"#ffd700":streak>=3?"#ff9800":"#aaa"},
              ].map((s,i) => (
                <div key={i} style={{background:C.bg2,border:"1px solid "+C.border2,borderRadius:12,padding:16,textAlign:"center"}}>
                  <div style={{fontSize:24,marginBottom:6}}>{s.icon}</div>
                  <div style={{fontFamily:"monospace",fontSize:"clamp(13px,3vw,18px)",fontWeight:700,color:s.color,marginBottom:4}}>{s.val}</div>
                  <div style={{fontSize:10,color:C.text3}}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{background:C.bg2,border:"1px solid "+C.border2,borderRadius:14,padding:20}}>
              <div style={{fontFamily:"monospace",fontSize:11,color:C.text3,letterSpacing:2,marginBottom:14}}>// تقدم كل قسم</div>
              {LESSONS.map(l => {
                const done = (prog[l.id]||[]).length;
                const total = l.items.length;
                const pct = total ? done/total*100 : 0;
                return (
                  <div key={l.id} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,fontSize:12}}>
                      <span>{l.icon} {l.title}</span>
                      <span style={{fontFamily:"monospace",fontSize:11,color:C.text2}}>{done}/{total}</span>
                    </div>
                    <div style={{height:6,background:C.bg3,borderRadius:3,overflow:"hidden"}}>
                      <div style={{height:"100%",background:"linear-gradient(90deg,"+C.y+","+C.green+")",borderRadius:3,width:pct+"%"}}/>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {screen==="settings" && (
          <SettingsPage
            theme={theme}
            setTheme={setTheme}
            language={language}
            setLanguage={setLanguage}
            user={user}
            handleLogout={handleLogout}
            xp={xp}
            streak={streak}
            certName={certName}
            setCertName={setCertName}
            C={C}
          />
        )}

        {screen==="labs" && !selectedLab && (
          <div style={{padding:"clamp(12px,4vw,32px)"}}>
            <h2 style={{fontSize:"clamp(18px,4vw,26px)",fontWeight:900,color:"#fff",marginBottom:6}}>
              🔬 <span style={{color:C.y}}>المعامل التطبيقية</span>
            </h2>
            <p style={{fontSize:13,color:C.text2,marginBottom:24,fontFamily:"monospace"}}>
              تمارين عملية خطوة بخطوة — اضغط على أي lab لتبدأ
            </p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
              {Object.entries(LABS).map(([key, lab]) => {
                const diffColor = lab.difficulty==="مبتدئ"?C.green:lab.difficulty==="متوسط"?C.orange:C.red;
                return (
                  <div key={key}
                    onClick={()=>{setSelectedLab({key, ...lab});setLabActiveTask(0);setLabCode({});setLabOutput({});setLabSolved({});}}
                    style={{background:C.bg2,border:"1px solid "+C.border,borderRadius:14,padding:20,cursor:"pointer",transition:"all 0.2s"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=C.y;e.currentTarget.style.transform="translateY(-2px)";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=C.border;e.currentTarget.style.transform="translateY(0)";}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
                      <div style={{fontSize:15,fontWeight:700,color:"#fff",flex:1}}>{lab.title}</div>
                      <div style={{fontSize:10,fontFamily:"monospace",color:C.y,background:C.y2,border:"1px solid "+C.border,borderRadius:6,padding:"2px 8px",whiteSpace:"nowrap",marginRight:8}}>+{lab.xp} XP</div>
                    </div>
                    <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap"}}>
                      <span style={{fontSize:11,fontFamily:"monospace",color:diffColor,background:diffColor+"20",borderRadius:5,padding:"2px 8px"}}>{lab.difficulty}</span>
                      <span style={{fontSize:11,fontFamily:"monospace",color:C.text2,background:C.bg3,borderRadius:5,padding:"2px 8px"}}>⏱ {lab.duration}</span>
                      <span style={{fontSize:11,fontFamily:"monospace",color:C.text3,background:C.bg3,borderRadius:5,padding:"2px 8px"}}>{lab.tasks.length} مهام</span>
                    </div>
                    <div style={{borderTop:"1px solid "+C.border,paddingTop:10}}>
                      {lab.tasks.map((task,ti) => (
                        <div key={task.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                          <div style={{width:18,height:18,borderRadius:"50%",background:C.bg3,border:"1px solid "+C.border,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontFamily:"monospace",color:C.text2,flexShrink:0}}>{ti+1}</div>
                          <span style={{fontSize:12,color:C.text2}}>{task.title}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{marginTop:12,background:"linear-gradient(135deg,"+C.y+"22,"+C.y+"11)",border:"1px solid "+C.y+"44",borderRadius:8,padding:"8px 0",textAlign:"center",fontSize:12,color:C.y,fontFamily:"monospace"}}>
                      ابدأ Lab ←
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {screen==="labs" && selectedLab && (
          <div style={{padding:"clamp(12px,4vw,32px)",maxWidth:900,margin:"0 auto"}}>
            <button onClick={()=>{setSelectedLab(null);}}
              style={{background:"none",border:"none",color:C.text2,cursor:"pointer",fontFamily:"monospace",fontSize:12,marginBottom:20,padding:0,display:"flex",alignItems:"center",gap:6}}>
              ← رجوع للمعامل
            </button>

            {/* Lab Header */}
            <div style={{background:C.bg2,border:"1px solid "+C.y+"44",borderRadius:16,padding:20,marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
              <div>
                <h2 style={{fontSize:"clamp(15px,3vw,20px)",fontWeight:900,color:"#fff",margin:"0 0 6px"}}>{selectedLab.title}</h2>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <span style={{fontSize:11,fontFamily:"monospace",color:selectedLab.difficulty==="مبتدئ"?C.green:selectedLab.difficulty==="متوسط"?C.orange:C.red,background:(selectedLab.difficulty==="مبتدئ"?C.green:selectedLab.difficulty==="متوسط"?C.orange:C.red)+"20",borderRadius:5,padding:"2px 8px"}}>{selectedLab.difficulty}</span>
                  <span style={{fontSize:11,fontFamily:"monospace",color:C.text2,background:C.bg3,borderRadius:5,padding:"2px 8px"}}>⏱ {selectedLab.duration}</span>
                  <span style={{fontSize:11,fontFamily:"monospace",color:C.y,background:C.y2,borderRadius:5,padding:"2px 8px"}}>+{selectedLab.xp} XP</span>
                </div>
              </div>
              <div style={{fontFamily:"monospace",fontSize:12,color:C.text2}}>
                {selectedLab.tasks.filter((_,i)=>labSolved[i]).length} / {selectedLab.tasks.length} مهام ✅
              </div>
            </div>

            {/* Tasks */}
            {selectedLab.tasks.map((task, ti) => {
              const isSolved = labSolved[ti];
              const isActive = labActiveTask === ti;
              return (
                <div key={task.id} style={{background:C.bg2,border:"1px solid "+(isSolved?C.green:isActive?C.y:C.border),borderRadius:12,marginBottom:14,overflow:"hidden",transition:"border 0.2s"}}>
                  {/* Task Header */}
                  <div onClick={()=>setLabActiveTask(isActive?null:ti)}
                    style={{display:"flex",alignItems:"center",gap:10,padding:"14px 18px",cursor:"pointer"}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:isSolved?C.green+"22":C.bg3,border:"1px solid "+(isSolved?C.green:C.border),display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontFamily:"monospace",color:isSolved?C.green:C.text2,flexShrink:0}}>
                      {isSolved?"✓":ti+1}
                    </div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:700,color:isSolved?C.green:"#fff"}}>{task.title}</div>
                      <div style={{fontSize:11,color:C.text3,marginTop:2}}>{task.description}</div>
                    </div>
                    <div style={{fontSize:12,color:C.text3}}>{isActive?"▲":"▼"}</div>
                  </div>

                  {/* Task Content - expanded */}
                  {isActive && (
                    <div style={{borderTop:"1px solid "+C.border,padding:16}}>
                      {/* Hint */}
                      <div style={{background:C.orange+"11",border:"1px solid "+C.orange+"33",borderRadius:8,padding:"8px 14px",fontSize:12,color:C.orange,fontFamily:"monospace",marginBottom:14}}>
                        💡 {task.hint}
                      </div>

                      {/* Arabic Explanation */}
                      {task.explain && (
                        <div style={{background:"#00bcd422",border:"1px solid #00bcd444",borderRadius:8,padding:"10px 14px",fontSize:13,color:"#80deea",marginBottom:14,lineHeight:1.8,direction:"rtl",textAlign:"right"}}>
                          📖 {task.explain}
                        </div>
                      )}

                      {/* Split: Editor + Terminal */}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
                        {/* Code Editor */}
                        <div>
                          <div style={{fontSize:11,color:C.text2,fontFamily:"monospace",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <span>📝 Code Editor</span>
                            <button onClick={()=>{
                              const starter = task.commands?task.commands.join("\n"):task.code||"";
                              setLabCode(prev=>({...prev,[ti]:starter}));
                            }} style={{background:"none",border:"1px solid "+C.border,borderRadius:4,color:C.text3,cursor:"pointer",fontSize:10,padding:"2px 8px",fontFamily:"monospace"}}>
                              reset
                            </button>
                          </div>
                          <textarea
                            value={labCode[ti]||(task.commands?task.commands.join("\n"):task.code||"")}
                            onChange={e=>setLabCode(prev=>({...prev,[ti]:e.target.value}))}
                            spellCheck={false}
                            style={{width:"100%",height:160,background:"#0d0d0d",border:"1px solid "+C.border,borderRadius:8,padding:12,color:"#00ff88",fontFamily:"monospace",fontSize:12,resize:"vertical",outline:"none",boxSizing:"border-box",lineHeight:1.7}}
                          />
                        </div>

                        {/* Terminal Output */}
                        <div>
                          <div style={{fontSize:11,color:C.text2,fontFamily:"monospace",marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                            <span>💻 Terminal Output</span>
                            <button onClick={()=>setLabOutput(prev=>({...prev,[ti]:""}))} style={{background:"none",border:"1px solid "+C.border,borderRadius:4,color:C.text3,cursor:"pointer",fontSize:10,padding:"2px 8px",fontFamily:"monospace"}}>clear</button>
                          </div>
                          <div style={{height:160,background:"#0a0a0a",border:"1px solid "+C.border,borderRadius:8,padding:12,fontFamily:"monospace",fontSize:12,color:"#ccc",overflowY:"auto",lineHeight:1.7,whiteSpace:"pre-wrap"}}>
                            {labOutput[ti]||<span style={{color:C.text3}}>{"// شغّل الكود عشان تشوف النتيجة"}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Run Button */}
                      <div style={{display:"flex",gap:10,alignItems:"center"}}>
                        <button onClick={()=>{
                          const code = labCode[ti]||(task.commands?task.commands.join("\n"):task.code||"");
                          // Simulate output based on code content
                          let output = "";
                          const lines = code.split("\n").filter(l=>l.trim());
                          if(code.includes("mkdir")&&code.includes("touch")){
                            output = "$ mkdir my_project\n$ touch my_project/script.sh\nتم إنشاء المجلد والملف ✓\n\n$ ls my_project\nscript.sh";
                          } else if(code.includes("chmod")){
                            output = "$ chmod 755 my_project/script.sh\n$ ls -la my_project/\n-rwxr-xr-x 1 user user 0 Jun 23 script.sh";
                          } else if(code.includes("find")){
                            output = "$ find . -name '*.sh'\n./my_project/script.sh";
                          } else if(code.includes("for")&&code.includes("ping")){
                            output = "192.168.1.1 ALIVE\n192.168.1.100 ALIVE\n192.168.1.254 ALIVE";
                          } else if(code.includes("for")&&code.includes("port")){
                            output = "Port 22 OPEN\nPort 80 OPEN\nPort 443 OPEN";
                          } else if(code.includes("socket")&&code.includes("connect_ex")){
                            output = "[*] Scanning...\nPort 22 OPEN\nPort 80 OPEN\nPort 443 OPEN\n[+] Scan complete";
                          } else if(code.includes("nmap")){
                            output = "Starting Nmap scan...\nPORT   STATE SERVICE VERSION\n22/tcp open  ssh     OpenSSH 8.2\n80/tcp open  http    Apache 2.4\n443/tcp open  https\n\nNmap done: 1 IP address scanned";
                          } else if(code.includes("hydra")){
                            output = "[22][ssh] host: 192.168.1.1  login: admin  password: password123\n[STATUS] attack finished for 192.168.1.1";
                          } else if(code.includes("john")){
                            output = "Using default input encoding: UTF-8\nLoaded 1 password hash (Raw-MD5)\npassword         (hash)\n1g 0:00:00:01 DONE";
                          } else if(code.includes("requests")&&code.includes("OR")){
                            output = "[+] Testing SQL Injection...\n[+] SQL Injection Found!\nServer returned 200 OK with Welcome page";
                          } else if(code.includes("XSS")||code.includes("onerror")){
                            output = "[+] Testing XSS...\n[+] XSS Vulnerability Found!\nPayload reflected in response";
                          } else if(code.includes("theHarvester")||code.includes("sublist3r")){
                            output = "[*] Searching...\nadmin@target.com\ninfo@target.com\nsupport@target.com\n[+] 3 emails found";
                          } else if(code.includes("gobuster")||code.includes("dirb")){
                            output = "/admin (Status: 200)\n/login (Status: 200)\n/uploads (Status: 403)\n/config (Status: 403)\n[+] 4 directories found";
                          } else if(code.includes("nikto")||code.includes("nuclei")){
                            output = "+ Server: Apache/2.4.41\n+ OSVDB-3092: /admin/ found\n+ Cookie httponly flag not set\n+ 5 items checked, 3 vulnerabilities found";
                          } else {
                            // Show code lines as if running
                            output = lines.map(l=>"$ "+l).join("\n")+"\n\n[تم التنفيذ]";
                          }
                          setLabOutput(prev=>({...prev,[ti]:output}));
                          // Auto-check if solved
                          setTimeout(()=>{
                            if(output.includes("✓")||output.includes("OPEN")||output.includes("ALIVE")||output.includes("Found")||output.includes("found")||output.includes("تم")||output.includes("ssh")||output.includes("password")||output.includes("Nmap")||output.includes("XSS")||output.includes("SQL")){
                              setLabSolved(prev=>{const n={...prev};n[ti]=true;return n;});
                            }
                          },500);
                        }} style={{background:"linear-gradient(135deg,"+C.y+","+C.green+")",border:"none",borderRadius:8,padding:"10px 24px",color:"#000",fontFamily:"monospace",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                          ▶ شغّل
                        </button>
                        {isSolved && (
                          <div style={{fontSize:13,color:C.green,fontFamily:"monospace",display:"flex",alignItems:"center",gap:6}}>
                            ✅ مهمة مكتملة! +{Math.floor(selectedLab.xp/selectedLab.tasks.length)} XP
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
