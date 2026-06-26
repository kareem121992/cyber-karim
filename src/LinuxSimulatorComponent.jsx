import { useState, useEffect, useRef } from 'react';
import { LinuxSimulator } from './LinuxSimulator.js';

export function LinuxSimulatorComponent() {
  const [output, setOutput] = useState([
    { type: 'system', text: '╔════════════════════════════════════════╗' },
    { type: 'system', text: '║  Cyber Academy Linux Simulator v1.0   ║' },
    { type: 'system', text: '║  Real Linux Environment in Browser!   ║' },
    { type: 'system', text: '╚════════════════════════════════════════╝' },
    { type: 'system', text: 'Type "help" for available commands' },
    { type: 'system', text: '' }
  ]);
  const [input, setInput] = useState('');
  const [simulator] = useState(() => new LinuxSimulator());
  const [blinkCursor, setBlinkCursor] = useState(true);
  const endRef = useRef(null);

  // Cursor blink
  useEffect(() => {
    const interval = setInterval(() => setBlinkCursor(b => !b), 500);
    return () => clearInterval(interval);
  }, []);

  // Auto scroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output]);

  const handleCommand = (e) => {
    if (e.key === 'Enter') {
      const command = input.trim();
      const newOutput = [...output];

      if (command) {
        newOutput.push({
          type: 'command',
          prompt: simulator.getPrompt(),
          text: command
        });
      }

      const result = simulator.execute(command);

      if (result.output === '___CLEAR___') {
        setOutput([]);
      } else if (result.output) {
        newOutput.push({
          type: result.error ? 'error' : 'output',
          text: result.output
        });
      }

      setOutput(newOutput);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = simulator.getPrevCommand();
      if (prev) setInput(prev);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = simulator.getNextCommand();
      setInput(next || '');
    }
  };

  const colors = {
    bg: '#0a0e27',
    bg2: '#1a1f3a',
    text: '#00ff88',
    textDim: '#00aa55',
    prompt: '#00ffff',
    error: '#ff0055',
    warning: '#ffaa00',
    banner: '#00ffff',
    accent: '#ff00ff',
    success: '#00ff88',
    system: '#888888'
  };

  const LineComponent = ({ line, idx }) => {
    if (line.type === 'system') {
      return (
        <div key={idx} style={{
          color: colors.system,
          fontSize: 12,
          marginBottom: 2,
          fontStyle: 'italic'
        }}>
          {line.text}
        </div>
      );
    }

    if (line.type === 'command') {
      return (
        <div key={idx} style={{
          marginBottom: 4,
          fontSize: 13,
          fontFamily: '"JetBrains Mono", monospace',
          color: colors.text
        }}>
          <span dangerouslySetInnerHTML={{ __html: line.prompt }} />
          <span style={{
            color: colors.accent,
            fontWeight: 'bold',
            textShadow: `0 0 5px ${colors.accent}`
          }}>
            {line.text}
          </span>
        </div>
      );
    }

    if (line.type === 'error') {
      return (
        <div key={idx} style={{
          color: colors.error,
          marginBottom: 2,
          fontSize: 13,
          fontFamily: '"JetBrains Mono", monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word'
        }}>
          {line.text}
        </div>
      );
    }

    return (
      <div key={idx} style={{
        color: colors.text,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        marginBottom: 2,
        fontSize: 13,
        lineHeight: 1.4,
        fontFamily: '"JetBrains Mono", monospace',
      }}>
        {line.text || '\n'}
      </div>
    );
  };

  return (
    <div style={{
      background: colors.bg,
      backgroundImage: `
        repeating-linear-gradient(
          0deg,
          rgba(0, 255, 136, 0.03),
          rgba(0, 255, 136, 0.03) 1px,
          transparent 1px,
          transparent 2px
        )
      `,
      border: `2px solid ${colors.banner}`,
      borderRadius: 8,
      padding: '20px',
      fontFamily: '"JetBrains Mono", monospace',
      color: colors.text,
      minHeight: 500,
      maxHeight: 700,
      overflow: 'auto',
      fontSize: 13,
      lineHeight: 1.6,
      direction: 'ltr',
      boxShadow: `
        0 0 20px ${colors.banner}40,
        inset 0 0 20px ${colors.banner}10,
        0 0 30px ${colors.accent}20
      `,
      position: 'relative',
    }}>
      {/* Terminal output */}
      <div style={{ marginBottom: 12 }}>
        {output.map((line, idx) => (
          <LineComponent key={idx} line={line} idx={idx} />
        ))}
      </div>

      {/* Input line */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleCommand}
          autoFocus
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: colors.accent,
            fontFamily: 'inherit',
            fontSize: 'inherit',
            outline: 'none',
            textShadow: `0 0 5px ${colors.accent}`,
            fontWeight: 'bold',
            caretColor: colors.accent,
          }}
          placeholder="اكتب الأمر..."
          spellCheck="false"
        />

        <span
          style={{
            color: colors.accent,
            opacity: blinkCursor ? 1 : 0.3,
            marginLeft: 2,
            textShadow: `0 0 5px ${colors.accent}`,
            transition: 'opacity 0.1s',
          }}
        >
          ▌
        </span>
      </div>

      {/* Scan lines overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          backgroundImage: `
            repeating-linear-gradient(
              0deg,
              rgba(0, 0, 0, 0.15),
              rgba(0, 0, 0, 0.15) 1px,
              transparent 1px,
              transparent 2px
            )
          `,
          borderRadius: 6,
        }}
      />

      <div ref={endRef} />
    </div>
  );
}
