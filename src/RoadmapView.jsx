import { useState, useEffect, useRef } from "react";

const GROUPS = [
  { label: "🐧 Linux & Bash", ids: ["linux", "bash"], color: "#00ff88" },
  { label: "🐍 Python", ids: ["python_basics", "python_functions", "python_oop", "python_files"], color: "#3776ab" },
  { label: "⚔️ Hacking", ids: ["hacking", "webpen"], color: "#ff1744" },
  { label: "🌐 Networks", ids: ["netbasics", "netpen"], color: "#29b6f6" },
  { label: "🖥️ Platforms", ids: ["windows", "android"], color: "#0078d4" },
  { label: "🔎 Intel & Cloud", ids: ["osint", "cloud"], color: "#00bcd4" },
];

export function RoadmapView({ LESSONS, ORDER, prog, isUnlocked, setCurId, setScreen, lessonColors, C }) {
  const [hoveredId, setHoveredId] = useState(null);
  const [animIn, setAnimIn] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setAnimIn(true), 50);
  }, []);

  const totalDone = LESSONS.reduce((s, l) => s + (prog[l.id] || []).length, 0);
  const totalItems = LESSONS.reduce((s, l) => s + l.items.length, 0);
  const overallPct = Math.round((totalDone / totalItems) * 100);

  // Find current active lesson (first unlocked & not completed)
  const currentLesson = LESSONS.find(l => {
    const done = (prog[l.id] || []).length;
    const total = l.items.length;
    return isUnlocked(l.id) && done < Math.ceil(total * 0.7);
  });

  return (
    <div ref={containerRef} style={{ direction: "rtl" }}>

      {/* Header */}
      <div style={{ textAlign: "center", padding: "24px 0 32px", position: "relative" }}>
        <div style={{
          fontSize: 11, fontFamily: "monospace", color: C.y, letterSpacing: 3,
          textTransform: "uppercase", marginBottom: 8, opacity: 0.7
        }}>CYBER ACADEMY</div>
        <h1 style={{
          fontSize: "clamp(22px,5vw,36px)", fontWeight: 900, color: "#fff",
          margin: 0, marginBottom: 6, textShadow: "0 0 40px rgba(0,255,136,0.3)"
        }}>خريطة التعلم</h1>
        <p style={{ fontSize: 12, color: C.text2, margin: 0 }}>
          أكمل 70% من كل مرحلة لفتح التالية
        </p>

        {/* Overall progress bar */}
        <div style={{ maxWidth: 360, margin: "20px auto 0", padding: "14px 18px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 11, fontFamily: "monospace" }}>
            <span style={{ color: "#00ff88" }}>التقدم الكلي</span>
            <span style={{ color: C.y, fontWeight: 700 }}>{overallPct}%</span>
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3,
              background: "linear-gradient(90deg, #00ff88, #00d9ff)",
              width: animIn ? overallPct + "%" : "0%",
              transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
              boxShadow: "0 0 12px #00ff8860"
            }} />
          </div>
          <div style={{ marginTop: 6, fontSize: 10, color: C.text3, fontFamily: "monospace", textAlign: "center" }}>
            {totalDone} / {totalItems} درس مكتمل
          </div>
        </div>
      </div>

      {/* Groups / Phases */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {GROUPS.map((group, gi) => {
          const groupLessons = group.ids.map(id => LESSONS.find(l => l.id === id)).filter(Boolean);
          const groupDone = groupLessons.filter(l => {
            const done = (prog[l.id] || []).length;
            return done >= Math.ceil(l.items.length * 0.7);
          }).length;
          const groupComplete = groupDone === groupLessons.length;
          const groupStarted = groupLessons.some(l => (prog[l.id] || []).length > 0);
          const firstUnlocked = isUnlocked(group.ids[0]);

          return (
            <div key={gi} style={{
              opacity: animIn ? 1 : 0,
              transform: animIn ? "translateY(0)" : "translateY(20px)",
              transition: `all 0.5s ease ${gi * 0.08}s`
            }}>
              {/* Group header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 10, marginBottom: 10,
                padding: "0 4px"
              }}>
                <div style={{
                  height: 1, flex: 1,
                  background: firstUnlocked
                    ? `linear-gradient(90deg, transparent, ${group.color}60)`
                    : "rgba(255,255,255,0.06)"
                }} />
                <span style={{
                  fontSize: 11, fontFamily: "monospace", fontWeight: 700,
                  color: firstUnlocked ? group.color : C.text3,
                  padding: "3px 12px", borderRadius: 20,
                  background: firstUnlocked ? group.color + "15" : "rgba(255,255,255,0.04)",
                  border: "1px solid " + (firstUnlocked ? group.color + "40" : "rgba(255,255,255,0.08)"),
                  whiteSpace: "nowrap"
                }}>
                  {group.label}
                  {groupComplete && <span style={{ marginRight: 6, color: group.color }}>✓</span>}
                </span>
                <div style={{
                  height: 1, flex: 1,
                  background: firstUnlocked
                    ? `linear-gradient(90deg, ${group.color}60, transparent)`
                    : "rgba(255,255,255,0.06)"
                }} />
              </div>

              {/* Lessons in group */}
              <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${groupLessons.length}, 1fr)`,
                gap: 8, position: "relative"
              }}>
                {/* Connector line between cards */}
                {groupLessons.length > 1 && (
                  <div style={{
                    position: "absolute",
                    top: "50%", left: "calc(100% / " + (groupLessons.length * 2) + ")",
                    right: "calc(100% / " + (groupLessons.length * 2) + ")",
                    height: 2,
                    background: `linear-gradient(90deg, ${group.color}50, ${group.color}20)`,
                    transform: "translateY(-50%)",
                    zIndex: 0, pointerEvents: "none"
                  }} />
                )}

                {groupLessons.map((l, li) => {
                  const done = (prog[l.id] || []).length;
                  const total = l.items.length;
                  const ul = isUnlocked(l.id);
                  const isDone = done >= Math.ceil(total * 0.7);
                  const pct = total ? (done / total) * 100 : 0;
                  const lColor = lessonColors[l.id] || { primary: C.y };
                  const isHovered = hoveredId === l.id;
                  const isCurrent = currentLesson && currentLesson.id === l.id;

                  return (
                    <div
                      key={l.id}
                      onClick={() => ul && (setCurId(l.id), setScreen("lesson"))}
                      onMouseEnter={() => ul && setHoveredId(l.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      style={{
                        position: "relative", zIndex: 1,
                        background: isDone
                          ? `linear-gradient(160deg, ${lColor.primary}22, rgba(15,18,28,0.95))`
                          : ul
                            ? `linear-gradient(160deg, ${lColor.primary}0f, rgba(15,18,28,0.97))`
                            : "rgba(20,23,32,0.7)",
                        border: "1px solid " + (
                          isCurrent ? lColor.primary + "90" :
                          isDone ? lColor.primary + "55" :
                          ul ? lColor.primary + "30" :
                          "rgba(255,255,255,0.06)"
                        ),
                        borderRadius: 14,
                        padding: "14px 10px",
                        textAlign: "center",
                        cursor: ul ? "pointer" : "not-allowed",
                        opacity: ul ? 1 : 0.5,
                        transform: isHovered ? "translateY(-5px) scale(1.02)" : "translateY(0) scale(1)",
                        boxShadow: isHovered
                          ? `0 12px 32px ${lColor.primary}35, 0 0 0 1px ${lColor.primary}40`
                          : isCurrent
                            ? `0 0 20px ${lColor.primary}30`
                            : "none",
                        transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                        userSelect: "none"
                      }}>

                      {/* Current badge */}
                      {isCurrent && (
                        <div style={{
                          position: "absolute", top: -8, left: "50%", transform: "translateX(-50%)",
                          fontSize: 9, fontFamily: "monospace", color: lColor.primary,
                          background: "rgba(10,12,20,0.95)", border: "1px solid " + lColor.primary + "60",
                          borderRadius: 6, padding: "2px 8px", whiteSpace: "nowrap",
                          animation: "pulse 2s ease-in-out infinite"
                        }}>▶ أنت هنا</div>
                      )}

                      {/* Lock overlay */}
                      {!ul && (
                        <div style={{
                          position: "absolute", inset: 0, borderRadius: 14,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          background: "rgba(10,12,20,0.5)", fontSize: 20, zIndex: 2
                        }}>🔒</div>
                      )}

                      <div style={{ fontSize: "clamp(20px,3vw,28px)", marginBottom: 6, filter: ul ? "none" : "grayscale(1)" }}>
                        {l.icon}
                      </div>
                      <div style={{
                        fontSize: "clamp(9px,1.4vw,11px)", fontWeight: 700,
                        color: ul ? lColor.primary : C.text3, marginBottom: 4,
                        lineHeight: 1.3
                      }}>{l.title}</div>

                      {/* XP badge */}
                      <div style={{
                        fontSize: 9, fontFamily: "monospace", color: isDone ? "#ffd700" : C.text3,
                        marginBottom: 8
                      }}>+{l.xp} XP</div>

                      {/* Progress bar */}
                      <div style={{ height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, marginBottom: 5, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", background: lColor.primary,
                          borderRadius: 2,
                          width: animIn ? pct + "%" : "0%",
                          transition: `width 1s ease ${gi * 0.08 + li * 0.05 + 0.3}s`,
                          boxShadow: pct > 0 ? "0 0 6px " + lColor.primary : "none"
                        }} />
                      </div>

                      <div style={{ fontSize: 9, fontFamily: "monospace", color: C.text3 }}>
                        {done}/{total}
                        {isDone && <span style={{ color: lColor.primary, marginRight: 4 }}> ✓</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Arrow to next group */}
              {gi < GROUPS.length - 1 && (
                <div style={{ textAlign: "center", padding: "8px 0 0", fontSize: 16, color: "rgba(255,255,255,0.12)" }}>
                  ↓
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{
        marginTop: 28, padding: "14px 18px",
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 10, display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center"
      }}>
        {[
          ["✓", "#00ff88", "مكتمل (70%+)"],
          ["▶", "#ffd700", "جاري (أنت هنا)"],
          ["●", "#4a9eff", "متاح"],
          ["🔒", "#666", "مقفل"],
        ].map(([icon, color, label]) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontFamily: "monospace" }}>
            <span style={{ color }}>{icon}</span>
            <span style={{ color: C.text3 }}>{label}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
