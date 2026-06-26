import { useState, useRef } from 'react';
import { PythonInterpreter } from './PythonInterpreter.js';

export function PythonComponent() {
  const [code, setCode] = useState(`# Python Tutorial
# اكتب الكود بتاعك هنا

print("Hello, World!")
x = 5
y = 10
print(x + y)

for i in range(3):
    print("Count:", i)
`);
  
  const [output, setOutput] = useState('');
  const [interpreter] = useState(() => new PythonInterpreter());
  const editorRef = useRef(null);

  const runCode = () => {
    const result = interpreter.run(code);
    setOutput(result);
  };

  const clearCode = () => {
    setCode('');
    setOutput('');
  };

  const colors = {
    bg: '#0a0e27',
    bg2: '#1a1f3a',
    text: '#00ff88',
    accent: '#00ffff',
    error: '#ff0055',
    success: '#00ff88',
    border: '#00ffff',
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 16,
      marginBottom: 20,
    }}>
      {/* Code Editor */}
      <div style={{
        border: `2px solid ${colors.border}`,
        borderRadius: 8,
        padding: 16,
        background: colors.bg,
        boxShadow: `0 0 20px ${colors.border}40`,
      }}>
        <div style={{
          fontSize: 12,
          fontWeight: 'bold',
          color: colors.accent,
          marginBottom: 12,
          textShadow: `0 0 5px ${colors.accent}`,
        }}>
          📝 Python Code Editor
        </div>

        <textarea
          ref={editorRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{
            width: '100%',
            height: 350,
            background: colors.bg2,
            color: colors.text,
            border: `1px solid ${colors.border}30`,
            borderRadius: 6,
            padding: 12,
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12,
            lineHeight: 1.5,
            resize: 'none',
            outline: 'none',
            caretColor: colors.accent,
          }}
          spellCheck="false"
          placeholder="اكتب الكود بتاعك هنا..."
        />

        <div style={{
          display: 'flex',
          gap: 8,
          marginTop: 12,
        }}>
          <button
            onClick={runCode}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: colors.success,
              color: colors.bg,
              border: 'none',
              borderRadius: 6,
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 12,
              textShadow: `0 0 10px ${colors.success}`,
              transition: 'all 0.3s',
            }}
            onMouseOver={(e) => {
              e.target.style.boxShadow = `0 0 15px ${colors.success}, inset 0 0 10px ${colors.success}40`;
            }}
            onMouseOut={(e) => {
              e.target.style.boxShadow = 'none';
            }}
          >
            ▶️ Run
          </button>

          <button
            onClick={clearCode}
            style={{
              flex: 1,
              padding: '10px 16px',
              background: colors.error,
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: 12,
              transition: 'all 0.3s',
            }}
            onMouseOver={(e) => {
              e.target.style.boxShadow = `0 0 15px ${colors.error}, inset 0 0 10px ${colors.error}40`;
            }}
            onMouseOut={(e) => {
              e.target.style.boxShadow = 'none';
            }}
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Output Terminal */}
      <div style={{
        border: `2px solid ${colors.border}`,
        borderRadius: 8,
        padding: 16,
        background: colors.bg,
        boxShadow: `0 0 20px ${colors.border}40`,
        backgroundImage: `
          repeating-linear-gradient(
            0deg,
            rgba(0, 255, 136, 0.03),
            rgba(0, 255, 136, 0.03) 1px,
            transparent 1px,
            transparent 2px
          )
        `,
      }}>
        <div style={{
          fontSize: 12,
          fontWeight: 'bold',
          color: colors.accent,
          marginBottom: 12,
          textShadow: `0 0 5px ${colors.accent}`,
        }}>
          🖥️ Output
        </div>

        <div style={{
          background: colors.bg2,
          border: `1px solid ${colors.border}30`,
          borderRadius: 6,
          padding: 12,
          height: 350,
          overflowY: 'auto',
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 12,
          lineHeight: 1.5,
          color: colors.text,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          textShadow: `0 0 2px ${colors.text}`,
        }}>
          {output || (
            <span style={{ color: colors.text, opacity: 0.5 }}>
              {/* اضغط Run عشان تشوف الناتج */}
            </span>
          )}
        </div>

        <div style={{
          marginTop: 12,
          fontSize: 11,
          color: colors.text,
          opacity: 0.7,
        }}>
          💡 اكتب كود Python واضغط Run عشان تشوف الناتج فوراً
        </div>
      </div>
    </div>
  );
}
