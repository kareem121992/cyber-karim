import { useState, useRef, useEffect } from 'react';
import { NanoEditor } from './NanoEditor.js';

export function NanoEditorComponent({ onClose, terminalFs }) {
  const [editor] = useState(() => new NanoEditor('test.txt', ''));
  const [display, setDisplay] = useState(editor.getDisplay());
  const [savedMessage, setSavedMessage] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e) => {
    // Ctrl+X = Exit
    if (e.ctrlKey && e.key === 'x') {
      e.preventDefault();
      onClose(editor.save());
      return;
    }

    // Ctrl+S = Save
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      const saved = editor.save();
      setSavedMessage(`✓ Saved: ${saved.filename}`);
      setTimeout(() => setSavedMessage(''), 2000);
      setDisplay({ ...editor.getDisplay() });
      return;
    }

    // Regular character input
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      editor.insertChar(e.key);
      setDisplay({ ...editor.getDisplay() });
      return;
    }

    // Enter
    if (e.key === 'Enter') {
      e.preventDefault();
      editor.newLine();
      setDisplay({ ...editor.getDisplay() });
      return;
    }

    // Backspace
    if (e.key === 'Backspace') {
      e.preventDefault();
      editor.backspace();
      setDisplay({ ...editor.getDisplay() });
      return;
    }

    // Delete
    if (e.key === 'Delete') {
      e.preventDefault();
      editor.delete();
      setDisplay({ ...editor.getDisplay() });
      return;
    }

    // Arrow keys
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      editor.moveCursor('left');
      setDisplay({ ...editor.getDisplay() });
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      editor.moveCursor('right');
      setDisplay({ ...editor.getDisplay() });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      editor.moveCursor('up');
      setDisplay({ ...editor.getDisplay() });
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      editor.moveCursor('down');
      setDisplay({ ...editor.getDisplay() });
    }
  };

  const colors = {
    bg: '#000000',
    text: '#ffffff',
    accent: '#00ffff',
    status: '#00ff88',
    border: '#ffffff',
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: colors.bg,
        color: colors.text,
        fontFamily: '"JetBrains Mono", monospace',
        fontSize: 13,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 10000,
      }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Top bar */}
      <div
        style={{
          background: colors.accent,
          color: colors.bg,
          padding: '4px 8px',
          fontWeight: 'bold',
          fontSize: 12,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>GNU nano 5.0 -- Cyber Academy Edition</span>
        <span>{display.filename} {display.isModified ? '[Modified]' : ''}</span>
      </div>

      {/* Editor content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '8px',
          lineHeight: 1.6,
        }}
      >
        {display.lines.map((line, idx) => (
          <div key={idx} style={{ position: 'relative', minHeight: '20px' }}>
            <span style={{ color: '#666666' }}>
              {String(idx + 1).padStart(3, ' ')} 
            </span>
            <span style={{ marginLeft: '4px' }}>
              {line.split('').map((char, col) => (
                <span
                  key={col}
                  style={{
                    backgroundColor:
                      idx === display.cursorLine && col === display.cursorCol
                        ? colors.accent
                        : 'transparent',
                    color:
                      idx === display.cursorLine && col === display.cursorCol
                        ? colors.bg
                        : colors.text,
                  }}
                >
                  {char}
                </span>
              ))}
              {/* Cursor at end of line */}
              {idx === display.cursorLine && display.cursorCol === line.length && (
                <span
                  style={{
                    backgroundColor: colors.accent,
                    color: colors.bg,
                  }}
                >
                  {' '}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      {/* Status bar */}
      <div
        style={{
          borderTop: `1px solid ${colors.border}`,
          padding: '4px 8px',
          fontSize: 11,
          color: colors.status,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <div>
          Line {display.cursorLine + 1}, Col {display.cursorCol + 1}
        </div>
        <div>
          {display.lineCount} lines, {display.charCount} chars
        </div>
      </div>

      {/* Help bar */}
      <div
        style={{
          background: '#333333',
          padding: '6px 8px',
          fontSize: 10,
          borderTop: `1px solid ${colors.border}`,
        }}
      >
        <span style={{ marginRight: '16px' }}>
          <span style={{ color: colors.accent }}>^X</span> Exit
        </span>
        <span style={{ marginRight: '16px' }}>
          <span style={{ color: colors.accent }}>^S</span> Save
        </span>
        <span style={{ marginRight: '16px' }}>
          <span style={{ color: colors.accent }}>^K</span> Cut
        </span>
        <span>
          <span style={{ color: colors.accent }}>^U</span> Paste
        </span>
        {savedMessage && (
          <span style={{ marginLeft: '32px', color: colors.status }}>
            {savedMessage}
          </span>
        )}
      </div>

      {/* Hidden input */}
      <input
        ref={inputRef}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
        }}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
