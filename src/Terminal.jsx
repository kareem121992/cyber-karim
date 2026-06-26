import { useState, useRef, useEffect } from "react";
import { runCommand, makeInitialFS, HOME_PATH, formatPrompt } from "./terminalEngine.js";

// مكوّن Terminal تفاعلي قابل لإعادة الاستخدام.
// لو مرّرنا له challenge، بيتحقق تلقائيًا من إن المستخدم نفّذ الأمر
// المطلوب، ويظهر له تأكيد نجاح بعد التنفيذ الصحيح.
//
// props:
//   challenge: { instruction: string, check: (cmd, result, state) => boolean, hint: string } | null
//   onSolved: () => void
//   height: number (px)
export default function Terminal({ challenge, onSolved, height = 280 }) {
  const [state, setState] = useState(() => ({
    fs: makeInitialFS(),
    cwd: [...HOME_PATH],
  }));
  const [lines, setLines] = useState([
    { type: "system", text: "محاكي Terminal — اكتب 'help' لعرض الأوامر المتاحة" },
  ]);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [solved, setSolved] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [lines]);

  function focusInput() {
    if (inputRef.current) inputRef.current.focus();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const cmd = input;
    if (!cmd.trim()) return;

    const prompt = formatPrompt(state.cwd);
    const result = runCommand(cmd, state);

    if (result.output === "__CLEAR__") {
      setLines([]);
      setState(result.newState);
      setCmdHistory((h) => [...h, cmd]);
      setHistIdx(-1);
      setInput("");
      return;
    }

    const newLines = [...lines, { type: "input", prompt, text: cmd }];
    if (result.output) newLines.push({ type: "output", text: result.output });

    setLines(newLines);
    setState(result.newState);
    setCmdHistory((h) => [...h, cmd]);
    setHistIdx(-1);
    setInput("");

    // فحص التحدي لو موجود
    if (challenge && !solved && challenge.check(cmd, result, result.newState)) {
      setSolved(true);
      setLines((ls) => [...ls, { type: "success", text: "✅ تمام! نفّذت الأمر الصح." }]);
      if (onSolved) onSolved();
    }
  }

  function handleKeyDown(e) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length === 0) return;
      const newIdx = histIdx === -1 ? cmdHistory.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(newIdx);
      setInput(cmdHistory[newIdx]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (histIdx === -1) return;
      const newIdx = histIdx + 1;
      if (newIdx >= cmdHistory.length) {
        setHistIdx(-1);
        setInput("");
      } else {
        setHistIdx(newIdx);
        setInput(cmdHistory[newIdx]);
      }
    }
  }

  const C = {
    bg: "#0a0b0d",
    border: "rgba(61,220,132,0.25)",
    green: "#3ddc84",
    text: "#cdd6f4",
    text2: "#7480a0",
    yellow: "#ffd700",
    red: "#ff5555",
  };

  return (
    <div style={{ borderRadius: 10, overflow: "hidden", border: "1px solid " + C.border, background: C.bg }}>
      {challenge && (
        <div
          style={{
            padding: "8px 14px",
            background: solved ? "rgba(61,220,132,0.1)" : "rgba(255,215,0,0.08)",
            borderBottom: "1px solid " + C.border,
            fontSize: 12,
            fontFamily: "Cairo, sans-serif",
            color: solved ? C.green : C.yellow,
          }}
        >
          {solved ? "✅ " : "🎯 "}
          {challenge.instruction}
        </div>
      )}
      <div
        ref={scrollRef}
        onClick={focusInput}
        style={{
          height,
          overflowY: "auto",
          padding: 12,
          fontFamily: "monospace",
          fontSize: 12.5,
          lineHeight: 1.7,
          direction: "ltr",
          textAlign: "left",
          cursor: "text",
        }}
      >
        {lines.map((l, i) => (
          <div key={i}>
            {l.type === "input" && (
              <div>
                <span style={{ color: C.green }}>{l.prompt}</span>{" "}
                <span style={{ color: C.text }}>{l.text}</span>
              </div>
            )}
            {l.type === "output" && (
              <div style={{ color: C.text2, whiteSpace: "pre-wrap" }}>{l.text}</div>
            )}
            {l.type === "system" && (
              <div style={{ color: C.text2, fontStyle: "italic" }}># {l.text}</div>
            )}
            {l.type === "success" && (
              <div style={{ color: C.green, fontWeight: 700 }}>{l.text}</div>
            )}
          </div>
        ))}
        <form onSubmit={handleSubmit} style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ color: C.green, whiteSpace: "nowrap" }}>{formatPrompt(state.cwd)}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck={false}
            autoComplete="off"
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: C.text,
              fontFamily: "monospace",
              fontSize: 12.5,
            }}
          />
        </form>
      </div>
    </div>
  );
}
