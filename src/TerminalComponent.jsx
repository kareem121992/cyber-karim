import { useState, useEffect, useRef, useCallback } from 'react';
import { AdvancedTerminal } from './AdvancedTerminal.js';

const COLORS = {
  bg:       '#0d1117',
  bg2:      '#161b22',
  border:   '#30363d',
  green:    '#3fb950',
  greenDim: '#238636',
  cyan:     '#58a6ff',
  magenta:  '#bc8cff',
  yellow:   '#d29922',
  red:      '#f85149',
  white:    '#e6edf3',
  dimText:  '#7d8590',
};

export function TerminalComponent() {
  const [lines, setLines] = useState([
    { type: 'banner', text: '┌─────────────────────────────────────────────┐' },
    { type: 'banner', text: '│   Kali Linux Terminal  ·  Cyber Academy       │' },
    { type: 'banner', text: '└─────────────────────────────────────────────┘' },
    { type: 'info',   text: 'Type `help` for all 100+ available commands.' },
    { type: 'blank',  text: '' },
  ]);
  const [input, setInput]   = useState('');
  const [term]              = useState(() => new AdvancedTerminal());
  const [prompt, setPrompt] = useState('');
  const [blink, setBlink]   = useState(true);
  const endRef    = useRef(null);
  const inputRef  = useRef(null);

  // Update prompt whenever term changes (after cd etc.)
  const refreshPrompt = useCallback(() => setPrompt(term.getPrompt()), [term]);
  useEffect(() => { refreshPrompt(); }, [refreshPrompt]);

  // Cursor blink
  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 530);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [lines]);

  // Click anywhere → focus input
  const focusInput = () => inputRef.current?.focus();

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      const cmd = input.trim();

      // Show the command with current prompt
      const newLines = [
        ...lines,
        { type: 'cmd', prompt: term.getPrompt(), text: cmd },
      ];

      if (cmd) {
        const result = term.execute(cmd);
        if (result === '___CLEAR___') {
          setLines([]);
          setInput('');
          refreshPrompt();
          return;
        }
        if (result && result.trim() !== '') {
          // Split multi-line output
          const outputLines = result.split('\n');
          outputLines.forEach(l => newLines.push({ type: 'out', text: l }));
        }
      }

      newLines.push({ type: 'blank', text: '' });
      setLines(newLines);
      setInput('');
      refreshPrompt();

    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = term.getPrevCommand();
      if (prev) setInput(prev);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setInput(term.getNextCommand() || '');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Simple tab: show hint
      const cmds = ['ls','cd','cat','grep','find','nmap','mkdir','touch','rm','cp','mv','chmod','sudo','python3','git','vim','nano','clear','history','help','whoami','ifconfig','ping','netstat','ssh','curl','wget','base64','xxd','openssl','hydra','john','nikto','sqlmap','msfconsole','dirb','gobuster','ffuf','searchsploit','aircrack-ng','airmon-ng','airodump-ng','enum4linux','wpscan','whatweb','binwalk','exiftool','strings','hashcat','md5sum','sha256sum','tar','zip','unzip','apt','dpkg','pip3','systemctl','journalctl','ps','top','free','df','du','uname','uptime','lscpu','lsblk','lsusb','lspci','dmesg','iptables','ufw','nc','tcpdump','tshark','whois','arp','route','traceroute','dig','nslookup','host','id','groups','passwd','useradd','chmod','chown','strace','gdb','gcc','make','readelf','objdump','ldd'];
      if (input) {
        const matches = cmds.filter(c => c.startsWith(input));
        if (matches.length === 1) setInput(matches[0]);
        else if (matches.length > 1) {
          setLines(l => [...l, { type: 'info', text: matches.join('  ') }]);
        }
      }
    }
  };

  const renderLine = (line, i) => {
    switch (line.type) {
      case 'banner':
        return (
          <div key={i} style={{ color: COLORS.cyan, fontWeight: 'bold', lineHeight: 1.4, letterSpacing: 1 }}>
            {line.text}
          </div>
        );
      case 'info':
        return (
          <div key={i} style={{ color: COLORS.dimText, fontSize: 12, fontStyle: 'italic', marginBottom: 2 }}>
            {line.text}
          </div>
        );
      case 'blank':
        return <div key={i} style={{ height: 4 }} />;
      case 'cmd':
        return (
          <div key={i} style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 1 }}>
            <PromptSpan text={line.prompt} />
            <span style={{ color: COLORS.white, fontWeight: '500' }}>{line.text}</span>
          </div>
        );
      case 'out':
        return (
          <div key={i} style={{
            color: line.text.startsWith('bash:') || line.text.includes('error') || line.text.includes('Error') || line.text.includes('failed') || line.text.includes('cannot')
              ? COLORS.red
              : line.text.startsWith('[+]') || line.text.startsWith('✓') || line.text.includes('KEY FOUND') || line.text.includes('Pwn3d')
              ? COLORS.green
              : line.text.startsWith('[*]') || line.text.startsWith('[INFO]')
              ? COLORS.cyan
              : line.text.startsWith('[!]') || line.text.startsWith('[CRITICAL]') || line.text.startsWith('[ERROR]')
              ? COLORS.yellow
              : COLORS.white,
            whiteSpace: 'pre',
            lineHeight: 1.45,
            fontSize: 13,
          }}>
            {line.text || '\u00a0'}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={focusInput}
      style={{
        background: COLORS.bg,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 10,
        fontFamily: '"JetBrains Mono", "Fira Code", "Cascadia Code", "Courier New", monospace',
        fontSize: 13,
        lineHeight: 1.5,
        color: COLORS.white,
        minHeight: 520,
        maxHeight: 680,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        cursor: 'text',
      }}
    >
      {/* Title bar */}
      <div style={{
        background: COLORS.bg2,
        borderBottom: `1px solid ${COLORS.border}`,
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        userSelect: 'none',
        flexShrink: 0,
      }}>
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f56', display: 'inline-block' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffbd2e', display: 'inline-block' }} />
        <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#27c93f', display: 'inline-block' }} />
        <span style={{ flex: 1, textAlign: 'center', color: COLORS.dimText, fontSize: 12 }}>
          kali@kali-linux ~ terminal
        </span>
      </div>

      {/* Output area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', scrollbarWidth: 'thin', scrollbarColor: `${COLORS.border} transparent` }}>
        {lines.map(renderLine)}

        {/* Active input line */}
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          <PromptSpan text={prompt} />
          <div style={{ position: 'relative', flex: 1, minWidth: 60 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              autoFocus
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: COLORS.white,
                fontFamily: 'inherit',
                fontSize: 'inherit',
                lineHeight: 'inherit',
                padding: 0,
                margin: 0,
                caretColor: 'transparent', // we draw our own cursor
              }}
            />
            {/* Fake blinking cursor */}
            <span style={{
              position: 'absolute',
              left: `${input.length}ch`,
              top: 0,
              bottom: 0,
              width: '0.55em',
              background: COLORS.green,
              opacity: blink ? 0.85 : 0,
              transition: 'opacity 0.1s',
              pointerEvents: 'none',
            }} />
          </div>
        </div>
        <div ref={endRef} />
      </div>
    </div>
  );
}

function PromptSpan({ text }) {
  // Parse: user@host:path$
  const m = text?.match(/^(\w+)@(\w[\w-]*):([\S]*)(\$\s?)$/);
  if (!m) return <span style={{ color: COLORS.green, marginRight: 4 }}>{text}</span>;
  const [, user, host, path, dollar] = m;
  return (
    <span style={{ marginRight: 4, whiteSpace: 'nowrap' }}>
      <span style={{ color: COLORS.green,   fontWeight: 'bold' }}>{user}</span>
      <span style={{ color: COLORS.dimText }}                   >@</span>
      <span style={{ color: COLORS.green,   fontWeight: 'bold' }}>{host}</span>
      <span style={{ color: COLORS.dimText }}                   >:</span>
      <span style={{ color: COLORS.cyan,    fontWeight: 'bold' }}>{path}</span>
      <span style={{ color: COLORS.white }}                     >{dollar}</span>
    </span>
  );
}
