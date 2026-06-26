import { useState, useEffect, useRef } from "react";

// ─── Filesystem ───────────────────────────────────────────────────────────────
const initFS = {
  cwd: "/root",
  dirs: {
    "/": ["root", "home", "etc", "var", "usr", "tmp", "bin", "sbin"],
    "/root": ["Desktop", "Documents", "Downloads", ".bashrc", ".profile", ".ssh"],
    "/root/Desktop": ["targets.txt", "exploit.py", "scan_results.txt"],
    "/root/Documents": ["notes.txt", "wordlist.txt", "report.md"],
    "/root/Downloads": ["linpeas.sh", "payload.php"],
    "/root/.ssh": ["id_rsa", "id_rsa.pub", "known_hosts"],
    "/home": ["user"],
    "/home/user": ["flag.txt"],
    "/etc": ["passwd", "shadow", "hosts", "hostname", "crontab"],
    "/var": ["log"],
    "/var/log": ["auth.log", "syslog"],
    "/tmp": [],
    "/usr": ["bin", "share"],
    "/usr/bin": [],
    "/usr/share": ["wordlists"],
    "/usr/share/wordlists": ["rockyou.txt"],
    "/bin": [],
    "/sbin": [],
  },
  files: {
    "/root/.bashrc": "# ~/.bashrc\nexport PATH=$PATH:/usr/local/bin\nalias ll='ls -la'\nalias cls='clear'\nalias ports='netstat -tulpn'\nPS1='\\[\\033[01;31m\\]root\\[\\033[0m\\]@\\[\\033[01;36m\\]kali\\[\\033[0m\\]:\\[\\033[01;34m\\]\\w\\[\\033[0m\\]# '",
    "/root/.profile": "# ~/.profile\n[ -f ~/.bashrc ] && . ~/.bashrc",
    "/root/Desktop/targets.txt": "# Target Scope\n192.168.1.1\n192.168.1.100\n192.168.1.254\n10.10.10.5",
    "/root/Desktop/exploit.py": "#!/usr/bin/env python3\n# Cyber Academy - Educational Script\nimport socket\n\ndef main():\n    target = '192.168.1.100'\n    port = 4444\n    print(f'[*] Connecting to {target}:{port}')\n    print('Hello, Ethical Hacker!')\n\nif __name__ == '__main__':\n    main()",
    "/root/Desktop/scan_results.txt": "# Nmap Scan Results - 192.168.1.0/24\nHOST: 192.168.1.1   PORTS: 22,80,443\nHOST: 192.168.1.100 PORTS: 21,22,80,3306\nHOST: 192.168.1.254 PORTS: 80,8080",
    "/root/Documents/notes.txt": "# Penetration Testing Notes\n\n## Phase 1: Reconnaissance\n- Use nmap for port scanning\n- gobuster for directory enumeration\n\n## Phase 2: Scanning\n- nikto -h <target>\n- sqlmap -u <url>\n\n## Phase 3: Exploitation\n- metasploit framework\n- custom exploits\n\n## Phase 4: Post-exploitation\n- privilege escalation\n- lateral movement",
    "/root/Documents/wordlist.txt": "password\n123456\nadmin\nroot\ntoor\nkali\npassword123\nletmein\nqwerty\niloveyou",
    "/root/Documents/report.md": "# Penetration Test Report\n**Target:** 192.168.1.0/24\n**Date:** 2026-06-25\n**Tester:** root@kali\n\n## Executive Summary\nMultiple critical vulnerabilities found.",
    "/root/Downloads/linpeas.sh": "#!/bin/bash\n# LINux Privilege Escalation Awesome Script\necho '[*] Starting LinPEAS...'\necho '[+] System Info'\nuname -a\nid\necho '[+] Checking SUID files...'\nfind / -perm -4000 2>/dev/null",
    "/root/Downloads/payload.php": "<?php\n// Educational PHP webshell\nif(isset($_GET['cmd'])){\n    echo '<pre>';\n    system($_GET['cmd']);\n    echo '</pre>';\n}\n?>",
    "/root/.ssh/id_rsa": "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA2a2rwplBQLzHPZe5RJr9qqsqL4JTCgHLQ...\n[Educational Key - Not Real]\n-----END RSA PRIVATE KEY-----",
    "/root/.ssh/id_rsa.pub": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQDZravWmUB... root@kali",
    "/root/.ssh/known_hosts": "192.168.1.100 ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB...",
    "/home/user/flag.txt": "FLAG{cyber_academy_2026_you_found_me}",
    "/etc/passwd": "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nuser:x:1000:1000:User,,,:/home/user:/bin/bash",
    "/etc/shadow": "root:$6$rounds=656000$kalilinux$randomhashhere:19000:0:99999:7:::\nuser:$6$rounds=656000$somesalt$anotherhash:19000:0:99999:7:::",
    "/etc/hosts": "127.0.0.1\tlocalhost\n127.0.1.1\tkali\n192.168.1.100\ttarget.local\n::1\t\tlocalhost ip6-localhost ip6-loopback",
    "/etc/hostname": "kali",
    "/etc/crontab": "# /etc/crontab\nSHELL=/bin/sh\nPATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin\n17 * * * * root cd / && run-parts --report /etc/cron.hourly\n*/5 * * * * root /opt/backup.sh",
    "/var/log/auth.log": "Jun 25 00:01:23 kali sshd[423]: Server listening on 0.0.0.0 port 22.\nJun 25 00:05:11 kali sshd[512]: Accepted password for root from 192.168.1.50 port 54321 ssh2\nJun 25 00:05:44 kali sudo: root : TTY=pts/0 ; PWD=/root ; USER=root ; COMMAND=/bin/bash",
    "/var/log/syslog": "Jun 25 00:00:01 kali kernel: [    0.000000] Linux version 6.1.0-kali9-amd64\nJun 25 00:00:02 kali kernel: [    0.000001] Command line: BOOT_IMAGE=/vmlinuz-6.1.0\nJun 25 00:01:00 kali systemd[1]: Started OpenBSD Secure Shell server.",
    "/usr/share/wordlists/rockyou.txt": "password\n123456\n12345678\nqwerty\nabc123\nmonkey\n1234567\nletmein\ntrustno1\ndragon\n[...14,341,564 more lines...]",
  },
  history: [],
  env: {
    PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
    HOME: "/root",
    USER: "root",
    SHELL: "/bin/bash",
    TERM: "xterm-256color",
    LANG: "en_US.UTF-8",
  },
  aliases: {
    ll: "ls -la",
    cls: "clear",
    ports: "netstat -tulpn",
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function resolvePath(p, cwd) {
  if (!p || p === "~") return "/root";
  if (p.startsWith("/")) return p.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
  if (p === ".") return cwd;
  if (p === "..") return cwd.split("/").slice(0, -1).join("/") || "/";
  // handle .. in middle of path
  const parts = `${cwd}/${p}`.split("/").filter(Boolean);
  const resolved = [];
  for (const part of parts) {
    if (part === "..") resolved.pop();
    else if (part !== ".") resolved.push(part);
  }
  return "/" + resolved.join("/");
}

function listDir(fs, path) {
  return fs.dirs[path] || null;
}

// ─── Command Processor ────────────────────────────────────────────────────────
function processCommand(input, fs) {
  const trimmed = input.trim();
  if (!trimmed) return { output: "", fs };

  // Check aliases
  const firstWord = trimmed.split(" ")[0];
  if (fs.aliases[firstWord]) {
    const expanded = trimmed.replace(firstWord, fs.aliases[firstWord]);
    return processCommand(expanded, fs);
  }

  const newFs = { ...fs, history: [...fs.history, trimmed] };

  // ── Pipe / Redirect / Chain support ──────────────────────────────────────
  // Handle && chaining
  if (trimmed.includes(" && ")) {
    const cmds = trimmed.split(" && ");
    let currentFs = newFs;
    let lastOutput = "";
    for (const cmd of cmds) {
      const r = processCommand(cmd.trim(), currentFs);
      currentFs = r.fs;
      lastOutput = r.output;
      if (r.output.startsWith("bash:") && r.output.includes("command not found")) {
        return { output: r.output, fs: currentFs };
      }
    }
    return { output: lastOutput, fs: currentFs };
  }

  // Handle ; chaining
  if (trimmed.includes(" ; ") || (trimmed.includes(";") && !trimmed.includes("'") && !trimmed.includes('"'))) {
    const cmds = trimmed.split(/\s*;\s*/);
    let currentFs = newFs;
    const outputs = [];
    for (const cmd of cmds) {
      if (!cmd.trim()) continue;
      const r = processCommand(cmd.trim(), currentFs);
      currentFs = r.fs;
      if (r.output) outputs.push(r.output);
    }
    return { output: outputs.join("\n"), fs: currentFs };
  }

  // Handle | pipe (basic: left output feeds concept, we simulate)
  if (trimmed.includes(" | ")) {
    const [left, ...rest] = trimmed.split(" | ");
    const leftResult = processCommand(left.trim(), newFs);
    const rightCmd = rest.join(" | ").trim();
    const rightParts = rightCmd.split(" ");
    const rightVerb = rightParts[0];

    if (rightVerb === "grep") {
      const pattern = rightParts[1] || "";
      const lines = leftResult.output.split("\n").filter(l => l.includes(pattern));
      return { output: lines.join("\n") || `grep: no match for '${pattern}'`, fs: leftResult.fs };
    }
    if (rightVerb === "wc") {
      const flag = rightParts[1] || "-l";
      const lines = leftResult.output.split("\n").filter(Boolean);
      if (flag === "-l") return { output: String(lines.length), fs: leftResult.fs };
      if (flag === "-w") return { output: String(leftResult.output.split(/\s+/).filter(Boolean).length), fs: leftResult.fs };
      if (flag === "-c") return { output: String(leftResult.output.length), fs: leftResult.fs };
      return { output: `${lines.length}`, fs: leftResult.fs };
    }
    if (rightVerb === "sort") {
      const lines = leftResult.output.split("\n").filter(Boolean);
      const sorted = rightParts.includes("-r") ? lines.sort().reverse() : lines.sort();
      return { output: sorted.join("\n"), fs: leftResult.fs };
    }
    if (rightVerb === "uniq") {
      const lines = leftResult.output.split("\n").filter(Boolean);
      const unique = lines.filter((l, i) => lines.indexOf(l) === i);
      return { output: unique.join("\n"), fs: leftResult.fs };
    }
    if (rightVerb === "head") {
      const n = parseInt(rightParts[rightParts.indexOf("-n") + 1] || rightParts[1]?.replace("-", "") || "10");
      return { output: leftResult.output.split("\n").slice(0, n).join("\n"), fs: leftResult.fs };
    }
    if (rightVerb === "tail") {
      const n = parseInt(rightParts[rightParts.indexOf("-n") + 1] || rightParts[1]?.replace("-", "") || "10");
      return { output: leftResult.output.split("\n").slice(-n).join("\n"), fs: leftResult.fs };
    }
    if (rightVerb === "less" || rightVerb === "more") {
      return { output: leftResult.output, fs: leftResult.fs };
    }
    // default: just run right command with left output ignored
    return processCommand(rightCmd, leftResult.fs);
  }

  // Handle > redirect (write to file)
  if (/ > /.test(trimmed) && !trimmed.startsWith("echo") === false || / > /.test(trimmed)) {
    const match = trimmed.match(/^(.+?)\s*>\s*(.+)$/);
    if (match) {
      const [, leftCmd, targetFile] = match;
      const leftResult = processCommand(leftCmd.trim(), newFs);
      const filePath = resolvePath(targetFile.trim(), leftResult.fs.cwd);
      const dirPath = filePath.split("/").slice(0, -1).join("/") || "/";
      const fileName = filePath.split("/").pop();
      const updatedFiles = { ...leftResult.fs.files, [filePath]: leftResult.output };
      const dirContents = [...(leftResult.fs.dirs[dirPath] || [])];
      if (!dirContents.includes(fileName)) dirContents.push(fileName);
      return {
        output: "",
        fs: { ...leftResult.fs, files: updatedFiles, dirs: { ...leftResult.fs.dirs, [dirPath]: dirContents } }
      };
    }
  }

  // Handle >> redirect (append to file)
  if (/ >> /.test(trimmed)) {
    const match = trimmed.match(/^(.+?)\s*>>\s*(.+)$/);
    if (match) {
      const [, leftCmd, targetFile] = match;
      const leftResult = processCommand(leftCmd.trim(), newFs);
      const filePath = resolvePath(targetFile.trim(), leftResult.fs.cwd);
      const dirPath = filePath.split("/").slice(0, -1).join("/") || "/";
      const fileName = filePath.split("/").pop();
      const existing = leftResult.fs.files[filePath] || "";
      const updatedFiles = { ...leftResult.fs.files, [filePath]: existing + "\n" + leftResult.output };
      const dirContents = [...(leftResult.fs.dirs[dirPath] || [])];
      if (!dirContents.includes(fileName)) dirContents.push(fileName);
      return {
        output: "",
        fs: { ...leftResult.fs, files: updatedFiles, dirs: { ...leftResult.fs.dirs, [dirPath]: dirContents } }
      };
    }
  }

  const parts = trimmed.split(/\s+/);
  const cmd = parts[0];
  const args = parts.slice(1);

  // ── Built-in commands ─────────────────────────────────────────────────────

  if (cmd === "clear") return { output: "__CLEAR__", fs: newFs };

  if (cmd === "exit" || cmd === "logout") return { output: "logout\nConnection to kali closed.", fs: newFs };

  if (cmd === "help") return {
    output: `┌─────────────────────────────────────────────────────────────────┐
│          Kali Linux Terminal - Cyber Academy                     │
│                   Available Commands                             │
└─────────────────────────────────────────────────────────────────┘

 NAVIGATION & FILES          SYSTEM INFO
  ls [opts] [dir]   - list    whoami       - current user
  cd <dir>          - chdir   id           - user/group ids
  pwd               - path    uname [-a]   - kernel info
  mkdir <dir>       - create  hostname     - show hostname
  touch <file>      - create  uptime       - system uptime
  cp <src> <dst>    - copy    date         - current date
  mv <src> <dst>    - move    df [-h]      - disk usage
  rm [-rf] <file>   - delete  free [-h]    - memory info
  cat <file>        - view    top          - processes
  head/tail <file>  - view    ps [aux]     - processes
  find <opts>       - search  kill <pid>   - kill process
  file <name>       - type    env          - environment

 TEXT PROCESSING             NETWORK
  grep <pat> <file> - search  ifconfig     - interfaces
  sort / uniq       - sort    ip addr      - interfaces
  wc [-l] <file>    - count   netstat      - connections
  cut / awk         - parse   ping <host>  - ping
  sed               - edit    ssh <host>   - connect
  base64            - encode  wget/curl    - download
  md5sum/sha256sum  - hash    nc           - netcat

 SECURITY TOOLS              MISC
  nmap <host>       - scan    echo <text>  - print
  hydra             - brute   history      - commands
  john              - crack   alias        - shortcuts
  hashcat           - crack   export VAR=  - set env
  sqlmap            - sqli    which <cmd>  - find binary
  nikto             - web     man <cmd>    - manual
  gobuster          - fuzz    clear        - clear screen
  msfconsole        - msf     python3      - python
  aircrack-ng       - wifi    bash         - run script

 OPERATORS: | && ; > >>  (pipes, chains, redirects all work!)`.trim(),
    fs: newFs
  };

  // ── Navigation ────────────────────────────────────────────────────────────

  if (cmd === "pwd") return { output: newFs.cwd, fs: newFs };

  if (cmd === "cd") {
    const dest = args[0];
    if (!dest || dest === "~") return { output: "", fs: { ...newFs, cwd: "/root" } };
    const newPath = resolvePath(dest, newFs.cwd);
    if (!newFs.dirs[newPath]) return { output: `bash: cd: ${dest}: No such file or directory`, fs: newFs };
    return { output: "", fs: { ...newFs, cwd: newPath } };
  }

  if (cmd === "ls") {
    const flags = args.filter(a => a.startsWith("-")).join("");
    const targetArg = args.find(a => !a.startsWith("-"));
    const target = targetArg ? resolvePath(targetArg, newFs.cwd) : newFs.cwd;
    const contents = listDir(newFs, target);
    if (!contents) return { output: `ls: cannot access '${targetArg}': No such file or directory`, fs: newFs };
    const showHidden = flags.includes("a");
    const isLong = flags.includes("l");
    const items = showHidden ? [".", "..", ...contents] : contents.filter(i => !i.startsWith("."));
    if (items.length === 0) return { output: "", fs: newFs };
    if (isLong) {
      const now = "Jun 25 00:00";
      const rows = items.map(item => {
        if (item === "." || item === "..") return `drwxr-xr-x 2 root root 4096 ${now} ${item}`;
        const isDir = !!newFs.dirs[`${target}/${item}`];
        const isExec = item.endsWith(".py") || item.endsWith(".sh") || item.endsWith(".pl");
        const perm = isDir ? "drwxr-xr-x" : (isExec ? "-rwxr-xr-x" : (item.startsWith(".") ? "-rw-------" : "-rw-r--r--"));
        const size = newFs.files[`${target}/${item}`]?.length || 4096;
        const color = isDir ? "\x1b[34m" : isExec ? "\x1b[32m" : "";
        return `${perm} 1 root root ${String(size).padStart(6)} ${now} ${color}${item}\x1b[0m`;
      });
      return { output: `total ${items.length * 8}\n` + rows.join("\n"), fs: newFs };
    }
    const cols = items.map(item => {
      if (item === "." || item === "..") return `\x1b[34m${item}\x1b[0m`;
      if (newFs.dirs[`${target}/${item}`]) return `\x1b[34m${item}\x1b[0m`;
      if (item.endsWith(".py") || item.endsWith(".sh") || item.endsWith(".pl")) return `\x1b[32m${item}\x1b[0m`;
      if (item.startsWith(".")) return `\x1b[90m${item}\x1b[0m`;
      return item;
    });
    return { output: cols.join("  "), fs: newFs };
  }

  // ── File Operations ───────────────────────────────────────────────────────

  if (cmd === "cat") {
    if (!args[0]) return { output: "cat: missing operand", fs: newFs };
    // support multiple files
    const outputs = [];
    for (const a of args) {
      const p = resolvePath(a, newFs.cwd);
      if (newFs.dirs[p]) { outputs.push(`cat: ${a}: Is a directory`); continue; }
      const content = newFs.files[p];
      if (content === undefined) { outputs.push(`cat: ${a}: No such file or directory`); continue; }
      outputs.push(content);
    }
    return { output: outputs.join("\n"), fs: newFs };
  }

  if (cmd === "head") {
    const n = args.includes("-n") ? parseInt(args[args.indexOf("-n") + 1]) :
              args.find(a => /^-\d+$/.test(a)) ? parseInt(args.find(a => /^-\d+$/.test(a)).slice(1)) : 10;
    const file = args.find(a => !a.startsWith("-") && isNaN(parseInt(a.slice(1))));
    if (!file) return { output: "head: missing file operand", fs: newFs };
    const p = resolvePath(file, newFs.cwd);
    const content = newFs.files[p];
    if (!content) return { output: `head: cannot open '${file}' for reading: No such file or directory`, fs: newFs };
    return { output: content.split("\n").slice(0, n).join("\n"), fs: newFs };
  }

  if (cmd === "tail") {
    const n = args.includes("-n") ? parseInt(args[args.indexOf("-n") + 1]) :
              args.find(a => /^-\d+$/.test(a)) ? parseInt(args.find(a => /^-\d+$/.test(a)).slice(1)) : 10;
    const file = args.find(a => !a.startsWith("-") && isNaN(parseInt(a.slice(1))));
    if (!file) return { output: "tail: missing file operand", fs: newFs };
    const p = resolvePath(file, newFs.cwd);
    const content = newFs.files[p];
    if (!content) return { output: `tail: cannot open '${file}' for reading: No such file or directory`, fs: newFs };
    return { output: content.split("\n").slice(-n).join("\n"), fs: newFs };
  }

  if (cmd === "echo") {
    // handle -e flag and variables
    let text = args.join(" ").replace(/^['"]|['"]$/g, "");
    // substitute env vars $VAR
    text = text.replace(/\$(\w+)/g, (_, v) => newFs.env[v] || "");
    return { output: text, fs: newFs };
  }

  if (cmd === "mkdir") {
    if (!args[0]) return { output: "mkdir: missing operand", fs: newFs };
    const targets = args.filter(a => !a.startsWith("-"));
    let currentFs = newFs;
    for (const t of targets) {
      const p = resolvePath(t, currentFs.cwd);
      const parent = p.split("/").slice(0, -1).join("/") || "/";
      const name = p.split("/").pop();
      if (currentFs.dirs[p]) continue;
      const updatedDirs = { ...currentFs.dirs, [p]: [] };
      updatedDirs[parent] = [...(currentFs.dirs[parent] || []), name];
      currentFs = { ...currentFs, dirs: updatedDirs };
    }
    return { output: "", fs: currentFs };
  }

  if (cmd === "touch") {
    if (!args[0]) return { output: "touch: missing file operand", fs: newFs };
    let currentFs = newFs;
    for (const a of args) {
      const p = resolvePath(a, currentFs.cwd);
      const parent = p.split("/").slice(0, -1).join("/") || "/";
      const name = p.split("/").pop();
      const updatedFiles = { ...currentFs.files, [p]: currentFs.files[p] || "" };
      const dirContents = [...(currentFs.dirs[parent] || [])];
      if (!dirContents.includes(name)) dirContents.push(name);
      currentFs = { ...currentFs, files: updatedFiles, dirs: { ...currentFs.dirs, [parent]: dirContents } };
    }
    return { output: "", fs: currentFs };
  }

  if (cmd === "cp") {
    if (args.length < 2) return { output: "cp: missing destination file operand", fs: newFs };
    const src = resolvePath(args[0], newFs.cwd);
    const dst = resolvePath(args[args.length - 1], newFs.cwd);
    const content = newFs.files[src];
    if (content === undefined && !newFs.dirs[src]) return { output: `cp: cannot stat '${args[0]}': No such file or directory`, fs: newFs };
    const fileName = src.split("/").pop();
    const destPath = newFs.dirs[dst] ? `${dst}/${fileName}` : dst;
    const destParent = destPath.split("/").slice(0, -1).join("/") || "/";
    const destName = destPath.split("/").pop();
    const updatedFiles = { ...newFs.files, [destPath]: content || "" };
    const dirContents = [...(newFs.dirs[destParent] || [])];
    if (!dirContents.includes(destName)) dirContents.push(destName);
    return { output: "", fs: { ...newFs, files: updatedFiles, dirs: { ...newFs.dirs, [destParent]: dirContents } } };
  }

  if (cmd === "mv") {
    if (args.length < 2) return { output: "mv: missing destination file operand", fs: newFs };
    const src = resolvePath(args[0], newFs.cwd);
    const dst = resolvePath(args[1], newFs.cwd);
    const srcName = src.split("/").pop();
    const srcParent = src.split("/").slice(0, -1).join("/") || "/";
    const content = newFs.files[src];
    if (content === undefined && !newFs.dirs[src]) return { output: `mv: cannot stat '${args[0]}': No such file or directory`, fs: newFs };
    const destPath = newFs.dirs[dst] ? `${dst}/${srcName}` : dst;
    const destParent = destPath.split("/").slice(0, -1).join("/") || "/";
    const destName = destPath.split("/").pop();
    const updatedFiles = { ...newFs.files };
    delete updatedFiles[src];
    updatedFiles[destPath] = content || "";
    const srcDir = (newFs.dirs[srcParent] || []).filter(i => i !== srcName);
    const destDir = [...(newFs.dirs[destParent] || [])];
    if (!destDir.includes(destName)) destDir.push(destName);
    return { output: "", fs: { ...newFs, files: updatedFiles, dirs: { ...newFs.dirs, [srcParent]: srcDir, [destParent]: destDir } } };
  }

  if (cmd === "rm") {
    if (!args[0]) return { output: "rm: missing operand", fs: newFs };
    const recursive = args.includes("-r") || args.includes("-rf") || args.includes("-R");
    const targets = args.filter(a => !a.startsWith("-"));
    let currentFs = newFs;
    for (const t of targets) {
      const p = resolvePath(t, currentFs.cwd);
      const parent = p.split("/").slice(0, -1).join("/") || "/";
      const name = p.split("/").pop();
      if (currentFs.dirs[p]) {
        if (!recursive) { return { output: `rm: cannot remove '${t}': Is a directory`, fs: currentFs }; }
        const updatedDirs = { ...currentFs.dirs };
        delete updatedDirs[p];
        updatedDirs[parent] = (currentFs.dirs[parent] || []).filter(i => i !== name);
        currentFs = { ...currentFs, dirs: updatedDirs };
      } else {
        if (!currentFs.files[p]) return { output: `rm: cannot remove '${t}': No such file or directory`, fs: currentFs };
        const updatedFiles = { ...currentFs.files };
        delete updatedFiles[p];
        const parentDir = (currentFs.dirs[parent] || []).filter(i => i !== name);
        currentFs = { ...currentFs, files: updatedFiles, dirs: { ...currentFs.dirs, [parent]: parentDir } };
      }
    }
    return { output: "", fs: currentFs };
  }

  if (cmd === "file") {
    if (!args[0]) return { output: "file: missing operand", fs: newFs };
    const p = resolvePath(args[0], newFs.cwd);
    if (newFs.dirs[p]) return { output: `${args[0]}: directory`, fs: newFs };
    const content = newFs.files[p];
    if (content === undefined) return { output: `file: '${args[0]}': No such file or directory`, fs: newFs };
    const ext = args[0].split(".").pop();
    const types = { py: "Python script, ASCII text executable", sh: "Bourne-Again shell script, ASCII text executable", txt: "ASCII text", md: "ASCII text", php: "PHP script, ASCII text", js: "JavaScript source, ASCII text" };
    return { output: `${args[0]}: ${types[ext] || "ASCII text"}`, fs: newFs };
  }

  // ── Text Processing ───────────────────────────────────────────────────────

  if (cmd === "grep") {
    const flags2 = args.filter(a => a.startsWith("-")).join("");
    const nonFlag = args.filter(a => !a.startsWith("-"));
    const pattern = nonFlag[0];
    const fileArg = nonFlag[1];
    if (!pattern) return { output: "Usage: grep [OPTIONS] PATTERN [FILE]", fs: newFs };
    if (!fileArg) return { output: `grep: ${pattern}: no input`, fs: newFs };
    const p = resolvePath(fileArg, newFs.cwd);
    const content = newFs.files[p];
    if (!content) return { output: `grep: ${fileArg}: No such file or directory`, fs: newFs };
    const caseFlag = flags2.includes("i");
    const invert = flags2.includes("v");
    const lineNum = flags2.includes("n");
    const lines2 = content.split("\n");
    const matched = lines2.map((l, i) => ({ l, i: i + 1 })).filter(({ l }) => {
      const match = caseFlag ? l.toLowerCase().includes(pattern.toLowerCase()) : l.includes(pattern);
      return invert ? !match : match;
    });
    if (matched.length === 0) return { output: "", fs: newFs };
    return { output: matched.map(({ l, i }) => lineNum ? `${i}:${l}` : l).join("\n"), fs: newFs };
  }

  if (cmd === "wc") {
    const flag = args.find(a => a.startsWith("-")) || "-l";
    const fileArg = args.find(a => !a.startsWith("-"));
    if (!fileArg) return { output: "wc: missing operand", fs: newFs };
    const p = resolvePath(fileArg, newFs.cwd);
    const content = newFs.files[p];
    if (!content) return { output: `wc: ${fileArg}: No such file or directory`, fs: newFs };
    if (flag === "-l") return { output: `${content.split("\n").length} ${fileArg}`, fs: newFs };
    if (flag === "-w") return { output: `${content.split(/\s+/).filter(Boolean).length} ${fileArg}`, fs: newFs };
    if (flag === "-c") return { output: `${content.length} ${fileArg}`, fs: newFs };
    return { output: `${content.split("\n").length} ${content.split(/\s+/).filter(Boolean).length} ${content.length} ${fileArg}`, fs: newFs };
  }

  if (cmd === "sort") {
    const fileArg = args.find(a => !a.startsWith("-"));
    const reverse = args.includes("-r");
    const unique2 = args.includes("-u");
    if (!fileArg) return { output: "sort: missing operand", fs: newFs };
    const p = resolvePath(fileArg, newFs.cwd);
    const content = newFs.files[p];
    if (!content) return { output: `sort: cannot read: ${fileArg}: No such file or directory`, fs: newFs };
    let lines3 = content.split("\n").filter(Boolean);
    if (unique2) lines3 = [...new Set(lines3)];
    lines3.sort();
    if (reverse) lines3.reverse();
    return { output: lines3.join("\n"), fs: newFs };
  }

  if (cmd === "uniq") {
    const fileArg = args.find(a => !a.startsWith("-"));
    if (!fileArg) return { output: "uniq: missing operand", fs: newFs };
    const p = resolvePath(fileArg, newFs.cwd);
    const content = newFs.files[p];
    if (!content) return { output: `uniq: ${fileArg}: No such file or directory`, fs: newFs };
    const lines4 = content.split("\n").filter(Boolean);
    return { output: lines4.filter((l, i) => lines4.indexOf(l) === i).join("\n"), fs: newFs };
  }

  if (cmd === "cut") {
    const fileArg = args.find(a => !a.startsWith("-"));
    const dIdx = args.indexOf("-d");
    const fIdx = args.indexOf("-f");
    const delim = dIdx !== -1 ? args[dIdx + 1] : "\t";
    const field = fIdx !== -1 ? parseInt(args[fIdx + 1]) - 1 : 0;
    if (!fileArg) return { output: "cut: missing operand", fs: newFs };
    const p = resolvePath(fileArg, newFs.cwd);
    const content = newFs.files[p];
    if (!content) return { output: `cut: ${fileArg}: No such file or directory`, fs: newFs };
    return { output: content.split("\n").map(l => l.split(delim)[field] || "").join("\n"), fs: newFs };
  }

  if (cmd === "awk") {
    const fileArg = args.find(a => !a.startsWith("{") && !a.startsWith("'") && !a.startsWith("-") && args.indexOf(a) > args.findIndex(a2 => a2.includes("{")));
    const printMatch = args.join(" ").match(/\{print \$(\d+)\}/);
    if (printMatch && fileArg) {
      const fieldN = parseInt(printMatch[1]) - 1;
      const p = resolvePath(fileArg, newFs.cwd);
      const content = newFs.files[p];
      if (!content) return { output: `awk: ${fileArg}: No such file or directory`, fs: newFs };
      return { output: content.split("\n").map(l => l.split(/\s+/)[fieldN] || "").filter(Boolean).join("\n"), fs: newFs };
    }
    return { output: "awk: simulated - basic {print $N} supported", fs: newFs };
  }

  if (cmd === "sed") {
    return { output: "sed: simulated command - pattern substitution not available in this terminal", fs: newFs };
  }

  if (cmd === "base64") {
    const decode = args.includes("-d") || args.includes("--decode");
    const fileArg = args.find(a => !a.startsWith("-"));
    if (fileArg) {
      const p = resolvePath(fileArg, newFs.cwd);
      const content = newFs.files[p];
      if (!content) return { output: `base64: ${fileArg}: No such file or directory`, fs: newFs };
      try {
        return { output: decode ? atob(content.trim()) : btoa(content), fs: newFs };
      } catch { return { output: "base64: invalid input", fs: newFs }; }
    }
    return { output: "base64: reading from stdin not supported in this terminal", fs: newFs };
  }

  if (cmd === "md5sum") {
    const fileArg = args[0];
    if (!fileArg) return { output: "md5sum: missing operand", fs: newFs };
    const p = resolvePath(fileArg, newFs.cwd);
    const content = newFs.files[p];
    if (!content) return { output: `md5sum: ${fileArg}: No such file or directory`, fs: newFs };
    // deterministic fake hash based on content length
    const fake = Array.from(content).reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xffffffff, 0).toString(16).padStart(8, "0");
    return { output: `${fake}00000000${fake}00000000  ${fileArg}`, fs: newFs };
  }

  if (cmd === "sha256sum") {
    const fileArg = args[0];
    if (!fileArg) return { output: "sha256sum: missing operand", fs: newFs };
    const p = resolvePath(fileArg, newFs.cwd);
    const content = newFs.files[p];
    if (!content) return { output: `sha256sum: ${fileArg}: No such file or directory`, fs: newFs };
    const fake = Array.from(content).reduce((a, c) => (a * 37 + c.charCodeAt(0)) & 0xffffffff, 0).toString(16).padStart(8, "0");
    return { output: `${fake}${fake}${fake}${fake}${fake}${fake}${fake}${fake}  ${fileArg}`, fs: newFs };
  }

  if (cmd === "strings") {
    const fileArg = args.find(a => !a.startsWith("-"));
    if (!fileArg) return { output: "strings: missing operand", fs: newFs };
    const p = resolvePath(fileArg, newFs.cwd);
    const content = newFs.files[p];
    if (!content) return { output: `strings: ${fileArg}: No such file or directory`, fs: newFs };
    return { output: content.split("\n").filter(l => l.length >= 4).join("\n"), fs: newFs };
  }

  if (cmd === "xxd" || cmd === "hexdump") {
    const fileArg = args.find(a => !a.startsWith("-"));
    if (!fileArg) return { output: `${cmd}: missing operand`, fs: newFs };
    const p = resolvePath(fileArg, newFs.cwd);
    const content = newFs.files[p];
    if (!content) return { output: `${cmd}: ${fileArg}: No such file or directory`, fs: newFs };
    const sample = content.slice(0, 64);
    const hex = Array.from(sample).map(c => c.charCodeAt(0).toString(16).padStart(2, "0")).join(" ");
    return { output: `00000000: ${hex.slice(0, 47)}  ${sample.replace(/[^\x20-\x7e]/g, ".")}`, fs: newFs };
  }

  // ── System Info ───────────────────────────────────────────────────────────

  if (cmd === "whoami") return { output: "root", fs: newFs };

  if (cmd === "id") return { output: "uid=0(root) gid=0(root) groups=0(root)", fs: newFs };

  if (cmd === "hostname") return { output: "kali", fs: newFs };

  if (cmd === "uname") {
    if (args.includes("-a") || args.includes("--all")) return { output: "Linux kali 6.1.0-kali9-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.27-1kali1 x86_64 GNU/Linux", fs: newFs };
    if (args.includes("-r")) return { output: "6.1.0-kali9-amd64", fs: newFs };
    if (args.includes("-s")) return { output: "Linux", fs: newFs };
    if (args.includes("-n")) return { output: "kali", fs: newFs };
    if (args.includes("-m")) return { output: "x86_64", fs: newFs };
    return { output: "Linux", fs: newFs };
  }

  if (cmd === "uptime") {
    const h = Math.floor(Math.random() * 10) + 1;
    return { output: ` ${new Date().toTimeString().slice(0, 8)} up  ${h}:${String(Math.floor(Math.random()*60)).padStart(2,"0")},  1 user,  load average: 0.${Math.floor(Math.random()*99)}, 0.${Math.floor(Math.random()*99)}, 0.${Math.floor(Math.random()*99)}`, fs: newFs };
  }

  if (cmd === "date") return { output: new Date().toString(), fs: newFs };

  if (cmd === "df") {
    const human = args.includes("-h");
    const size = human ? "19G" : "19922944";
    const used = human ? "8.2G" : "8589934";
    const avail = human ? "11G" : "11534336";
    return { output: `Filesystem      Size  Used Avail Use% Mounted on\nudev            ${human?"1.9G":"1966080"}     0  ${human?"1.9G":"1966080"}   0% /dev\ntmpfs           ${human?"395M":"404480"}  ${human?"8.4M":"8601"}  ${human?"387M":"395879"}   3% /run\n/dev/sda1       ${size}  ${used}  ${avail}  43% /\n`, fs: newFs };
  }

  if (cmd === "free") {
    const human = args.includes("-h");
    return {
      output: human
        ? `              total        used        free      shared  buff/cache   available\nMem:           7.7Gi       2.1Gi       3.9Gi        89Mi       1.7Gi       5.3Gi\nSwap:          2.0Gi          0B       2.0Gi`
        : `              total        used        free      shared  buff/cache   available\nMem:        8058844     2202840     4055096       91032     1800908     5567836\nSwap:       2097148           0     2097148`,
      fs: newFs
    };
  }

  if (cmd === "top") {
    return {
      output: `top - ${new Date().toTimeString().slice(0,8)} up 3:42,  1 user,  load average: 0.52, 0.48, 0.41
Tasks: 187 total,   1 running, 186 sleeping,   0 stopped,   0 zombie
%Cpu(s):  5.2 us,  1.8 sy,  0.0 ni, 91.5 id,  1.2 wa,  0.0 hi,  0.3 si
MiB Mem :   7870.9 total,   3945.2 free,   2150.4 used,   1775.3 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   5429.3 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
    1 root      20   0   22560   1032    960 S   0.0   0.0   0:01.23 systemd
  423 root      20   0   15832   2048   1800 S   0.0   0.0   0:00.45 sshd
 1024 root      20   0   30244   5120   4096 S   0.3   0.1   0:02.11 bash
 1337 root      20   0   17652   1024    900 R   5.0   0.0   0:00.02 top`,
      fs: newFs
    };
  }

  if (cmd === "ps") {
    const full = args.join("").includes("aux") || args.join("").includes("ef");
    if (full || args.join("").includes("aux")) {
      return { output: `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot         1  0.0  0.1  22560  1032 ?        Ss   00:00   0:01 /sbin/init\nroot       423  0.0  0.2  15832  2048 ?        Ss   00:00   0:00 /usr/sbin/sshd\nroot       512  0.0  0.1   8920   880 tty1     Ss+  00:00   0:00 /sbin/agetty\nroot      1024  0.1  0.5  30244  5120 pts/0    Ss   00:00   0:00 bash\nroot      1337  0.0  0.1  17652  1024 pts/0    R+   00:00   0:00 ps aux`, fs: newFs };
    }
    if (args.join("").includes("ef")) {
      return { output: `UID        PID  PPID  C STIME TTY          TIME CMD\nroot         1     0  0 00:00 ?        00:00:01 /sbin/init\nroot       423     1  0 00:00 ?        00:00:00 /usr/sbin/sshd\nroot      1024   423  0 00:00 pts/0    00:00:00 bash`, fs: newFs };
    }
    return { output: `  PID TTY          TIME CMD\n 1024 pts/0    00:00:00 bash\n 1337 pts/0    00:00:00 ps`, fs: newFs };
  }

  if (cmd === "kill") {
    const pid = args.find(a => !a.startsWith("-"));
    if (!pid) return { output: "kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec", fs: newFs };
    if (pid === "1") return { output: "bash: kill: (1) - Operation not permitted", fs: newFs };
    return { output: "", fs: newFs };
  }

  if (cmd === "killall") {
    if (!args[0]) return { output: "killall: no process name specified", fs: newFs };
    return { output: "", fs: newFs };
  }

  if (cmd === "who" || cmd === "w") {
    return { output: `root     pts/0        ${new Date().toDateString()} ${new Date().toTimeString().slice(0,5)} (192.168.1.50)`, fs: newFs };
  }

  if (cmd === "last") {
    return { output: `root     pts/0        192.168.1.50     Thu Jun 25 00:05   still logged in\nroot     tty1                          Wed Jun 24 22:10 - 23:45  (01:35)\n\nwtmp begins Mon Jun 01 00:00:00 2026`, fs: newFs };
  }

  // ── Environment ───────────────────────────────────────────────────────────

  if (cmd === "env" || cmd === "printenv") {
    if (args[0]) return { output: newFs.env[args[0]] || "", fs: newFs };
    return { output: Object.entries(newFs.env).map(([k, v]) => `${k}=${v}`).join("\n"), fs: newFs };
  }

  if (cmd === "export") {
    if (!args[0]) return { output: "", fs: newFs };
    const [k, v] = args[0].split("=");
    if (!k) return { output: "", fs: newFs };
    return { output: "", fs: { ...newFs, env: { ...newFs.env, [k]: v || "" } } };
  }

  if (cmd === "alias") {
    if (!args[0]) {
      return { output: Object.entries(newFs.aliases).map(([k, v]) => `alias ${k}='${v}'`).join("\n"), fs: newFs };
    }
    const [name2, val] = args[0].split("=");
    if (!val) return { output: `alias ${name2}='${newFs.aliases[name2] || ""}'`, fs: newFs };
    return { output: "", fs: { ...newFs, aliases: { ...newFs.aliases, [name2]: val.replace(/^['"]|['"]$/g, "") } } };
  }

  if (cmd === "which") {
    if (!args[0]) return { output: "which: missing argument", fs: newFs };
    const builtins = ["ls","cd","cat","echo","grep","find","nmap","hydra","john","hashcat","sqlmap","nikto","gobuster","nc","netcat","ssh","wget","curl","python3","python","php","bash","sh","openssl","aircrack-ng","msfconsole","metasploit","awk","sed","sort","uniq","cut","wc","head","tail","file","strings","base64","md5sum","sha256sum","xxd","hexdump","ping","ifconfig","ip","netstat","ps","kill","top","df","free","chmod","chown","find","locate","whereis"];
    if (builtins.includes(args[0])) return { output: `/usr/bin/${args[0]}`, fs: newFs };
    return { output: `${args[0]}: not found`, fs: newFs };
  }

  if (cmd === "whereis" || cmd === "locate") {
    if (!args[0]) return { output: `${cmd}: missing argument`, fs: newFs };
    return { output: `${args[0]}: /usr/bin/${args[0]} /usr/share/man/man1/${args[0]}.1.gz`, fs: newFs };
  }

  // ── Network ───────────────────────────────────────────────────────────────

  if (cmd === "ifconfig") {
    return { output: `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::a00:27ff:fe4e:66a1  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:4e:66:a1  txqueuelen 1000  (Ethernet)
        RX packets 12453  bytes 9834521 (9.3 MiB)
        TX packets 8234  bytes 1234567 (1.1 MiB)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)`, fs: newFs };
  }

  if (cmd === "ip") {
    const sub = args[0];
    if (sub === "addr" || sub === "a" || sub === "address") {
      return { output: `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
    inet6 ::1/128 scope host
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP
    link/ether 08:00:27:4e:66:a1 brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0
    inet6 fe80::a00:27ff:fe4e:66a1/64 scope link`, fs: newFs };
    }
    if (sub === "route" || sub === "r") {
      return { output: `default via 192.168.1.1 dev eth0\n192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100`, fs: newFs };
    }
    return { output: `1: lo: <LOOPBACK,UP,LOWER_UP>\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> inet 192.168.1.100/24`, fs: newFs };
  }

  if (cmd === "netstat") {
    const allFlag = args.includes("-a") || args.includes("-tulpn") || args.includes("-an");
    return { output: `Active Internet connections (${allFlag ? "servers and established" : "only servers"})
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      423/sshd
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      812/apache2
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      812/apache2
tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN      634/mysqld
tcp        0    348 192.168.1.100:22        192.168.1.50:54321      ESTABLISHED 1024/sshd`, fs: newFs };
  }

  if (cmd === "ping") {
    const host = args.find(a => !a.startsWith("-")) || "localhost";
    const c = parseInt(args[args.indexOf("-c") + 1] || "4");
    const count = isNaN(c) ? 4 : Math.min(c, 10);
    const ip = host === "localhost" ? "127.0.0.1" : host.match(/^\d/) ? host : "192.168.1.1";
    const packets = Array.from({ length: count }, (_, i) =>
      `64 bytes from ${ip}: icmp_seq=${i+1} ttl=64 time=${(Math.random() * 5 + 0.1).toFixed(3)} ms`
    ).join("\n");
    return { output: `PING ${host} (${ip}) 56(84) bytes of data.\n${packets}\n--- ${host} ping statistics ---\n${count} packets transmitted, ${count} received, 0% packet loss, time ${count*1000-100}ms`, fs: newFs };
  }

  if (cmd === "ssh") {
    const host = args.find(a => !a.startsWith("-") && !a.includes("@")) || args[args.length-1];
    return { output: `ssh: connect to host ${host} port 22: Connection timed out\n(Simulated terminal - network not available)`, fs: newFs };
  }

  if (cmd === "wget") {
    const url = args.find(a => a.startsWith("http") || a.startsWith("ftp"));
    if (!url) return { output: "wget: missing URL", fs: newFs };
    return { output: `--${new Date().toISOString()}--  ${url}\nResolving... simulated\nConnecting... simulated\nHTTP request sent, awaiting response... 200 OK\n[Simulated - no actual download in this terminal]`, fs: newFs };
  }

  if (cmd === "curl") {
    const url = args.find(a => a.startsWith("http") || a.startsWith("ftp") || (a.startsWith("/") && args.includes("-o")));
    if (!url) return { output: "curl: try 'curl --help' for more information", fs: newFs };
    return { output: `  % Total    % Received % Xferd  Average Speed   Time\n  0     0    0     0    0     0      0      0 --:--:-- --:--:-- --:--:-- 0\n[Simulated response from ${url}]`, fs: newFs };
  }

  if (cmd === "nc" || cmd === "netcat") {
    const host = args.find(a => !a.startsWith("-") && isNaN(Number(a)));
    const port = args.find(a => !a.startsWith("-") && !isNaN(Number(a)));
    if (args.includes("-l") || args.includes("-lv") || args.includes("-lvp")) {
      const p2 = args[args.indexOf("-p") + 1] || port || "4444";
      return { output: `Listening on 0.0.0.0 ${p2}\n[Simulated - press Ctrl+C to exit]`, fs: newFs };
    }
    if (!host) return { output: "usage: nc [-options] hostname port", fs: newFs };
    return { output: `(UNKNOWN) [${host}] ${port || "4444"} (?) : Connection refused\n[Simulated - no real network]`, fs: newFs };
  }

  // ── Security Tools ────────────────────────────────────────────────────────

  if (cmd === "nmap") {
    const host = args.find(a => !a.startsWith("-")) || "192.168.1.1";
    const isSV = args.includes("-sV");
    const isO = args.includes("-O");
    const isSC = args.includes("-sC") || args.includes("-A");
    return {
      output: `Starting Nmap 7.93 ( https://nmap.org ) at ${new Date().toDateString()}
Nmap scan report for ${host}
Host is up (0.0${Math.floor(Math.random() * 90 + 10)}s latency).
Not shown: 995 closed tcp ports (reset)
PORT     STATE  SERVICE    ${isSV ? "VERSION" : ""}
22/tcp   open   ssh        ${isSV ? "OpenSSH 8.9p1 Debian 3 (protocol 2.0)" : ""}
80/tcp   open   http       ${isSV ? "Apache httpd 2.4.54 ((Debian))" : ""}
443/tcp  open   https      ${isSV ? "Apache httpd 2.4.54" : ""}
3306/tcp open   mysql      ${isSV ? "MySQL 8.0.32" : ""}
8080/tcp open   http-proxy ${isSV ? "Squid http proxy 5.7" : ""}
${isO ? "\nOS detection:\nRunning: Linux 5.X|6.X\nOS CPE: cpe:/o:linux:linux_kernel:5 cpe:/o:linux:linux_kernel:6\nOS details: Linux 5.0 - 6.2" : ""}
${isSC ? "\nScript scan results:\n|_http-title: Apache2 Default Page\n| http-methods: GET POST\n| ssh-hostkey: 3072 RSA, 256 ECDSA" : ""}
Nmap done: 1 IP address (1 host up) scanned in ${(Math.random() * 5 + 1).toFixed(2)} seconds`,
      fs: newFs
    };
  }

  if (cmd === "hydra") {
    const host = args.find((a, i) => !a.startsWith("-") && i > 0 && !["ssh","ftp","http","smb","mysql","rdp"].includes(a) && args[i-1] !== "-l" && args[i-1] !== "-L" && args[i-1] !== "-p" && args[i-1] !== "-P" && args[i-1] !== "-t");
    const service = args[args.length - 1];
    const user = args[args.indexOf("-l") + 1] || "admin";
    const wordlist = args[args.indexOf("-P") + 1] || "wordlist.txt";
    return {
      output: `Hydra v9.4 (c) 2022 by van Hauser/THC
[DATA] max 16 tasks per 1 server, overall 16 tasks, 10 login tries (l:1/p:10)
[DATA] attacking ${service || "ssh"}://${host || "192.168.1.100"}:22/
[ATTEMPT] target ${host || "192.168.1.100"} - login "${user}" - pass "password"
[ATTEMPT] target ${host || "192.168.1.100"} - login "${user}" - pass "123456"
[ATTEMPT] target ${host || "192.168.1.100"} - login "${user}" - pass "admin"
[22][ssh] host: ${host || "192.168.1.100"}   login: ${user}   password: toor
1 of 1 target successfully completed, 1 valid password found`,
      fs: newFs
    };
  }

  if (cmd === "john") {
    const file = args.find(a => !a.startsWith("--"));
    const wordlist2 = args.find(a => a.startsWith("--wordlist"))?.split("=")[1] || "rockyou.txt";
    return {
      output: `John the Ripper 1.9.0-jumbo-1 (Linux)
Using default input encoding: UTF-8
Loaded 2 password hashes with 2 different salts (sha512crypt [SHA512 128/128 AVX 2x])
Cost 1 (iteration count) is 656000 for all loaded hashes
Will run 4 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any other key for status
toor             (root)
password123      (user)
2g 0:00:02:34 DONE (${new Date().toDateString()}) 0.01296g/s 23.25p/s 23.25c/s
Session completed.`,
      fs: newFs
    };
  }

  if (cmd === "hashcat") {
    const mode = args[args.indexOf("-m") + 1] || "0";
    const attack = args[args.indexOf("-a") + 1] || "0";
    return {
      output: `hashcat (v6.2.6) starting...
OpenCL API (OpenCL 3.0 PoCL 3.1) - Platform #1 [The pocl project]
Hashes: 1 digests; 1 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries
Applicable optimizers: Zero-Byte, Early-Skip, Not-Salted, Not-Iterated, Single-Hash
Watchdog: Temperature abort trigger set to 90c
Dictionary cache hit:
* Filename..: /usr/share/wordlists/rockyou.txt
* Passwords.: 14344391

[s]tatus [p]ause [b]ypass [c]heckpoint [f]inish [q]uit =>

$6$kali$hash...:password123

Session..........: hashcat
Status...........: Cracked
Hash.Mode........: ${mode} (MD5)
Recovered........: 1/1 (100.00%) Digests
Progress.........: 17408/14344391 (0.12%)
Time.Started.....: ${new Date().toTimeString().slice(0,8)}`,
      fs: newFs
    };
  }

  if (cmd === "sqlmap") {
    const url = args[args.indexOf("-u") + 1] || "http://target/page.php?id=1";
    return {
      output: `        ___
       __H__
 ___ ___[,]_____ ___ ___  {1.7.8#stable}
|_ -| . [.]     | .'| . |
|___|_  [']_|_|_|__,|  _|
      |_|V...       |_|   https://sqlmap.org

[*] starting @ ${new Date().toTimeString().slice(0,8)}
[INFO] testing connection to the target URL
[INFO] testing if the target URL content is stable
[INFO] target URL content is stable
[INFO] testing if GET parameter 'id' is dynamic
[INFO] GET parameter 'id' appears to be dynamic
[INFO] heuristic (basic) test shows that GET parameter 'id' might be injectable
[INFO] testing for SQL injection on GET parameter 'id'
[INFO] GET parameter 'id' is 'AND boolean-based blind - WHERE or HAVING clause' injectable
[INFO] target URL appears to be UNION injectable with 3 columns
[PAYLOAD] 1 UNION SELECT NULL,NULL,NULL--
[INFO] GET parameter 'id' is vulnerable. Do you want to keep testing the others (if any)? [y/N]
sqlmap identified the following injection point(s):
---
Parameter: id (GET)
    Type: UNION query
    Payload: id=1 UNION ALL SELECT NULL,CONCAT(username,0x3a,password),NULL FROM users--
---
[INFO] fetching tables: users, products, orders
[INFO] Database: webapp  Tables: users (3 entries)
+----+----------+------------------+
| id | username | password         |
+----+----------+------------------+
|  1 | admin    | 5f4dcc3b5aa765d61d8327deb882cf99 |
|  2 | user     | ee11cbb19052e40b07aac0ca060c23ee |
+----+----------+------------------+`,
      fs: newFs
    };
  }

  if (cmd === "nikto") {
    const host2 = args[args.indexOf("-h") + 1] || args.find(a => !a.startsWith("-")) || "192.168.1.100";
    return {
      output: `- Nikto v2.1.6
---------------------------------------------------------------------------
+ Target IP:          ${host2.match(/^\d/) ? host2 : "192.168.1.100"}
+ Target Hostname:    ${host2}
+ Target Port:        80
+ Start Time:         ${new Date().toString()}
---------------------------------------------------------------------------
+ Server: Apache/2.4.54 (Debian)
+ /: The anti-clickjacking X-Frame-Options header is not present.
+ /: The X-XSS-Protection header is not defined.
+ /: The X-Content-Type-Options header is not set.
+ /login.php: Cookie PHPSESSID created without the httponly flag
+ OSVDB-3233: /phpinfo.php: PHP is installed, and a test script was found.
+ /admin/: Directory indexing found.
+ OSVDB-3092: /admin/: This might be interesting.
+ /robots.txt: contains 4 entries which should be manually viewed.
+ /backup/: Directory indexing found (backup files exposed!)
+ /config.php.bak: A phpinfo() file was found.
+ 7915 requests: 0 error(s) and 9 item(s) reported on remote host
+ End Time: ${new Date().toString()}`,
      fs: newFs
    };
  }

  if (cmd === "gobuster") {
    const url2 = args[args.indexOf("-u") + 1] || "http://192.168.1.100";
    const wordlistG = args[args.indexOf("-w") + 1] || "/usr/share/wordlists/dirb/common.txt";
    return {
      output: `===============================================================
Gobuster v3.6
by OJ Reeves (@TheColonial) & Christian Medhurst (@_cheburek_)
===============================================================
[+] Url:                     ${url2}
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                ${wordlistG}
[+] Status codes:            200,204,301,302,307,401,403,405,410
===============================================================
Starting gobuster in directory enumeration mode
===============================================================
/admin                (Status: 301) [Size: 312] [--> ${url2}/admin/]
/backup               (Status: 301) [Size: 313] [--> ${url2}/backup/]
/config               (Status: 403) [Size: 277]
/images               (Status: 301) [Size: 313] [--> ${url2}/images/]
/index.php            (Status: 200) [Size: 4532]
/login.php            (Status: 200) [Size: 1024]
/robots.txt           (Status: 200) [Size: 128]
/uploads              (Status: 301) [Size: 314] [--> ${url2}/uploads/]
/wp-admin             (Status: 301) [Size: 315] [--> ${url2}/wp-admin/]
Progress: 4614 / 4615 (99.98%)
===============================================================
Finished`,
      fs: newFs
    };
  }

  if (cmd === "dirb") {
    const url3 = args[0] || "http://192.168.1.100";
    return {
      output: `-----------------
DIRB v2.22
By The Dark Raver
-----------------
URL_BASE: ${url3}/
WORDLIST_FILES: /usr/share/dirb/wordlists/common.txt

GENERATED WORDS: 4612

---- Scanning URL: ${url3}/ ----
+ ${url3}/admin (CODE:301|SIZE:312)
+ ${url3}/index.php (CODE:200|SIZE:4532)
+ ${url3}/login (CODE:200|SIZE:1024)
+ ${url3}/robots.txt (CODE:200|SIZE:128)
-----------------
END_TIME: ${new Date().toString()}
DOWNLOADED: 4612 - FOUND: 4`,
      fs: newFs
    };
  }

  if (cmd === "msfconsole" || cmd === "metasploit") {
    return {
      output: `
       =[ metasploit v6.3.4-dev                          ]
+ -- --=[ 2294 exploits - 1201 auxiliary - 409 post       ]
+ -- --=[ 951 payloads - 45 encoders - 11 nops            ]
+ -- --=[ 9 evasion                                        ]

Metasploit tip: Use the resource command to run several commands at once
msf6 > `,
      fs: newFs
    };
  }

  if (cmd === "aircrack-ng") {
    const capFile = args.find(a => a.endsWith(".cap") || a.endsWith(".pcap")) || "capture.cap";
    const wlist = args[args.indexOf("-w") + 1] || "rockyou.txt";
    return {
      output: `                               Aircrack-ng 1.7

      [00:00:01] 1024/14344391 keys tested (1024.00 k/s)

      Time left: 3 hours, 54 minutes, 32 seconds            0.01%

                         KEY FOUND! [ password123 ]

      Master Key     : CD D7 9A 5A CF B0 70 C7  E9 D1 02 3B 87 02 85 D6
      Transient Key  : 00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00`,
      fs: newFs
    };
  }

  if (cmd === "openssl") {
    const sub2 = args[0];
    if (sub2 === "s_client") {
      const conn = args[args.indexOf("-connect") + 1] || "target:443";
      return { output: `CONNECTED(00000003)\ndepth=2 C=US, O=DigiCert Inc, CN=DigiCert Global Root CA\ndepth=1 C=US, O=DigiCert Inc, CN=DigiCert TLS RSA SHA256 2020 CA1\ndepth=0 CN=${conn.split(":")[0]}\n---\nSSL handshake has read 3652 bytes and written 751 bytes\n---\nProtocol  : TLSv1.3\nCipher    : TLS_AES_128_GCM_SHA256\nSession-ID: ABCD1234...`, fs: newFs };
    }
    if (sub2 === "passwd" || sub2 === "enc") {
      return { output: `$6$rounds=656000$randomsalt$hashedoutputhere...`, fs: newFs };
    }
    if (sub2 === "rand") {
      return { output: Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join(""), fs: newFs };
    }
    return { output: `openssl: Use 'openssl help' to see available commands\nStandard commands: s_client enc rand passwd genrsa req x509`, fs: newFs };
  }

  // ── Filesystem misc ───────────────────────────────────────────────────────

  if (cmd === "find") {
    const startPath = args.find(a => !a.startsWith("-") && ![".", "/", "type", "name", "perm", "user"].includes(a)) || newFs.cwd;
    const namePattern = args[args.indexOf("-name") + 1];
    const permPattern = args[args.indexOf("-perm") + 1];
    const typeFilter = args[args.indexOf("-type") + 1];

    // collect all files and dirs
    const allPaths = [
      ...Object.keys(newFs.dirs),
      ...Object.keys(newFs.files)
    ].filter(p => p.startsWith(startPath) || startPath === "." || startPath === "/");

    let results = allPaths;
    if (typeFilter === "f") results = results.filter(p => !newFs.dirs[p]);
    if (typeFilter === "d") results = results.filter(p => !!newFs.dirs[p]);
    if (namePattern) {
      const rx = new RegExp("^" + namePattern.replace(/\*/g, ".*").replace(/\?/g, ".") + "$");
      results = results.filter(p => rx.test(p.split("/").pop()));
    }
    if (permPattern === "-4000" || permPattern === "/4000") {
      results = ["/usr/bin/sudo", "/usr/bin/passwd", "/usr/bin/su", "/bin/mount", "/bin/umount"];
    }

    return { output: results.slice(0, 30).join("\n") || "no matches", fs: newFs };
  }

  if (cmd === "chmod") {
    if (!args[0] || !args[1]) return { output: "chmod: missing operand", fs: newFs };
    return { output: "", fs: newFs };
  }

  if (cmd === "chown") {
    if (!args[0] || !args[1]) return { output: "chown: missing operand", fs: newFs };
    return { output: "", fs: newFs };
  }

  // ── Archives ──────────────────────────────────────────────────────────────

  if (cmd === "tar") {
    const isExtract = args.includes("-x") || args.join("").includes("x");
    const isCreate = args.includes("-c") || args.join("").includes("c");
    const isList = args.includes("-t") || args.join("").includes("tv");
    const file2 = args.find(a => a.endsWith(".tar") || a.endsWith(".gz") || a.endsWith(".tar.gz") || a.endsWith(".tgz"));
    if (isList) return { output: `${file2 || "archive.tar"}:\nfile1.txt\nfile2.txt\ndir/\ndir/file3.txt`, fs: newFs };
    if (isExtract) return { output: `Extracting ${file2 || "archive.tar"}...\nx file1.txt\nx file2.txt`, fs: newFs };
    if (isCreate) return { output: "", fs: newFs };
    return { output: "tar: You must specify one of the '-Acdtrux' or '--test-label' options", fs: newFs };
  }

  if (cmd === "zip") {
    const out = args[0];
    const files2 = args.slice(1);
    return { output: files2.map(f => `  adding: ${f} (deflated 45%)`).join("\n"), fs: newFs };
  }

  if (cmd === "unzip") {
    const file3 = args[0];
    if (!file3) return { output: "unzip: missing file operand", fs: newFs };
    if (args.includes("-l")) return { output: `Archive: ${file3}\n  Length      Date    Time    Name\n---------  ---------- -----   ----\n     1024  2026-06-25 00:00   file.txt\n     2048  2026-06-25 00:00   dir/\n---------                     -------\n     3072                     2 files`, fs: newFs };
    return { output: `Archive:  ${file3}\n  inflating: file.txt\n  inflating: dir/file2.txt`, fs: newFs };
  }

  // ── Package Manager ───────────────────────────────────────────────────────

  if (cmd === "apt" || cmd === "apt-get") {
    const sub3 = args[0];
    if (sub3 === "update") return { output: `Hit:1 http://http.kali.org/kali kali-rolling InRelease\nHit:2 http://security.debian.org/debian-security bookworm-security InRelease\nReading package lists... Done\nBuilding dependency tree... Done`, fs: newFs };
    if (sub3 === "install") {
      const pkg = args[1] || "package";
      return { output: `Reading package lists... Done\nBuilding dependency tree... Done\nThe following NEW packages will be installed:\n  ${pkg}\n0 upgraded, 1 newly installed, 0 to remove\nNeed to get 1,024 kB of archives.\nGet:1 http://http.kali.org/kali ${pkg} 1.0.0 [1,024 kB]\nFetched 1,024 kB in 0s\nSelecting previously unselected package ${pkg}\nSetting up ${pkg} (1.0.0) ...\n[Simulated - no real packages installed]`, fs: newFs };
    }
    if (sub3 === "upgrade") return { output: `Reading package lists... Done\nBuilding dependency tree... Done\n0 upgraded, 0 newly installed, 0 to remove.\n[System is up to date]`, fs: newFs };
    if (sub3 === "remove" || sub3 === "purge") return { output: `Removing ${args[1] || "package"}...\nDone.`, fs: newFs };
    if (sub3 === "search") return { output: `Sorting... Done\nFull-Text Search... Done\n${args[1] || "package"}/kali-rolling 1.0.0 amd64\n  ${args[1] || "package"} - Simulated package`, fs: newFs };
    return { output: `apt ${sub3}: command not found\nUsage: apt [update|install|remove|upgrade|search]`, fs: newFs };
  }

  // ── Scripting / Languages ─────────────────────────────────────────────────

  if (cmd === "python3" || cmd === "python") {
    const script = args[0];
    if (!script) return { output: `Python 3.11.2 (main, Mar 13 2023, 12:18:29)\n[GCC 12.2.0] on linux\nType "help", "copyright", "credits" or "license" for more information.\n>>> [Interactive mode not available in this terminal - run python3 script.py]`, fs: newFs };
    const p3 = resolvePath(script, newFs.cwd);
    const content = newFs.files[p3];
    if (!content) return { output: `python3: can't open file '${script}': [Errno 2] No such file or directory`, fs: newFs };
    // simulate print() calls
    const printMatches = [...content.matchAll(/print\(['"](.+?)['"]\)/g)];
    if (printMatches.length > 0) return { output: printMatches.map(m => m[1]).join("\n"), fs: newFs };
    return { output: `[Executed: ${script}]\n(Script ran successfully - output depends on implementation)`, fs: newFs };
  }

  if (cmd === "php") {
    const script2 = args[0];
    if (!script2) return { output: `PHP 8.2.7 (cli)\n[Interactive mode not available]`, fs: newFs };
    return { output: `[PHP] Executed ${script2}`, fs: newFs };
  }

  if (cmd === "bash" || cmd === "sh") {
    const script3 = args[0];
    if (!script3) return { output: `[${cmd}] Interactive shell not available - use commands directly`, fs: newFs };
    const p4 = resolvePath(script3, newFs.cwd);
    const content = newFs.files[p4];
    if (!content) return { output: `${cmd}: ${script3}: No such file or directory`, fs: newFs };
    // Run each non-comment line
    const lines5 = content.split("\n").filter(l => l.trim() && !l.trim().startsWith("#") && !l.trim().startsWith("#!/"));
    let currentFs2 = newFs;
    const outputs2 = [];
    for (const line of lines5.slice(0, 10)) {
      const r = processCommand(line, currentFs2);
      currentFs2 = r.fs;
      if (r.output && r.output !== "__CLEAR__") outputs2.push(r.output);
    }
    return { output: outputs2.join("\n"), fs: currentFs2 };
  }

  // ── User Management ───────────────────────────────────────────────────────

  if (cmd === "passwd") {
    return { output: `New password: \nRetype new password: \npasswd: password updated successfully\n[Simulated - no real password change]`, fs: newFs };
  }

  if (cmd === "adduser" || cmd === "useradd") {
    const user2 = args.find(a => !a.startsWith("-"));
    if (!user2) return { output: `${cmd}: no username specified`, fs: newFs };
    return { output: `Adding user '${user2}' ...\nAdding new group '${user2}' (1001) ...\nAdding new user '${user2}' (1001) with group '${user2}' ...\n[Simulated]`, fs: newFs };
  }

  if (cmd === "groups") return { output: "root", fs: newFs };

  if (cmd === "sudo") {
    if (!args[0]) return { output: "usage: sudo command", fs: newFs };
    return processCommand(args.join(" "), newFs);
  }

  // ── Misc ──────────────────────────────────────────────────────────────────

  if (cmd === "history") {
    if (newFs.history.length === 0) return { output: "", fs: newFs };
    return { output: newFs.history.map((c, i) => `  ${String(i + 1).padStart(4)}  ${c}`).join("\n"), fs: newFs };
  }

  if (cmd === "man") {
    if (!args[0]) return { output: "What manual page do you want?", fs: newFs };
    const manPages = {
      nmap: "NMAP(1) - Network exploration tool and security / port scanner\nSYNOPSIS: nmap [Scan Type] [Options] {target}\n-sV: Version detection  -O: OS detection  -A: Aggressive scan  -p: Port spec",
      hydra: "HYDRA(1) - A very fast network logon cracker\nSYNOPSIS: hydra [-l user|-L users.txt] [-p pass|-P pass.txt] target service",
      sqlmap: "SQLMAP(1) - Automatic SQL injection and database takeover tool\nSYNOPSIS: sqlmap -u URL [options]\n-u: Target URL  --dbs: Enumerate databases  --tables: Enumerate tables",
      find: "FIND(1) - Search for files in a directory hierarchy\nSYNOPSIS: find [path] [expression]\n-name: File name  -type f/d: File/Dir  -perm: Permissions",
      grep: "GREP(1) - Print lines that match patterns\nSYNOPSIS: grep [OPTIONS] PATTERN [FILE]\n-i: Case insensitive  -v: Invert match  -n: Line numbers  -r: Recursive",
    };
    return { output: manPages[args[0]] || `No manual entry for ${args[0]}\n(Try: man -k ${args[0]})`, fs: newFs };
  }

  if (cmd === "clear") return { output: "__CLEAR__", fs: newFs };

  if (cmd === "source" || cmd === ".") {
    const script4 = args[0];
    if (!script4) return { output: "bash: source: filename argument required", fs: newFs };
    const p5 = resolvePath(script4, newFs.cwd);
    const content = newFs.files[p5];
    if (!content) return { output: `bash: ${script4}: No such file or directory`, fs: newFs };
    const lines6 = content.split("\n").filter(l => l.trim() && !l.startsWith("#"));
    let currentFs3 = newFs;
    for (const l of lines6) {
      const r = processCommand(l, currentFs3);
      currentFs3 = r.fs;
    }
    return { output: "", fs: currentFs3 };
  }

  // ── Fallback ──────────────────────────────────────────────────────────────
  return { output: `bash: ${cmd}: command not found`, fs: newFs };
}

// ─── React Component ──────────────────────────────────────────────────────────
export default function KaliTerminal() {
  const [lines, setLines] = useState([{ type: "banner", text: "" }]);
  const [input, setInput] = useState("");
  const [fs, setFs] = useState(initFS);
  const [histIdx, setHistIdx] = useState(-1);
  const [fullscreen, setFullscreen] = useState(false);
  const inputRef = useRef(null);

  const terminalBodyRef = useRef(null);
  useEffect(() => {
    if (terminalBodyRef.current) {
      terminalBodyRef.current.scrollTop = terminalBodyRef.current.scrollHeight;
    }
  }, [lines]);
  useEffect(() => { inputRef.current?.focus(); }, []);
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape" && fullscreen) setFullscreen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [fullscreen]);

  const prompt = `root@kali:${fs.cwd.replace("/root", "~")}# `;

  function handleKey(e) {
    if (e.key === "Enter") {
      const result = processCommand(input, fs);
      if (result.output === "__CLEAR__") {
        setLines([]); setFs(result.fs); setInput(""); setHistIdx(-1);
        return;
      }
      setLines(prev => [
        ...prev,
        { type: "input", text: prompt + input },
        ...(result.output ? [{ type: "output", text: result.output }] : []),
      ]);
      setFs(result.fs); setInput(""); setHistIdx(-1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const h = fs.history;
      const idx = histIdx + 1;
      if (idx < h.length) { setHistIdx(idx); setInput(h[h.length - 1 - idx]); }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = histIdx - 1;
      if (idx < 0) { setHistIdx(-1); setInput(""); }
      else { setHistIdx(idx); setInput(fs.history[fs.history.length - 1 - idx]); }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const parts2 = input.split(" ");
      const last2 = parts2[parts2.length - 1];
      const items2 = fs.dirs[fs.cwd] || [];
      const match = items2.find(i => i.startsWith(last2));
      if (match) { parts2[parts2.length - 1] = match; setInput(parts2.join(" ")); }
    } else if (e.key === "c" && e.ctrlKey) {
      setLines(prev => [...prev, { type: "input", text: prompt + input + "^C" }]);
      setInput("");
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault(); setLines([]);
    }
  }

  return (
    <div
      style={{
        position: fullscreen ? "fixed" : "relative",
        inset: fullscreen ? 0 : "auto",
        zIndex: fullscreen ? 9999 : 1,
        minHeight: fullscreen ? "100vh" : "auto",
        background: "#0a0a0f",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Courier New', Courier, monospace",
        padding: fullscreen ? 0 : "20px"
      }}
      onClick={() => inputRef.current?.focus()}
    >
      <div style={{
        width: "100%",
        maxWidth: fullscreen ? "100%" : 900,
        height: fullscreen ? "100vh" : "auto",
        display: "flex", flexDirection: "column",
        background: "#0d1117",
        borderRadius: fullscreen ? 0 : 8,
        boxShadow: "0 0 40px rgba(0,255,100,0.15), 0 20px 60px rgba(0,0,0,0.8)",
        border: fullscreen ? "none" : "1px solid #1e3a2f",
        overflow: "hidden"
      }}>
        {/* Title Bar */}
        <div style={{ background: "linear-gradient(90deg, #1a1a2e 0%, #16213e 100%)", padding: "10px 16px", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid #0f3320", flexShrink: 0 }}>
          <div style={{ width: 13, height: 13, borderRadius: "50%", background: "#ff5f57", border: "1px solid #e0443e" }} />
          <div style={{ width: 13, height: 13, borderRadius: "50%", background: "#febc2e", border: "1px solid #d4a012" }} />
          <div style={{ width: 13, height: 13, borderRadius: "50%", background: "#28c840", border: "1px solid #1aab29" }} />
          <span style={{ flex: 1, textAlign: "center", color: "#7af5a0", fontSize: 13, letterSpacing: 1, fontWeight: "bold" }}>
            root@kali: {fs.cwd.replace("/root", "~")} — terminal
          </span>
          {/* Fullscreen toggle */}
          <button
            onClick={e => { e.stopPropagation(); setFullscreen(f => !f); setTimeout(() => inputRef.current?.focus(), 50); }}
            title={fullscreen ? "تصغير" : "ملء الشاشة"}
            style={{
              background: "none", border: "1px solid #2a4a3a", borderRadius: 5,
              color: "#7af5a0", cursor: "pointer", fontSize: 13,
              padding: "2px 8px", fontFamily: "monospace",
              transition: "all 0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(0,255,100,0.1)"}
            onMouseLeave={e => e.currentTarget.style.background = "none"}
          >
            {fullscreen ? "⊡ تصغير" : "⛶ ملء الشاشة"}
          </button>
        </div>

        {/* Terminal Body */}
        <div ref={terminalBodyRef} style={{ padding: "16px", flex: 1, minHeight: fullscreen ? 0 : 500, maxHeight: fullscreen ? "none" : "70vh", overflowY: "auto", cursor: "text", background: "#0d1117", direction: "ltr" }}>
          {/* Banner */}
          <div style={{ color: "#00e676", marginBottom: 12, fontSize: 13 }}>
            <pre style={{ margin: 0, color: "#00e676" }}>{`
  ██╗  ██╗ █████╗ ██╗     ██╗    ██╗     ██╗███╗   ██╗██╗   ██╗██╗  ██╗
  ██║ ██╔╝██╔══██╗██║     ██║    ██║     ██║████╗  ██║██║   ██║╚██╗██╔╝
  █████╔╝ ███████║██║     ██║    ██║     ██║██╔██╗ ██║██║   ██║ ╚███╔╝ 
  ██╔═██╗ ██╔══██║██║     ██║    ██║     ██║██║╚██╗██║██║   ██║ ██╔██╗ 
  ██║  ██╗██║  ██║███████╗██║    ███████╗██║██║ ╚████║╚██████╔╝██╔╝ ██╗
  ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝    ╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝`}</pre>
            <div style={{ color: "#4caf50", marginTop: 4 }}>
              ┌─[ <span style={{ color: "#00bcd4" }}>Kali Linux Terminal</span> · <span style={{ color: "#ff9800" }}>Cyber Academy</span> ]
            </div>
            <div style={{ color: "#4caf50" }}>
              └─[ Type <span style={{ color: "#fff176" }}>'help'</span> for all available commands ]
            </div>
            <div style={{ color: "#555", marginTop: 4 }}>Last login: {new Date().toDateString()} on pts/0</div>
          </div>

          {/* Lines */}
          {lines.filter(l => l.type !== "banner").map((line, i) => (
            <div key={i} style={{ marginBottom: 2 }}>
              {line.type === "input" ? (
                <div style={{ color: "#e0e0e0", fontSize: 14, lineHeight: 1.6 }}>
                  <span style={{ color: "#ff6b6b", fontWeight: "bold" }}>root</span>
                  <span style={{ color: "#fff" }}>@</span>
                  <span style={{ color: "#00bcd4", fontWeight: "bold" }}>kali</span>
                  <span style={{ color: "#fff" }}>:</span>
                  <span style={{ color: "#7986cb" }}>{line.text.split("# ")[0].split(":")[1]}</span>
                  <span style={{ color: "#fff" }}># </span>
                  <span style={{ color: "#fff" }}>{line.text.split("# ").slice(1).join("# ")}</span>
                </div>
              ) : (
                <pre style={{ margin: 0, color: "#b0bec5", fontSize: 13, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{line.text}</pre>
              )}
            </div>
          ))}

          {/* Input Line */}
          <div style={{ display: "flex", alignItems: "center", marginTop: 4, direction: "ltr" }}>
            <span style={{ color: "#00e676", fontWeight: "bold", fontSize: 14, whiteSpace: "nowrap", flexShrink: 0, marginRight: 8 }}>
              <span style={{ color: "#ff6b6b" }}>root</span>
              <span style={{ color: "#fff" }}>@</span>
              <span style={{ color: "#00bcd4" }}>kali</span>
              <span style={{ color: "#fff" }}>:</span>
              <span style={{ color: "#7986cb" }}>{fs.cwd.replace("/root", "~")}</span>
              <span style={{ color: "#fff" }}>#</span>
            </span>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 14, fontFamily: "'Courier New', Courier, monospace", caretColor: "#00e676", direction: "ltr", textAlign: "left" }}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              dir="ltr"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
