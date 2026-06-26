import { useState } from "react";

export function SettingsPage({ theme, setTheme, language, setLanguage, user, handleLogout, xp, streak, certName, setCertName, C }) {
  const [nameInput, setNameInput] = useState(certName || "");
  const [nameSaved, setNameSaved] = useState(false);

  function saveName() {
    setCertName(nameInput.trim());
    setNameSaved(true);
    setTimeout(() => setNameSaved(false), 2000);
  }

  const Section = ({ title, icon, children }) => (
    <div style={{
      background: C.bg2, border: "1px solid " + C.border2,
      borderRadius: 14, padding: "18px 20px", marginBottom: 14
    }}>
      <div style={{
        fontSize: 11, fontFamily: "monospace", color: C.text3,
        letterSpacing: 2, marginBottom: 14, display: "flex", alignItems: "center", gap: 8
      }}>
        <span style={{ fontSize: 15 }}>{icon}</span>
        <span>{title}</span>
      </div>
      {children}
    </div>
  );

  const Row = ({ label, desc, children }) => (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 12, padding: "10px 0",
      borderBottom: "1px solid rgba(255,255,255,0.04)"
    }}>
      <div>
        <div style={{ fontSize: 13, color: C.text, fontWeight: 600 }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: C.text3, marginTop: 2 }}>{desc}</div>}
      </div>
      <div style={{ flexShrink: 0 }}>{children}</div>
    </div>
  );

  const Toggle = ({ active, onToggle, colorOn = "#00ff88" }) => (
    <div onClick={onToggle} style={{
      width: 44, height: 24, borderRadius: 12, cursor: "pointer",
      background: active ? colorOn + "40" : "rgba(255,255,255,0.08)",
      border: "1px solid " + (active ? colorOn : "rgba(255,255,255,0.12)"),
      position: "relative", transition: "all 0.25s"
    }}>
      <div style={{
        position: "absolute", top: 3,
        left: active ? "calc(100% - 21px)" : 3,
        width: 16, height: 16, borderRadius: "50%",
        background: active ? colorOn : "#666",
        transition: "all 0.25s",
        boxShadow: active ? "0 0 8px " + colorOn : "none"
      }} />
    </div>
  );

  return (
    <div style={{ maxWidth: 580, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: "clamp(20px,4vw,28px)", fontWeight: 900, color: "#fff", margin: 0, marginBottom: 4 }}>
          ⚙️ الإعدادات
        </h2>
        <p style={{ fontSize: 12, color: C.text3, margin: 0, fontFamily: "monospace" }}>
          // تخصيص تجربتك
        </p>
      </div>

      {/* Account info */}
      <Section title="// الحساب" icon="👤">
        <Row label="الإيميل" desc="حساب Firebase المرتبط">
          <span style={{ fontSize: 12, fontFamily: "monospace", color: C.text2 }}>
            {user?.email ? user.email.replace(/^(.{2})(.*)(@.*)$/, (_, a, b, c) => a + "*".repeat(Math.min(b.length, 4)) + c) : "—"}
          </span>
        </Row>
        <Row label="الاسم على الشهادات" desc="يظهر على شهاداتك عند التحميل">
          <div style={{ display: "flex", gap: 6 }}>
            <input
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              placeholder="اسمك"
              style={{
                background: C.bg3, border: "1px solid " + (nameSaved ? "#00ff88" : C.border2),
                borderRadius: 7, padding: "5px 10px", fontSize: 12,
                color: C.text, outline: "none", fontFamily: "monospace",
                width: 130, direction: "rtl", transition: "border 0.2s"
              }}
            />
            <button onClick={saveName} style={{
              background: nameSaved ? "#00ff8820" : C.y2,
              border: "1px solid " + (nameSaved ? "#00ff88" : C.border),
              borderRadius: 7, padding: "5px 10px", fontSize: 11,
              color: nameSaved ? "#00ff88" : C.y, cursor: "pointer",
              fontFamily: "monospace", whiteSpace: "nowrap"
            }}>
              {nameSaved ? "✓ حُفظ" : "حفظ"}
            </button>
          </div>
        </Row>
        <div style={{ paddingTop: 10 }}>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { icon: "⚡", label: `${xp} XP`, color: C.y },
              { icon: "🔥", label: `${streak} يوم`, color: streak >= 7 ? "#ffd700" : streak >= 3 ? "#ff9800" : C.text3 },
            ].map((s, i) => (
              <div key={i} style={{
                fontSize: 11, fontFamily: "monospace",
                color: s.color, background: s.color + "15",
                border: "1px solid " + s.color + "30",
                borderRadius: 8, padding: "4px 10px"
              }}>
                {s.icon} {s.label}
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Appearance */}
      <Section title="// المظهر" icon="🎨">
        <Row
          label="الوضع الليلي"
          desc={theme === "dark" ? "Dark Mode — خلفية داكنة" : "Light Mode — خلفية فاتحة"}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 14 }}>{theme === "dark" ? "🌙" : "☀️"}</span>
            <Toggle active={theme === "dark"} onToggle={() => setTheme(t => t === "dark" ? "light" : "dark")} colorOn="#4a9eff" />
          </div>
        </Row>

        {/* Theme preview */}
        <div style={{
          marginTop: 10, borderRadius: 10, overflow: "hidden",
          border: "1px solid " + C.border2, display: "flex"
        }}>
          {[
            { id: "dark", label: "🌙 Dark", bg: "#0a0e27", text: "#00ff88", border: "#1a1f3a" },
            { id: "light", label: "☀️ Light", bg: "#f0f4f8", text: "#008844", border: "#e2e8f0" },
          ].map(opt => (
            <div key={opt.id} onClick={() => setTheme(opt.id)} style={{
              flex: 1, padding: "12px 10px", textAlign: "center", cursor: "pointer",
              background: opt.bg, borderRight: "1px solid " + C.border2,
              border: theme === opt.id ? "2px solid " + opt.text : "2px solid transparent",
              transition: "all 0.2s"
            }}>
              <div style={{ fontSize: 11, fontFamily: "monospace", color: opt.text, fontWeight: 700 }}>{opt.label}</div>
              <div style={{ marginTop: 6, height: 3, background: opt.border, borderRadius: 2 }}>
                <div style={{ height: "100%", width: "60%", background: opt.text, borderRadius: 2, opacity: 0.6 }} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Language */}
      <Section title="// اللغة" icon="🌍">
        <Row label="لغة الواجهة" desc="اللغة المستخدمة في الأكاديمية">
          <div style={{ display: "flex", gap: 6 }}>
            {[["ar", "🇪🇬 العربية"], ["en", "🇺🇸 English"]].map(([val, label]) => (
              <button key={val} onClick={() => setLanguage(val)} style={{
                fontSize: 11, fontFamily: "monospace", padding: "5px 12px", borderRadius: 7,
                cursor: "pointer", transition: "all 0.2s",
                background: language === val ? C.y2 : "transparent",
                border: "1px solid " + (language === val ? C.border : "rgba(255,255,255,0.1)"),
                color: language === val ? C.y : C.text3,
                fontWeight: language === val ? 700 : 400
              }}>{label}</button>
            ))}
          </div>
        </Row>
        <div style={{
          marginTop: 8, padding: "8px 12px", background: "rgba(255,170,0,0.06)",
          border: "1px solid rgba(255,170,0,0.15)", borderRadius: 8, fontSize: 11, color: C.text3
        }}>
          🚧 الترجمة الإنجليزية الكاملة قادمة في تحديث قادم
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="// تسجيل الخروج" icon="🚪">
        <Row label="تسجيل الخروج من حسابك" desc="سيتم مسح التقدم المحلي، لكن بياناتك محفوظة في Firebase">
          <button onClick={handleLogout} style={{
            fontSize: 11, fontFamily: "monospace", padding: "7px 16px", borderRadius: 8,
            background: "rgba(255,0,85,0.1)", border: "1px solid rgba(255,0,85,0.3)",
            color: "#ff0055", cursor: "pointer", transition: "all 0.2s"
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,0,85,0.2)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,0,85,0.1)"}
          >
            🚪 تسجيل الخروج
          </button>
        </Row>
      </Section>

      {/* Version */}
      <div style={{ textAlign: "center", padding: "10px 0 20px", fontSize: 10, fontFamily: "monospace", color: C.text3, opacity: 0.5 }}>
        Cyber Academy v5.0 — built with ❤️
      </div>
    </div>
  );
}
