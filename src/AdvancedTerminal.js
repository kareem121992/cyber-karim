// AdvancedTerminal.js — محاكي Kali Linux كامل مع filesystem حقيقي و+100 أمر
// الـ filesystem بيتحدث فعلياً عند mkdir/touch/rm/cp/mv/echo > file

export class AdvancedTerminal {
  constructor() {
    // ---- Filesystem ----
    this.fs = this._makeFS();
    this.cwd = "/home/user";
    this.user = "kali";
    this.hostname = "kali";
    this.env = {
      HOME: "/home/user",
      USER: "kali",
      SHELL: "/bin/bash",
      PATH: "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin",
      TERM: "xterm-256color",
      LANG: "en_US.UTF-8",
    };
    this.aliases = {
      ll: "ls -la",
      la: "ls -a",
      l: "ls -CF",
    };
    this.history = [];
    this.historyIndex = -1;
    this.lastExit = 0;
  }

  // ==================== FILESYSTEM CORE ====================

  _makeFS() {
    // flat map: absolutePath → node { type, perms, owner, size, content, mtime }
    const now = this._fmtDate(new Date());
    const D = (owner = "root") => ({ type: "dir",  perms: "drwxr-xr-x", owner, size: 4096, mtime: now });
    const F = (content = "", owner = "root", perms = "-rw-r--r--") => ({
      type: "file", perms, owner,
      size: content.length, content, mtime: now,
    });
    return {
      "/": D(),
      "/bin": D(),
      "/etc": D(),
      "/etc/passwd":    F("root:x:0:0:root:/root:/bin/bash\nkali:x:1000:1000:Kali,,,:/home/user:/bin/bash\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin"),
      "/etc/hostname":  F("kali"),
      "/etc/hosts":     F("127.0.0.1   localhost\n127.0.1.1   kali\n::1         localhost ip6-localhost"),
      "/etc/os-release":F('PRETTY_NAME="Kali GNU/Linux Rolling"\nNAME="Kali GNU/Linux"\nID=kali\nVERSION_ID="2024.1"\nHOME_URL="https://www.kali.org/"'),
      "/etc/shells":    F("/bin/sh\n/bin/bash\n/bin/zsh\n/usr/bin/fish"),
      "/etc/shadow":    F("root:!:19000:0:99999:7:::\nkali:$6$xyz:19000:0:99999:7:::", "root", "-rw-r-----"),
      "/tmp": { ...D("root"), perms: "drwxrwxrwx" },
      "/var": D(),
      "/var/log": D(),
      "/var/log/syslog": F("Jun 25 00:01:01 kali systemd[1]: Started Daily apt download activities.\nJun 25 00:17:01 kali CRON[1234]: (root) CMD (cd / && run-parts --report /etc/cron.hourly)"),
      "/var/log/auth.log": F("Jun 25 02:14:09 kali sshd[1022]: Accepted publickey for kali from 10.0.0.5 port 52468 ssh2\nJun 25 02:14:09 kali sshd[1022]: pam_unix(sshd:session): session opened for user kali"),
      "/home": D(),
      "/home/user": { ...D("kali"), perms: "drwx------" },
      "/home/user/Desktop": D("kali"),
      "/home/user/Documents": D("kali"),
      "/home/user/Downloads": D("kali"),
      "/home/user/Pictures": D("kali"),
      "/home/user/.bashrc": F('# ~/.bashrc: executed by bash(1) for non-login shells.\nexport PS1="\\[\\033[01;32m\\]\\u@\\h\\[\\033[00m\\]:\\[\\033[01;34m\\]\\w\\[\\033[00m\\]\\$ "\nalias ll="ls -la"\nalias la="ls -a"\nalias l="ls -CF"\nexport HISTSIZE=1000\nexport HISTFILESIZE=2000', "kali", "-rw-r--r--"),
      "/home/user/.bash_history": F("ls\npwd\ncd Documents\nnmap -sV 192.168.1.1\nwhoami", "kali", "-rw-------"),
      "/home/user/.profile": F('if [ -n "$BASH_VERSION" ]; then\n  if [ -f "$HOME/.bashrc" ]; then\n    . "$HOME/.bashrc"\n  fi\nfi\nexport PATH="$HOME/bin:$PATH"', "kali", "-rw-r--r--"),
      "/home/user/notes.txt": F("# Pentest Notes\n\nTarget: 192.168.1.0/24\nDate: 2024-06-25\n\nOpen ports found:\n- 22 SSH\n- 80 HTTP\n- 443 HTTPS\n\nTODO: Run full nmap scan", "kali", "-rw-r--r--"),
      "/home/user/scan.sh": F('#!/bin/bash\necho "Starting network scan..."\nnmap -sV -sC "$1"\necho "Done!"', "kali", "-rwxr-xr-x"),
      "/home/user/Documents/report.txt": F("# Security Assessment Report\n\nExecutive Summary:\nVulnerabilities found: 3 Critical, 5 High\n\nRecommendations:\n1. Patch OpenSSL immediately\n2. Disable telnet service\n3. Update firewall rules", "kali", "-rw-r--r--"),
      "/home/user/Documents/targets.txt": F("192.168.1.1\n192.168.1.100\n192.168.1.254\n10.0.0.1", "kali", "-rw-r--r--"),
      "/home/user/Downloads/exploit.py": F('#!/usr/bin/env python3\n# PoC Exploit - Educational Use Only\nimport socket\n\ndef main():\n    target = "192.168.1.100"\n    port = 4444\n    print(f"Connecting to {target}:{port}")\n\nif __name__ == "__main__":\n    main()', "kali", "-rwxr-xr-x"),
      "/root": { ...D("root"), perms: "drwx------" },
      "/root/.bashrc": F("# root .bashrc", "root", "-rw-r--r--"),
      "/usr": D(),
      "/usr/bin": D(),
      "/usr/local": D(),
      "/usr/local/bin": D(),
      "/usr/share": D(),
      "/proc": D(),
      "/proc/version": F("Linux version 6.1.0-kali5-amd64 (devel@kali.org) (gcc-12 (Debian 12.2.0-14) 12.2.0, GNU ld (GNU Binutils for Debian) 2.40) #1 SMP PREEMPT_DYNAMIC Debian 6.1.12-1kali2 (2023-02-23)"),
      "/proc/cpuinfo": F("processor\t: 0\nvendor_id\t: GenuineIntel\ncpu family\t: 6\nmodel name\t: Intel(R) Core(TM) i7-8750H CPU @ 2.20GHz\nbogomips\t: 4400.00\ncpu cores\t: 6"),
      "/proc/meminfo": F("MemTotal:        8058944 kB\nMemFree:         2341232 kB\nMemAvailable:    4123456 kB\nBuffers:          312440 kB\nCached:          1823664 kB\nSwapTotal:       2097148 kB\nSwapFree:         978432 kB"),
      "/dev": D(),
      "/dev/null": { type: "file", perms: "crw-rw-rw-", owner: "root", size: 0, content: "", mtime: this?._fmtDate?.(new Date()) ?? "" },
      "/dev/zero": { type: "file", perms: "crw-rw-rw-", owner: "root", size: 0, content: "", mtime: this?._fmtDate?.(new Date()) ?? "" },
    };
  }

  _fmtDate(d) {
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const pad = n => String(n).padStart(2,"0");
    return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2," ")} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  // Resolve a path string into an absolute path
  _resolve(path) {
    if (!path || path === "~") return this.env.HOME;
    if (path.startsWith("~/")) return this.env.HOME + "/" + path.slice(2);
    if (!path.startsWith("/")) path = this.cwd + "/" + path;
    // normalize: collapse . and ..
    const parts = path.split("/").filter(Boolean);
    const out = [];
    for (const p of parts) {
      if (p === "..") out.pop();
      else if (p !== ".") out.push(p);
    }
    return "/" + out.join("/");
  }

  _node(p) { return this.fs[p] ?? null; }

  _listDir(dir) {
    const prefix = dir === "/" ? "/" : dir + "/";
    return Object.keys(this.fs)
      .filter(k => {
        if (!k.startsWith(prefix)) return false;
        const rest = k.slice(prefix.length);
        return rest.length > 0 && !rest.includes("/");
      })
      .map(k => ({ path: k, name: k.slice(prefix.length), ...this.fs[k] }));
  }

  _mkParents(p) {
    // ensure all parent dirs exist
    const parts = p.split("/").filter(Boolean);
    let cur = "";
    for (let i = 0; i < parts.length - 1; i++) {
      cur += "/" + parts[i];
      if (!this.fs[cur]) {
        this.fs[cur] = { type:"dir", perms:"drwxr-xr-x", owner:this.user, size:4096, mtime:this._fmtDate(new Date()) };
      }
    }
  }

  // ==================== PROMPT ====================

  getPrompt() {
    const display = this.cwd.replace(this.env.HOME, "~");
    return `${this.user}@${this.hostname}:${display}$ `;
  }

  // ==================== MAIN EXECUTE ====================

  execute(raw) {
    if (!raw || !raw.trim()) return "";
    this.history.push(raw.trim());
    this.historyIndex = -1;

    // Handle pipes: cmd1 | cmd2 (simple single-pipe)
    if (raw.includes(" | ")) {
      const [left, right] = raw.split(" | ");
      const leftOut = this.execute(left.trim());
      return this._executePiped(right.trim(), leftOut);
    }

    // Handle redirection: cmd > file  or  cmd >> file
    const redirAppend = raw.match(/^(.+?)\s*>>\s*(.+)$/);
    const redirOut   = raw.match(/^(.+?)\s*>\s*(.+)$/);
    if (redirAppend) {
      const out = this.execute(redirAppend[1].trim());
      const fp  = this._resolve(redirAppend[2].trim());
      const old = this.fs[fp]?.content ?? "";
      this.fs[fp] = { type:"file", perms:"-rw-r--r--", owner:this.user, size:0, content:old+out+"\n", mtime:this._fmtDate(new Date()) };
      this.fs[fp].size = this.fs[fp].content.length;
      return "";
    }
    if (redirOut) {
      const out = this.execute(redirOut[1].trim());
      const fp  = this._resolve(redirOut[2].trim());
      this.fs[fp] = { type:"file", perms:"-rw-r--r--", owner:this.user, size:out.length, content:out, mtime:this._fmtDate(new Date()) };
      return "";
    }

    // Expand aliases
    const tokens = raw.trim().split(/\s+/);
    const alias = this.aliases[tokens[0]];
    if (alias) {
      return this.execute(alias + (tokens.length > 1 ? " " + tokens.slice(1).join(" ") : ""));
    }

    const cmd  = tokens[0];
    const args = tokens.slice(1);
    return this._dispatch(cmd, args, raw.trim());
  }

  _executePiped(rightCmd, stdinData) {
    const tokens = rightCmd.split(/\s+/);
    const cmd = tokens[0];
    const args = tokens.slice(1);
    // Commands that accept stdin pipe
    switch(cmd) {
      case "grep": {
        const pattern = args[0] || "";
        const lines = stdinData.split("\n").filter(l => l.includes(pattern));
        return lines.join("\n");
      }
      case "wc": {
        const lines = stdinData.split("\n").filter(Boolean).length;
        const words = stdinData.split(/\s+/).filter(Boolean).length;
        const chars = stdinData.length;
        if (args.includes("-l")) return String(lines);
        if (args.includes("-w")) return String(words);
        if (args.includes("-c")) return String(chars);
        return `      ${lines}      ${words}      ${chars}`;
      }
      case "sort": {
        const arr = stdinData.split("\n");
        const r = args.includes("-r");
        arr.sort();
        return (r ? arr.reverse() : arr).join("\n");
      }
      case "uniq": return [...new Set(stdinData.split("\n"))].join("\n");
      case "head": {
        const n = parseInt(args[args.indexOf("-n")+1] || 10);
        return stdinData.split("\n").slice(0,n).join("\n");
      }
      case "tail": {
        const n = parseInt(args[args.indexOf("-n")+1] || 10);
        const arr = stdinData.split("\n");
        return arr.slice(Math.max(0,arr.length-n)).join("\n");
      }
      case "cut": {
        const d = args[args.indexOf("-d")+1] || "\t";
        const f = parseInt(args[args.indexOf("-f")+1] || 1) - 1;
        return stdinData.split("\n").map(l => l.split(d)[f] || "").join("\n");
      }
      case "awk": {
        // basic: awk '{print $N}'
        const m = (args[0]||"").match(/\{print \$(\d+)\}/);
        const col = m ? parseInt(m[1])-1 : 0;
        return stdinData.split("\n").map(l => l.split(/\s+/)[col]||"").join("\n");
      }
      case "sed": {
        const m = (args[0]||"").match(/^s\/(.*?)\/(.*?)\/(g?)$/);
        if (m) return stdinData.split("\n").map(l => m[3] ? l.replaceAll(m[1],m[2]) : l.replace(m[1],m[2])).join("\n");
        return stdinData;
      }
      case "tr": {
        if (args[0]==="-d") { const ch=args[1]||""; return stdinData.split(ch).join(""); }
        return stdinData;
      }
      case "tee": {
        if (args[0]) {
          const fp = this._resolve(args[0]);
          this.fs[fp] = { type:"file",perms:"-rw-r--r--",owner:this.user,size:stdinData.length,content:stdinData,mtime:this._fmtDate(new Date()) };
        }
        return stdinData;
      }
      case "xargs": return this.execute(args.join(" ")+" "+stdinData.trim());
      case "less":
      case "more": return stdinData;
      default: return `bash: ${cmd}: command not found`;
    }
  }

  _dispatch(cmd, args, raw) {
    switch(cmd) {
      // ---- Navigation ----
      case "pwd":    return this.cwd;
      case "cd":     return this._cd(args);
      case "ls":     return this._ls(args);
      case "dir":    return this._ls(args);
      case "tree":   return this._tree(args);
      case "pushd":  return this._cd(args);
      case "popd":   return `bash: popd: directory stack empty`;

      // ---- File ops ----
      case "cat":    return this._cat(args);
      case "tac":    return this._cat(args,true);
      case "less":   return this._cat(args);
      case "more":   return this._cat(args);
      case "head":   return this._head(args);
      case "tail":   return this._tail(args);
      case "touch":  return this._touch(args);
      case "mkdir":  return this._mkdir(args);
      case "rmdir":  return this._rmdir(args);
      case "rm":     return this._rm(args);
      case "cp":     return this._cp(args);
      case "mv":     return this._mv(args);
      case "ln":     return this._ln(args);
      case "find":   return this._find(args);
      case "locate": return this._locate(args);
      case "stat":   return this._stat(args);
      case "file":   return this._file(args);
      case "du":     return this._du(args);
      case "df":     return this._df(args);
      case "wc":     return this._wc(args);
      case "sort":   return this._sort(args);
      case "uniq":   return this._uniq(args);
      case "diff":   return this._diff(args);
      case "cut":    return this._cut(args);
      case "paste":  return this._paste(args);
      case "tee":    return this._tee(args);
      case "split":  return `split: file split not supported in demo`;
      case "shred":  return this._shred(args);
      case "truncate": return this._truncate(args);
      case "readlink": return `readlink: ${args[0]}: not a symbolic link`;

      // ---- Text processing ----
      case "grep":   return this._grep(args);
      case "egrep":  return this._grep(args);
      case "fgrep":  return this._grep(args);
      case "sed":    return this._sed(args);
      case "awk":    return this._awk(args);
      case "tr":     return this._tr(args);
      case "echo":   return this._echo(args);
      case "printf": return this._printf(args);
      case "xargs":  return `xargs: no input (pipe from another command)`;
      case "column": return this._column(args);

      // ---- System info ----
      case "whoami": return this.user;
      case "id":     return `uid=1000(${this.user}) gid=1000(${this.user}) groups=1000(${this.user}),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),121(netdev),132(wireshark),142(bluetooth)`;
      case "hostname": return this.hostname;
      case "uname":  return this._uname(args);
      case "date":   return new Date().toString();
      case "uptime": return this._uptime();
      case "w":      return `${new Date().toLocaleTimeString()} up 3 days,  5:32,  1 user,  load average: 0.08, 0.12, 0.09\nUSER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT\n${this.user}  pts/0    192.168.1.5      09:00    0.00s  0.05s  0.01s bash`;
      case "who":    return `${this.user}   pts/0        2024-06-25 09:00 (192.168.1.5)`;
      case "last":   return `${this.user}  pts/0        192.168.1.5      Tue Jun 25 09:00   still logged in\nwtmp begins Mon Jun 24 00:00:00 2024`;
      case "lscpu":  return this._lscpu();
      case "lsmem":  return `RANGE                                  SIZE  STATE REMOVABLE  BLOCK\n0x0000000000000000-0x00000001ffffffff   8G online       yes   0-63\n\nMemory block size:       128M\nTotal online memory:       8G\nTotal offline memory:      0B`;
      case "lsblk":  return `NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT\nsda      8:0    0    50G  0 disk \n└─sda1   8:1    0    50G  0 part /\nsdb      8:16   1    16G  0 disk \n└─sdb1   8:17   1    16G  0 part /media/usb`;
      case "lsusb":  return `Bus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub\nBus 001 Device 003: ID 8087:0a2b Intel Corp. Bluetooth wireless interface\nBus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub`;
      case "lspci":  return `00:00.0 Host bridge: Intel Corporation 8th Gen Core Processor Host Bridge\n00:02.0 VGA compatible controller: Intel Corporation UHD Graphics 630\n00:1f.6 Ethernet controller: Intel Corporation Ethernet Connection (7) I219-LM`;
      case "free":   return this._free(args);
      case "vmstat": return `procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----\n r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st\n 0  0  120832 2341232 312440 1823664    1    2     8     4   51  115  2  1 97  0  0`;
      case "top":    return this._top();
      case "htop":   return `htop requires a real terminal. Use 'ps aux' instead.`;
      case "ps":     return this._ps(args);
      case "pgrep":  return this._pgrep(args);
      case "pstree": return `systemd─┬─NetworkManager───2*[{NetworkManager}]\n        ├─bash───pstree\n        ├─cron\n        ├─sshd\n        └─2*[{systemd}]`;
      case "kill":   return this._kill(args);
      case "killall":return `killall: no process found`;
      case "pkill":  return `pkill: no matching processes`;
      case "nice":   return args.slice(1).join(" ");
      case "nohup":  return `nohup: ignoring input and appending output to 'nohup.out'`;
      case "bg":     return `[1]+ ${args.join(" ")}&`;
      case "fg":     return `[1]+ ${args.join(" ")}`;
      case "jobs":   return ``;
      case "env":    return Object.entries(this.env).map(([k,v])=>`${k}=${v}`).join("\n");
      case "printenv": return args[0] ? (this.env[args[0]]||"") : Object.entries(this.env).map(([k,v])=>`${k}=${v}`).join("\n");
      case "export": return this._export(args);
      case "set":    return Object.entries(this.env).map(([k,v])=>`${k}='${v}'`).join("\n");
      case "unset":  { delete this.env[args[0]]; return ""; }
      case "alias":  return this._alias(args);
      case "unalias":{ delete this.aliases[args[0]]; return ""; }
      case "type":   return this.aliases[args[0]] ? `${args[0]}='${this.aliases[args[0]]}'` : `${args[0]} is a shell builtin`;
      case "which":  return this._which(args[0]);
      case "whereis":return `${args[0]}: /usr/bin/${args[0]} /usr/share/man/man1/${args[0]}.1.gz`;
      case "command":return this._which(args[1]||args[0]);

      // ---- Network ----
      case "ifconfig": return this._ifconfig(args);
      case "ip":       return this._ip(args);
      case "iwconfig": return this._iwconfig();
      case "ping":     return this._ping(args);
      case "traceroute":return this._traceroute(args);
      case "tracepath":return this._traceroute(args);
      case "mtr":      return this._mtr(args);
      case "netstat":  return this._netstat(args);
      case "ss":       return this._ss(args);
      case "nmap":     return this._nmap(args);
      case "curl":     return this._curl(args);
      case "wget":     return this._wget(args);
      case "nslookup": return this._nslookup(args);
      case "dig":      return this._dig(args);
      case "host":     return this._host(args);
      case "arp":      return this._arp(args);
      case "route":    return this._route(args);
      case "ssh":      return `ssh: connect to host ${args[0]||"target"} port 22: Connection refused\n(Simulated — real SSH not available)`;
      case "scp":      return `scp: Connection closed (Simulated)`;
      case "ftp":      return `ftp: connect: Connection refused`;
      case "nc":
      case "netcat":   return this._nc(args);
      case "telnet":   return `Trying ${args[0]}...\ntelnet: Unable to connect to remote host: Connection refused`;
      case "tcpdump":  return this._tcpdump(args);
      case "wireshark":return `wireshark: error: Unable to open display (use tshark for CLI)`;
      case "tshark":   return this._tshark(args);
      case "whois":    return this._whois(args);
      case "iptables": return this._iptables(args);
      case "ufw":      return this._ufw(args);
      case "nftables":
      case "nft":      return `table ip filter {\n  chain input { type filter hook input priority 0; }\n  chain output { type filter hook output priority 0; }\n}`;

      // ---- Security tools (Kali) ----
      case "nmap":     return this._nmap(args);
      case "nikto":    return this._nikto(args);
      case "sqlmap":   return this._sqlmap(args);
      case "hydra":    return this._hydra(args);
      case "john":     return this._john(args);
      case "hashcat":  return this._hashcat(args);
      case "aircrack-ng": return this._aircrack(args);
      case "airodump-ng": return this._airodump(args);
      case "aireplay-ng": return `aireplay-ng: No such interface (simulated)`;
      case "airmon-ng":   return this._airmon(args);
      case "metasploit":
      case "msfconsole": return this._msf(args);
      case "msfvenom":   return this._msfvenom(args);
      case "burpsuite":  return `BurpSuite: launching GUI... (not available in terminal demo)`;
      case "dirb":       return this._dirb(args);
      case "gobuster":   return this._gobuster(args);
      case "wfuzz":      return `WFUZZ 3.1.0: Launching fuzzer...`;
      case "ffuf":       return this._ffuf(args);
      case "whatweb":    return this._whatweb(args);
      case "wpscan":     return this._wpscan(args);
      case "enum4linux":  return this._enum4linux(args);
      case "smbclient":  return this._smbclient(args);
      case "rpcclient":  return `rpcclient $> `;
      case "crackmapexec":
      case "cme":        return this._cme(args);
      case "responder":  return `[*] Responder requires root. Run with: sudo responder -I eth0`;
      case "impacket-secretsdump":
      case "secretsdump": return `[*] Dumping secrets...`;
      case "evil-winrm": return `Evil-WinRM: connecting to ${args[args.indexOf("-i")+1]||"target"}...`;
      case "searchsploit":return this._searchsploit(args);
      case "setoolkit":  return `SET 8.0.3: Social Engineering Toolkit (simulated)`;
      case "beef-xss":   return `BeEF: Browser Exploitation Framework starting on port 3000...`;

      // ---- Crypto / Encoding ----
      case "base64":    return this._base64(args);
      case "base32":    return `base32: ${args[0]||"(no input)"}`;
      case "xxd":       return this._xxd(args);
      case "hexdump":   return this._xxd(args);
      case "od":        return this._od(args);
      case "openssl":   return this._openssl(args);
      case "gpg":       return this._gpg(args);
      case "md5sum":    return this._hash("md5", args);
      case "sha1sum":   return this._hash("sha1", args);
      case "sha256sum": return this._hash("sha256", args);
      case "sha512sum": return this._hash("sha512", args);
      case "strings":   return this._strings(args);
      case "binwalk":   return this._binwalk(args);
      case "exiftool":  return this._exiftool(args);
      case "steghide":  return `steghide ${args[0]||"--help"}: (simulated)`;
      case "stegsolve": return `stegsolve: GUI tool — not available in terminal`;

      // ---- Archives ----
      case "tar":    return this._tar(args);
      case "zip":    return this._zip(args);
      case "unzip":  return this._unzip(args);
      case "gzip":   return `gzip: ${args[0]||"--help"}`;
      case "gunzip": return `gunzip: ${args[0]||"--help"}`;
      case "bzip2":  return `bzip2: ${args[0]||"--help"}`;
      case "7z":     return `7-Zip 21.07: ${args.join(" ")}`;
      case "xz":     return `xz: ${args[0]||"--help"}`;

      // ---- Permissions & Users ----
      case "chmod":  return this._chmod(args);
      case "chown":  return this._chown(args);
      case "chgrp":  return this._chgrp(args);
      case "umask":  return `0022`;
      case "sudo":   return this._sudo(args);
      case "su":     return `[sudo] password for ${this.user}: `;
      case "passwd": return `Changing password for ${this.user}.\npasswd: (current) UNIX password: `;
      case "useradd":return `useradd: requires root privileges`;
      case "userdel":return `userdel: requires root privileges`;
      case "usermod":return `usermod: requires root privileges`;
      case "groupadd":return `groupadd: requires root privileges`;
      case "groups": return `${this.user} adm cdrom sudo dip plugdev netdev wireshark bluetooth`;
      case "id":     return `uid=1000(${this.user}) gid=1000(${this.user}) groups=1000(${this.user}),4(adm),27(sudo),142(bluetooth)`;
      case "visudo": return `visudo: requires root`;
      case "newgrp": return ``;

      // ---- Package management ----
      case "apt":
      case "apt-get": return this._apt(args);
      case "dpkg":    return this._dpkg(args);
      case "pip":
      case "pip3":    return this._pip(args);
      case "gem":     return `gem ${args.join(" ")}: (simulated Ruby gems)`;
      case "snap":    return `snap ${args.join(" ")}: (simulated)`;

      // ---- Dev tools ----
      case "git":      return this._git(args);
      case "python":
      case "python3":  return this._python(args);
      case "perl":     return `perl: interpret Perl scripts`;
      case "ruby":     return `ruby: interpret Ruby scripts`;
      case "node":     return `Welcome to Node.js v20.0.0.\n(To exit, press Ctrl+C)`;
      case "go":       return `go: ${args[0]||"help"}`;
      case "gcc":      return this._gcc(args);
      case "g++":      return this._gcc(args);
      case "make":     return `make: *** [Makefile:1: all] Error 1`;
      case "cmake":    return `cmake ${args.join(" ")}`;
      case "gdb":      return `GNU gdb (Debian 13.1-3) 13.1\n(gdb) `;
      case "strace":   return `strace: attach: ptrace(PTRACE_SEIZE): Operation not permitted`;
      case "ltrace":   return `ltrace: Permission denied`;
      case "objdump":  return `objdump ${args.join(" ")}: (simulated)`;
      case "strings":  return this._strings(args);
      case "nm":       return `nm: ${args[0]||""}: no symbols`;
      case "ldd":      return this._ldd(args);
      case "readelf":  return this._readelf(args);
      case "pwntools": return `python3 -c "from pwn import *"`;

      // ---- Shell / Session ----
      case "clear":    return "___CLEAR___";
      case "reset":    return "___CLEAR___";
      case "exit":
      case "logout":   return `logout`;
      case "history":  return this._history();
      case "man":      return this._man(args[0]);
      case "help":     return this._help();
      case "source":
      case ".":        return ``;
      case "bash":     return `bash: spawning subshell (simulated)`;
      case "sh":       return `sh: spawning shell (simulated)`;
      case "zsh":      return `zsh 5.9 (simulated)`;
      case "sleep":    return ``;
      case "wait":     return ``;
      case "true":     return ``;
      case "false":    this.lastExit=1; return ``;
      case "test":     return ``;
      case "[":        return ``;
      case "read":     return ``;
      case "time":     return `real\t0m0.001s\nuser\t0m0.000s\nsys\t0m0.001s`;
      case "watch":    return `Every ${args.includes("-n")?args[args.indexOf("-n")+1]:"2.0"}s: ${args.filter(a=>!a.startsWith("-")).join(" ")}`;
      case "crontab":  return this._crontab(args);
      case "at":       return `at: commands scheduled`;
      case "systemctl":return this._systemctl(args);
      case "service":  return this._service(args);
      case "journalctl":return this._journalctl(args);
      case "dmesg":    return `[    0.000000] Booting Linux on physical CPU 0x0\n[    0.000000] Linux version 6.1.0-kali5-amd64\n[    1.234567] ACPI: 4 ACPI AML tables successfully acquired and loaded\n[    2.345678] NET: Registered PF_INET6 protocol family`;
      case "lsof":     return this._lsof(args);
      case "stty":     return `speed 38400 baud; rows 24; columns 80;`;
      case "tty":      return `/dev/pts/0`;
      case "script":   return `Script started, output log file is 'typescript'`;
      case "screen":   return `[screen is terminating]`;
      case "tmux":     return `tmux: created new session`;
      case "xterm":    return `xterm: DISPLAY not set`;
      case "nano":     return `nano: use the built-in editor (Ctrl+X to exit)`;
      case "vim":
      case "vi":       return `vim: use the built-in nano editor instead`;
      case "emacs":    return `emacs: DISPLAY not set (try emacs -nw)`;
      case "cat":      return this._cat(args);

      // ---- Misc ----
      case "cowsay":   return ` ${('_').repeat((args.join(' ')||'moo').length+2)}\n< ${args.join(' ')||'moo'} >\n ${('-').repeat((args.join(' ')||'moo').length+2)}\n        \\   ^__^\n         \\  (oo)\\_______\n            (__)\\       )\\/\\\n                ||----w |\n                ||     ||`;
      case "figlet":   return args.join(" ").toUpperCase().split("").join("  ");
      case "banner":   return args.join(" ").toUpperCase();
      case "cal":      return this._cal();
      case "bc":       return `bc 1.07.1\nType 'quit' to exit`;
      case "expr":     return this._expr(args);
      case "seq":      return this._seq(args);
      case "yes":      return Array(5).fill(args[0]||"y").join("\n")+"...";
      case "factor":   return this._factor(args);
      case "numfmt":   return args[args.length-1]||"0";
      case "tput":     return ``;
      case "stdbuf":   return this.execute(args.slice(3).join(" "));
      case "timeout":  return this.execute(args.slice(1).join(" "));
      case "xdg-open": return `Opening ${args[0]||"file"}...`;
      case "open":     return `Opening ${args[0]||"file"}...`;
      case "mount":    return this._mount();
      case "umount":   return `umount: ${args[0]||""}: not mounted`;
      case "fdisk":    return `Disk /dev/sda: 50 GiB, 53687091200 bytes, 104857600 sectors`;
      case "mkfs":     return `mke2fs 1.47.0: Creating filesystem`;
      case "fsck":     return `fsck: OK`;
      case "sync":     return ``;
      case "reboot":   return `Rebooting... (simulated — nothing will change)`;
      case "shutdown": return `Shutdown scheduled... (simulated)`;
      case "poweroff": return `Powering off... (simulated)`;
      case "insmod":
      case "modprobe": return `modprobe: requires root`;
      case "lsmod":    return `Module                  Size  Used by\nnls_utf8               16384  0\noverlay               151552  0\nbr_netfilter           32768  0`;
      case "sysctl":   return args[0]||`sysctl: reading kernel parameters`;
      case "ulimit":   return `unlimited`;

      // ==================== 100 ADDITIONAL COMMANDS ====================

      // ---- Network / Scanning ----
      case "masscan":   return `Starting masscan 1.3.2\nRate: 1000.00-pkts/sec\nScanning ${args[args.length-1]||"192.168.1.0/24"}\nDiscovered open port 80/tcp on 192.168.1.1\nDiscovered open port 22/tcp on 192.168.1.100`;
      case "hping3":    return `HPING ${args[args.length-1]||"target"} (eth0): S set, 40 headers + 0 data bytes\nlen=46 ip=192.168.1.1 ttl=64 DF id=0 sport=0 flags=RA seq=0 win=0 rtt=1.2 ms\nlen=46 ip=192.168.1.1 ttl=64 DF id=0 sport=0 flags=RA seq=1 win=0 rtt=0.9 ms`;
      case "dnsenum":   return `dnsenum VERSION:1.2.6\n\nHost addresses:\n${args[0]||"target.com"} 300 IN A 93.184.216.34\nName Servers: ns1.${args[0]||"target.com"} 300 IN A 205.251.196.1\nMail Servers: mail.${args[0]||"target.com"} 300 IN A 93.184.216.100`;
      case "dnsrecon":  return `[*] Performing General Enumeration of Domain: ${args[args.indexOf("-d")+1]||"target.com"}\n[*] DNSSEC is not configured\n[+] A target.com 93.184.216.34\n[+] MX mail.target.com 93.184.216.100\n[+] NS ns1.target.com 205.251.196.1`;
      case "sublist3r": return `Sublist3r v1.0 - Subdomain Enumeration Tool\n[-] Enumerating subdomains for ${args[args.indexOf("-d")+1]||"target.com"}\n[+] admin.target.com\n[+] mail.target.com\n[+] vpn.target.com\n[+] dev.target.com\n[+] api.target.com\n[-] Total Unique Subdomains Found: 5`;
      case "amass":     return `[*] OWASP Amass v3.23.3 - Enumeration started\n[+] ${args[args.indexOf("-d")+1]||"target"}.com -> A -> 93.184.216.34\n[+] www.${args[args.indexOf("-d")+1]||"target"}.com -> CNAME -> target.com\n[+] mail.${args[args.indexOf("-d")+1]||"target"}.com -> MX -> 93.184.216.100`;
      case "shodan":    return `Shodan CLI - Register at https://account.shodan.io for API key\nUsage: shodan [OPTIONS] COMMAND\nCommands: search, host, count, info, download`;
      case "recon-ng":  return `[*] Recon-ng v5.1.2\n[recon-ng][default] > \nType 'help' for available commands\nType 'marketplace install all' to install modules`;
      case "theharvester": return `*******************************************************************\n* The Harvester 4.6 - Searching: ${args[args.indexOf("-d")+1]||"target.com"}\n[*] Searching Google, Bing, LinkedIn...\n[+] Emails found: admin@target.com, info@target.com, hr@target.com\n[+] Hosts found: www.target.com, mail.target.com, vpn.target.com`;
      case "maltego":   return `Maltego v4.6 - Graphical link analysis tool (GUI required)\nStart with: maltego &`;
      case "spiderfoot":return `SpiderFoot v4.0: OSINT Automation\nStarting scan for: ${args[0]||"target.com"}\n[+] Emails: 3 found\n[+] Domains: 7 found\n[+] IPs: 5 found\n[*] Use: spiderfoot -l 127.0.0.1:5001 for web UI`;

      // ---- Web Application Testing ----
      case "sqlninja":  return `sqlninja v0.2.999-alpha - SQL Server injection tool\nUsage: sqlninja -m mode [-f config]\nModes: t(est), e(xtract), b(ruteforce), c(md)`;
      case "xsser":     return `XSSer v1.8.4 - Cross Site Scripter\n[*] Testing: ${args[args.indexOf("-u")+1]||"http://target.com/?q=test"}\n[!] XSS FOUND: <script>alert(1)<\/script>\n[+] Parameter: q  Type: reflected`;
      case "commix":    return `Commix v3.9 - Command injection exploiter\n[*] Testing: ${args[args.indexOf("-u")+1]||"http://target.com/?id=1"}\n[+] Command injection detected! Type: semi-blind`;
      case "skipfish":  return `skipfish web application security scanner v2.10b\n[*] Scanning: ${args[args.length-1]||"http://target.com"}\n[*] Scan in progress...\n[+] Crawled: 47 URLs\n[+] Issues found: 3 HIGH, 7 MEDIUM`;
      case "w3af":      return `w3af - Web Application Attack and Audit Framework\nw3af/plugins> \nType 'help' for commands`;
      case "arachni":   return `Arachni - Web Security Scanner\nScanning: ${args[0]||"http://target.com"}\n[+] XSS found at: /search?q=\n[+] SQLi found at: /user?id=\n[+] Open Redirect: /redirect?url=`;
      case "nuclei":    return `[INF] Using Nuclei Engine v2.9.15\n[INF] Templates loaded: 5841\n[CVE-2021-44228] [critical] ${args[args.indexOf("-u")+1]||"target.com"} - Log4Shell RCE\n[CVE-2022-1388] [high] ${args[args.indexOf("-u")+1]||"target.com"} - F5 BIG-IP Auth Bypass`;
      case "feroxbuster": return `feroxbuster v2.10.0 - Content Discovery\n200 GET http://${args[args.indexOf("-u")+1]||"target.com"}/admin\n200 GET http://${args[args.indexOf("-u")+1]||"target.com"}/login\n301 GET http://${args[args.indexOf("-u")+1]||"target.com"}/uploads\n200 GET http://${args[args.indexOf("-u")+1]||"target.com"}/config.php.bak`;
      case "arjun":     return `[*] Arjun v2.2.1 - HTTP Parameter Discovery\n[+] Checking: ${args[args.indexOf("-u")+1]||"http://target.com"}\n[+] Parameters found: id, user, token, page, action`;
      case "dalfox":    return `dalfox v2.9.2 - XSS Finder\n[*] Scanning ${args[args.indexOf("-u")+1]||"http://target.com/?q=1"}\n[POC] (XSS) Alert Triggered! param=q\n[*] Payload: <script>alert(document.cookie)<\/script>`;
      case "zaproxy":
      case "zap":       return `OWASP ZAP v2.14.0\nStart daemon: zaproxy -daemon -port 8080\nAPI: http://localhost:8080/JSON/`;

      // ---- Password / Crypto ----
      case "hashid":    return `[+] Analyzing: ${args[0]||"5d41402abc4b2a76b9719d911017c592"}\n[+] [MD5]\n[+] [MD4]\n[+] [Double MD5]\n[+] [LM]`;
      case "hash-identifier": return `HASH: ${args[0]||"5d41402abc4b2a76b9719d911017c592"}\nPossible Hashs:\n[+]  MD5\n[+]  Domain Cached Credentials - MD4(MD4(($pass)).(strtolower($username)))`;
      case "crunch":    return `crunch 3.6\n[*] Generating wordlist: min=${args[0]||"8"} max=${args[1]||"8"}\n[+] Writing to: ${args[args.indexOf("-o")+1]||"wordlist.txt"}\n[+] Estimated: 6,634,204,312 bytes`;
      case "cewl":      return `CeWL 6.1 Robin Wood\n[*] Spidering ${args[args.length-1]||"http://target.com"}\n[+] Words found: password, admin, security, login, target, system, network, backup, root`;
      case "cupp":      return `[+] CUPP v3.0 - Common User Passwords Profiler\n[+] Insert the information about the victim to make a dictionary\n> First Name: `;
      case "rsatool":   return `rsatool.py - RSA/Rabin tool\nUsage: rsatool.py -f PEM -o key.pem -p P -q Q\nFactoring n...`;
      case "sslscan":   return `sslscan v2.1.3\n\nConnected to ${args[0]||"target.com"}:443\n\nSSL/TLS Protocols:\n  SSLv2     disabled\n  SSLv3     disabled\n  TLSv1.0   enabled (INSECURE)\n  TLSv1.1   enabled (INSECURE)\n  TLSv1.2   enabled\n  TLSv1.3   enabled`;
      case "sslyze":    return `sslyze 5.2.0\n\nScan Results For ${args[0]||"target.com"}:443\n[+] TLS 1.3: Supported\n[+] Certificate: Valid until 2025-01-01\n[+] HEARTBLEED: Not vulnerable\n[!] TLS 1.0: Supported (consider disabling)`;
      case "testssl":
      case "testssl.sh":return `testssl 3.0.8 -- Testing TLS/SSL of ${args[0]||"target.com"}:443\n[+] TLS 1.3: ECDHE-RSA-AES256-GCM-SHA384\n[+] Heartbleed: not vulnerable\n[!] BEAST TLS1.0: VULNERABLE\n[!] POODLE SSLv3: not tested (SSLv3 disabled)`;

      // ---- Exploitation ----
      case "chisel":    return `2024/06/25 10:00:00 client: Connecting to ws://127.0.0.1:8080\n2024/06/25 10:00:00 client: Connected (Latency 1.5ms)\n[+] Tunnel established`;
      case "socat":     return `socat v1.7.4.4 - multipurpose relay\nUsage: socat [options] <address> <address>\nExample: socat TCP-LISTEN:4444,reuseaddr,fork EXEC:/bin/bash`;
      case "pwncat":    return `pwncat v0.5.3 - Post-exploitation platform\n[+] Connected to ${args[0]||"127.0.0.1"}:${args[1]||"4444"}\n(Remote) $ `;
      case "powershell":return `Windows PowerShell (Simulated — you are running Kali Linux)\nPS C:\\> `;
      case "mimikatz":  return `mimikatz 2.2.0 (x64)\n[*] Module: sekurlsa\n[*] Logon sessions: 3\n[+] administrator:Password123!\n[+] NTLM: 8846f7eaee8fb117ad06bdd830b7586c`;
      case "netexec":   return `SMB  ${args[args.length-1]||"192.168.1.0/24"}  445  DC01  [*] Windows 10.0 Build 17763\nSMB  ${args[args.length-1]||"192.168.1.0/24"}  445  DC01  [+] kali:password123 (Pwn3d!)`;
      case "impacket-psexec":
      case "psexec":    return `Impacket v0.11.0\n[*] Requesting shares on ${args[0]||"target"}\n[*] Found writable share ADMIN$\n[*] Uploading payload...\n[+] Shell obtained!\nMicrosoft Windows [Version 10.0.17763]\nC:\\Windows\\system32>`;

      // ---- Wireless ----
      case "wifite":    return `Wifite 2.7.0 — Wireless Attack Suite\n[*] Scanning for wireless networks...\n[+] WPA2: HomeNetwork_5G  ch:6  -72dBm  CLIENTS:2\n[+] WPA2: OfficeWifi      ch:11 -65dBm  CLIENTS:5\n[+] WEP:  OldRouter       ch:1  -80dBm  CLIENTS:0`;
      case "kismet":    return `Kismet 2024-01-R1 - Wireless network detector\nLaunching on interface wlan0...\n[*] Detected: 3 access points, 8 clients\nAccess Kismet UI: http://localhost:2501`;
      case "pixiewps":  return `Pixiewps 1.42 - Pixie Dust attack\n[*] Running attack...\n[+] E-Hash1: [XXXXXXXXXXXXXXXX]\n[+] E-Hash2: [YYYYYYYYYYYYYYYY]\n[!] WPS pin: 12345678`;
      case "bully":     return `Bully v1.4-6 — WPS Brute Force\n[*] Using interface: wlan0mon\n[*] Trying pin 12345670\n[+] Got SSID: HomeNetwork\n[+] Got PSK: MyP@ssword123`;
      case "reaver":    return `Reaver v1.6.5 — WPS Attack Tool\n[+] Waiting for beacon from ${args[args.indexOf("-b")+1]||"AA:BB:CC:DD:EE:FF"}\n[+] Associated with target AP\n[+] Trying pin 12345670\n[+] 20.81% complete @ 0:07:23 (2 sec/attempt)`;
      case "mdk4":      return `mdk4 v4.4 - 802.11 Attack Tool\nUsage: mdk4 <interface> <test_mode> [options]\nModes: b(eacon flood), a(uth DoS), p(robe), d(eauth broadcast)`;
      case "hostapd-wpe":return `[+] hostapd-wpe starting...\n[*] Interface: wlan0, Channel: 6\n[*] SSID: FakeAP (Evil Twin)\n[*] Rogue AP ready — waiting for clients...\n[+] Client connected: AA:BB:CC:11:22:33`;

      // ---- Forensics / Reverse Engineering ----
      case "volatility":
      case "vol":       return `Volatility Foundation Volatility Framework 2.6.1\nProfile: Win7SP1x64\nPlugins: imageinfo, pslist, netscan, dumpfiles, hashdump, cmdline, clipboard\nUsage: vol.py -f memory.dmp --profile=Win7SP1x64 pslist`;
      case "autopsy":   return `Autopsy 4.21.0 Digital Forensics Platform (GUI)\nStart with: autopsy &\nOr use Sleuth Kit CLI: mmls, fls, icat, fsstat`;
      case "mmls":      return `DOS Partition Table\nOffset Sector: 0\n     Slot    Start       End         Length      Description\n000: Meta    0000000000  0000000000  0000000001  Primary Table (#0)\n001: -------  0000000000  0000002047  0000002048  Unallocated\n002: 000:000  0000002048  0001026047  0001024000  Linux (0x83)`;
      case "foremost":  return `Processing: ${args[args.indexOf("-i")+1]||"image.dd"}\n|------------------------------------------------------------------\n  File Name     Num     Size\njpg               23    1.4 MB\npdf                5    2.1 MB\nzip                2    512 KB\nDone!`;
      case "scalpel":   return `Scalpel 1.60 - File recovery\nExtracting from ${args[args.length-1]||"image.dd"}...\n[+] jpg: 23 files recovered\n[+] pdf: 5 files recovered\n[+] zip: 2 files recovered\nComplete!`;
      case "photorec":  return `PhotoRec 7.2 - Data Recovery Utility\nRecovering files from ${args[0]||"/dev/sda"}...\n[+] 147 files recovered\nResults: /home/user/recup_dir.1/`;
      case "hexedit":   return `hexedit ${args[0]||"file.bin"}\n00000000  7F 45 4C 46 02 01 01 00  00 00 00 00 00 00 00 00  |.ELF............|\n00000010  02 00 3E 00 01 00 00 00  78 04 40 00 00 00 00 00  |..>.....x.@.....|`;
      case "ghidra":    return `Ghidra 11.0.2 - SRE Framework (GUI)\nStart: ghidra &\nCLI analysis: analyzeHeadless /project proj -import binary`;
      case "radare2":
      case "r2":        return `r2 - Radare2 v5.9.0\n[0x00000000]> \nUsage: r2 ${args[0]||"binary"}\nCommands: aa (analyze all), afl (list functions), pdf @ main (disassemble)`;
      case "frida":     return `Frida v16.2.1 - Dynamic instrumentation\nfrida-ps -U            (list USB processes)\nfrida -U -f com.app --no-pause -l script.js\nfrida-trace -U -f com.app -i "open*"`;
      case "apktool":   return `Apktool v2.9.3 - Android APK reverse engineering\n[*] Decoding ${args[1]||"app.apk"}...\n[*] Baksmaling classes...\n[*] Copying assets...\n[+] Done! Output: ${(args[1]||"app").replace(".apk","")}/ `;
      case "jadx":      return `JADX v1.4.7 - Android Decompiler\nDecompiling: ${args[0]||"app.apk"}\n[+] Output: ${(args[0]||"app").replace(".apk","")}/\n[+] 47 classes decompiled`;

      // ---- Active Directory ----
      case "bloodhound-python": return `BloodHound.py v1.6.1\n[*] Getting TGT for user\n[+] Collecting AD objects...\n[+] Done! 12 objects collected\n[*] Import JSON files into BloodHound GUI: bloodhound &`;
      case "kerbrute":  return `Kerbrute v1.0.3 - Kerberos Username Enumeration\n[+] VALID USERNAME: admin@DOMAIN.LOCAL\n[+] VALID USERNAME: jsmith@DOMAIN.LOCAL\n[+] VALID USERNAME: svc_sql@DOMAIN.LOCAL\n[-] Total valid: 3`;
      case "ldapsearch": return `ldap_bind: Simple authentication succeeded\ndn: DC=domain,DC=local\ndn: CN=Administrator,CN=Users,DC=domain,DC=local\nsAMAccountName: Administrator\nmemberOf: CN=Domain Admins,CN=Users,DC=domain,DC=local\nuserPrincipalName: administrator@domain.local`;
      case "smbmap":    return `SMBMap - Samba Share Enumerator\n[+] IP: ${args[args.indexOf("-H")+1]||"192.168.1.1"}:445  Name: target  Workgroup: WORKGROUP\n   Disk        Permissions  Comment\n   ----        -----------  -------\n   ADMIN$      NO ACCESS\n   C$          NO ACCESS\n   IPC$        READ ONLY\n   shares      READ, WRITE  Public Share`;
      case "ntlmrelayx":
      case "impacket-ntlmrelayx": return `Impacket v0.11.0\n[*] Protocol Client SMB loaded\n[*] Running in relay mode\n[*] Setting up SMB Server on port 445\n[*] Setting up HTTP Server on port 80\n[*] Servers started, waiting for connections`;
      case "impacket-secretsdump": return `Impacket v0.11.0 - secretsdump\n[*] Service RemoteRegistry started\n[*] Dumping SAM hashes\nAdministrator:500:aad3b435b51404eeaad3b435b51404ee:8846f7eaee8fb117ad06bdd830b7586c:::`;
      case "GetUserSPNs.py":
      case "kerberoast": return `Impacket v0.11.0 - GetUserSPNs\n[*] Getting TGT for user\nServicePrincipalName    Name     MemberOf      PasswordLastSet\nMSSQLSvc/db01          svc_sql  Domain Users  2024-01-01\n\n$krb5tgs$23$*svc_sql$DOMAIN.LOCAL*$...`;

      // ---- Container / Cloud ----
      case "docker":    return this._docker(args);
      case "kubectl":   return this._kubectl(args);
      case "terraform": return `Terraform v1.6.6\nUsage: terraform [options] <subcommand>\nSubcommands: init, plan, apply, destroy, fmt, validate, state, output`;
      case "ansible":   return `ansible ${args[0]||"all"} -m ping\nlocalhost | SUCCESS => {\n    "changed": false,\n    "ping": "pong"\n}`;
      case "vagrant":   return `Vagrant 2.3.7\nUsage: vagrant [options] <command>\nCommon: up, halt, ssh, destroy, provision, reload, status`;
      case "aws":       return this._aws(args);
      case "gcloud":    return `Google Cloud SDK 460.0.0\nUsage: gcloud [options] <command>\nCommands: compute, storage, iam, sql, run, container, functions`;
      case "az":        return `Microsoft Azure CLI 2.56.0\nUsage: az [command] [args]\nCommands: vm, network, storage, ad, keyvault, webapp, aks`;

      // ---- System Security Analysis ----
      case "lynis":     return `Lynis 3.0.9 - Security Auditing Tool\n[+] System: Linux kali 6.1.0-kali5-amd64\n[*] Performing system tests...\n[WARNING] Found 3 vulnerable packages\n[SUGGESTION] Enable auditd for better logging\n[SUGGESTION] Configure iptables default DROP policy\n[+] Hardening index: 62 [##########          ]`;
      case "chkrootkit": return `ROOTDIR is '/'\nChecking 'amd'... not found\nChecking 'basename'... not infected\nChecking 'cron'... not infected\nChecking 'login'... not infected\nChecking 'ls'... not infected\n[*] Nothing suspicious found`;
      case "rkhunter":  return `Rootkit Hunter 1.4.6\nChecking system commands...\n  Checking 'strings' command       [ OK ]\n  Checking 'bash' command          [ OK ]\nChecking for rootkits...\n  Checking known rootkit files     [ None found ]\nSystem checks summary: [ No warnings ]`;
      case "aide":      return `AIDE 0.17.4 — Advanced Intrusion Detection\n[+] Initializing database...\n[+] Checksumming: /bin /sbin /usr/bin /usr/sbin /etc\n[+] Database written: /var/lib/aide/aide.db.new\n[+] No integrity violations detected`;
      case "fail2ban-client": return `Status\n|- Number of jail: 3\n\`- Jail list: sshd, apache-auth, nginx-http-auth`;
      case "auditctl":  return `enabled 1\nfailure 1\npid 0\nrate_limit 0\nbacklog_limit 64\nlost 0\nbacklog 0\ncontrolex 0`;
      case "ausearch":  return `----\ntype=SYSCALL msg=audit(1703500000.000:1234): arch=c000003e syscall=59 success=yes exit=0\ntype=EXECVE msg=audit(1703500000.000:1234): argc=3 a0="bash" a1="-c" a2="id"\ntype=PATH msg=audit(1703500000.000:1234): name="/bin/bash"`;
      case "aureport":  return `Summary Report\n======================\nRange: 06/25/2024 00:00:00 - 06/25/2024 10:00:00\nNumber of changes in configuration: 0\nNumber of changes to accounts: 0\nNumber of logins: 3\nNumber of failed logins: 1\nNumber of authentications: 5\nNumber of failed authentications: 1`;

      // ---- Text / Data Processing ----
      case "jq":        return this._jq(args);
      case "yq":        return `yq v4.40.5 - YAML/JSON processor\n${args.slice(1).join(" ")||"{}"}`;
      case "xmllint":   return `<?xml version="1.0"?>\n<root>\n  <element>value</element>\n</root>`;
      case "csvkit":    return `csvkit 1.3.0 - CSV processing tools\nTools: csvclean, csvcut, csvjoin, csvlook, csvsort, csvstat`;
      case "jc":        return `jc v1.25.1 - JSON CLI output converter\nUsage: <cmd> | jc --<parser>\nParsers: --ps, --netstat, --ifconfig, --ls, --df, --iptables`;
      case "fx":        return `fx 31.0.0 - JSON viewer\n${args[0]||"{}"}`;
      case "miller":
      case "mlr":       return `Miller 6.10.0 - like awk/sed/cut/join for CSV/JSON/TSV\nUsage: mlr [options] {verb} [verb-options] {file}\nVerbs: filter, put, sort, stats1, group-by, join`;
      case "parallel":  return `GNU parallel 20231022\nUsage: parallel [options] [command] ::: args\nExample: parallel echo ::: 1 2 3`;
      case "pv":        return `0.00 B 0:00:00 [0.00 B/s] [<=>]`;
      case "lolcat":    return args.join(" ")||"(pipe text to lolcat for rainbow colors 🌈)";
      case "toilet":    return args.join(" ").toUpperCase() || "TOILET";
      case "boxes":     return `/---------------------\\\n| ${(args.join(" ")||"Hello").padEnd(19)} |\n\\---------------------/`;

      // ---- Development / Languages ----
      case "lua":       return `Lua 5.4.6  Copyright (C) 1994-2023 Lua.org, PUC-Rio\n>`;
      case "php":       return `PHP 8.2.13 (cli)\nUsage: php [options] [-f] <file> [--] [args...]`;
      case "java":      return `java version "21.0.1" 2023-10-17 LTS\nJava(TM) SE Runtime Environment (build 21.0.1+12-LTS)\nJava HotSpot(TM) 64-Bit Server VM (build 21.0.1+12-LTS, mixed mode, sharing)`;
      case "javac":     return `javac ${args[0]||"*.java"} - compilation complete`;
      case "mvn":       return `Apache Maven 3.9.5\n[INFO] Scanning for projects...\n[INFO] BUILD SUCCESS\n[INFO] Total time: 1.234 s`;
      case "gradle":    return `Welcome to Gradle 8.5!\nBUILD SUCCESSFUL in 1s\n1 actionable task: 1 executed`;
      case "npm":       return this._npm(args);
      case "yarn":      return `yarn v1.22.21\n$ ${args.join(" ")||"--help"}\nDone in 0.05s.`;
      case "cargo":     return `   Compiling hello v0.1.0\n    Finished dev [unoptimized + debuginfo] target(s) in 1.23s\n     Running \`target/debug/hello\``;
      case "rustc":     return `rustc 1.74.1 (a28077b28 2023-12-04)\nUsage: rustc [OPTIONS] INPUT`;
      case "swift":     return `Swift version 5.9.2 (swift-5.9.2-RELEASE)\nTarget: x86_64-unknown-linux-gnu`;
      case "kotlin":    return `Kotlin Compiler version 1.9.21 (JRE 21.0.1)\nUsage: kotlinc <options> <source files>`;
      case "dotnet":    return `.NET SDK 8.0.100\nUsage: dotnet [sdk-options] [command] [command-options] [arguments]\nSDK commands: new, restore, build, publish, run, test, tool, pack`;

      // ---- Monitoring / Performance ----
      case "glances":   return `Glances v3.4.0\nCPU: 3.2%  | MEM: 45.1%  | SWAP: 12.3% | LOAD: 0.08\nNET: eth0 ↓0 B/s ↑0 B/s\n(Full display requires interactive terminal)`;
      case "atop":      return `ATOP - ${new Date().toLocaleString()}) \nPRC sys 0.03s usr 0.07s  #proc 142\nCPU sys 1%  usr 2%  irq 0%  idle 97%\nMEM tot 8.0G free 2.2G cache 1.8G`;
      case "iotop":     return `Total DISK READ: 0.00 B/s | Total DISK WRITE: 0.00 B/s\n  TID  PRIO  USER    DISK READ  DISK WRITE  IO>  COMMAND\n    1   be/4 root     0.00 B/s   0.00 B/s  0.00% systemd`;
      case "nethogs":   return `NetHogs v0.8.7 - Network traffic per process\nPID    USER    PROGRAM         DEV    SENT      RECEIVED\n1234   kali    firefox         eth0   0.5 KB/s  2.3 KB/s`;
      case "bmon":      return `bmon 4.0 - Bandwidth Monitor\nInterface: eth0\n  RX: 0.00 kbit/s    TX: 0.00 kbit/s\nPeak RX:  0.00 kbit/s  Peak TX: 0.00 kbit/s`;
      case "speedtest":
      case "speedtest-cli": return `Retrieving speedtest.net configuration...\nHosted by Server [10ms latency]\nDownload: 95.42 Mbit/s\nUpload:   45.18 Mbit/s\nPing:     10.24 ms`;
      case "nload":     return `Device eth0:\nIncoming: 0.00 Bit/s  Avg: 0.00 Bit/s  Min: 0.00  Max: 0.00  Ttl: 0.00 MB\nOutgoing: 0.00 Bit/s  Avg: 0.00 Bit/s  Min: 0.00  Max: 0.00  Ttl: 0.00 MB`;
      case "bandwhich": return `bandwhich v0.22.2 - Bandwidth utilization tool\nInterface | Down | Up\neth0      | 0 B  | 0 B\nlo        | 0 B  | 0 B`;
      // mtr handled above

      // ---- CTF / Binary Exploitation ----
      case "pwndbg":    return `pwndbg v2023.12.19 - GDB Enhanced\n(gdb) `;
      case "peda":      return `PEDA v1.3 - Python Exploit Development Assistance\n(gdb) `;
      case "gef":       return `GEF v2024.01 - GDB Enhanced Features\n(gdb) `;
      case "one_gadget":return `0x4527a execve("/bin/sh", rsp+0x30, environ) constraints: [rax] == NULL\n0xf03a4 execve("/bin/sh", rsp+0x50, environ) constraints: [rsp+0x50] == NULL\n0xf1247 execve("/bin/sh", rsp+0x70, environ) constraints: [rsp+0x70] == NULL`;
      case "ropper":    return `[INFO] Load gadgets for section: LOAD\n0x00401013: pop rbp; ret; \n0x00401014: ret; \n0x00401015: pop rdi; ret; \n0x00401017: pop rsi; pop r15; ret;`;
      case "ROPgadget":
      case "ropgadget": return `Gadgets information\n============================================================\n0x0000000000401013 : pop rbp ; ret\n0x0000000000401014 : ret\n0x0000000000401015 : pop rdi ; ret\n0x0000000000401017 : pop rsi ; pop r15 ; ret`;
      case "checksec":  return `[*] '${args[0]||"/bin/bash"}'\n    Arch:     amd64-64-little\n    RELRO:    Full RELRO\n    Stack:    Canary found\n    NX:       NX enabled\n    PIE:      PIE enabled\n    FORTIFY:  Enabled`;
      case "rabin2":    return `[Sections]\n00 .text   0x00001050 0x00000185 -r-x\n01 .data   0x00003010 0x00000010 -rw-\n02 .bss    0x00003020 0x00000008 -rw-`;
      case "cutter":    return `Cutter 2.3.4 - Free and Open Source RE Platform (GUI)\nStart: cutter &\nBased on Rizin (radare2 fork)`;
      case "angr":      return `angr v9.2.90 - Binary analysis framework\npython3: import angr\np = angr.Project("${args[0]||"./binary"}")\nb = p.factory.blank_state(addr=0x401000)`;

      default:
        return `bash: ${cmd}: command not found`;
    }
  }

  // ==================== COMMAND IMPLEMENTATIONS ====================

  _cd(args) {
    const target = args[0] || "~";
    const newPath = this._resolve(target);
    const node = this._node(newPath);
    if (!node) return `bash: cd: ${target}: No such file or directory`;
    if (node.type !== "dir") return `bash: cd: ${target}: Not a directory`;
    this.cwd = newPath;
    return "";
  }

  _ls(args) {
    const showHidden = args.some(a => a.match(/^-[^-]*a/));
    const longFmt    = args.some(a => a.match(/^-[^-]*l/));
    const pathArg    = args.find(a => !a.startsWith("-"));
    const target     = pathArg ? this._resolve(pathArg) : this.cwd;
    const node       = this._node(target);
    if (!node) return `ls: cannot access '${pathArg}': No such file or directory`;
    if (node.type === "file") {
      if (longFmt) return `${node.perms} 1 ${node.owner} ${node.owner} ${String(node.size).padStart(6)} ${node.mtime} ${pathArg}`;
      return pathArg;
    }
    let entries = this._listDir(target);
    if (!showHidden) entries = entries.filter(e => !e.name.startsWith("."));
    if (entries.length === 0) return "";
    if (longFmt) {
      const total = entries.reduce((s,e)=>s+(e.type==="dir"?4096:e.size),0);
      const lines = [`total ${Math.ceil(total/1024)}`];
      entries.forEach(e => {
        const n = e.type==="dir" ? e.name+"/" : e.name;
        lines.push(`${e.perms} 1 ${e.owner} ${e.owner} ${String(e.size).padStart(6)} ${e.mtime} ${n}`);
      });
      return lines.join("\n");
    }
    // colorize dirs
    return entries.map(e => e.type==="dir" ? e.name+"/" : e.name).join("  ");
  }

  _tree(args) {
    const root = args.find(a=>!a.startsWith("-")) || this.cwd;
    const abs = this._resolve(root);
    const lines = [abs];
    const recurse = (dir, prefix) => {
      const entries = this._listDir(dir);
      entries.forEach((e,i) => {
        const last = i===entries.length-1;
        lines.push(prefix+(last?"└── ":"├── ")+e.name+(e.type==="dir"?"/":""));
        if (e.type==="dir") recurse(e.path, prefix+(last?"    ":"│   "));
      });
    };
    recurse(abs,"");
    return lines.join("\n");
  }

  _cat(args, reverse=false) {
    if (!args.length) return `cat: no input (pipe or file expected)`;
    const out = [];
    for (const a of args.filter(a=>!a.startsWith("-"))) {
      const p = this._resolve(a);
      const n = this._node(p);
      if (!n) { out.push(`cat: ${a}: No such file or directory`); continue; }
      if (n.type==="dir") { out.push(`cat: ${a}: Is a directory`); continue; }
      const lines = (n.content||"").split("\n");
      out.push(reverse ? lines.reverse().join("\n") : n.content||"");
    }
    return out.join("\n");
  }

  _head(args) {
    const nIdx = args.indexOf("-n");
    const n = nIdx>=0 ? parseInt(args[nIdx+1])||10 : 10;
    const file = args.find(a=>!a.startsWith("-"));
    if (!file) return `head: missing file operand`;
    const p = this._resolve(file);
    const node = this._node(p);
    if (!node || node.type!=="file") return `head: cannot open '${file}': No such file or directory`;
    return (node.content||"").split("\n").slice(0,n).join("\n");
  }

  _tail(args) {
    const nIdx = args.indexOf("-n");
    const n = nIdx>=0 ? parseInt(args[nIdx+1])||10 : 10;
    const file = args.find(a=>!a.startsWith("-"));
    if (!file) return `tail: missing file operand`;
    const p = this._resolve(file);
    const node = this._node(p);
    if (!node || node.type!=="file") return `tail: cannot open '${file}': No such file or directory`;
    const lines = (node.content||"").split("\n");
    return lines.slice(Math.max(0,lines.length-n)).join("\n");
  }

  _touch(args) {
    const files = args.filter(a=>!a.startsWith("-"));
    if (!files.length) return `touch: missing file operand`;
    for (const f of files) {
      const p = this._resolve(f);
      if (this.fs[p]) {
        this.fs[p].mtime = this._fmtDate(new Date());
      } else {
        this._mkParents(p);
        this.fs[p] = { type:"file", perms:"-rw-r--r--", owner:this.user, size:0, content:"", mtime:this._fmtDate(new Date()) };
      }
    }
    return "";
  }

  _mkdir(args) {
    const parents = args.includes("-p");
    const dirs = args.filter(a=>!a.startsWith("-"));
    if (!dirs.length) return `mkdir: missing operand`;
    const out = [];
    for (const d of dirs) {
      const p = this._resolve(d);
      if (this.fs[p]) { out.push(`mkdir: cannot create directory '${d}': File exists`); continue; }
      const parentPath = p.substring(0, p.lastIndexOf("/")) || "/";
      if (!this.fs[parentPath] && !parents) { out.push(`mkdir: cannot create directory '${d}': No such file or directory`); continue; }
      if (parents) this._mkParents(p+"/dummy");
      this.fs[p] = { type:"dir", perms:"drwxr-xr-x", owner:this.user, size:4096, mtime:this._fmtDate(new Date()) };
    }
    return out.join("\n");
  }

  _rmdir(args) {
    const d = args.find(a=>!a.startsWith("-"));
    if (!d) return `rmdir: missing operand`;
    const p = this._resolve(d);
    const n = this._node(p);
    if (!n) return `rmdir: failed to remove '${d}': No such file or directory`;
    if (n.type!=="dir") return `rmdir: failed to remove '${d}': Not a directory`;
    if (this._listDir(p).length>0) return `rmdir: failed to remove '${d}': Directory not empty`;
    delete this.fs[p];
    return "";
  }

  _rm(args) {
    const recursive = args.some(a=>a.match(/^-[^-]*r/i));
    const force     = args.some(a=>a.match(/^-[^-]*f/));
    const targets   = args.filter(a=>!a.startsWith("-"));
    if (!targets.length) return `rm: missing operand`;
    const out = [];
    for (const t of targets) {
      const p = this._resolve(t);
      const n = this._node(p);
      if (!n) { if(!force) out.push(`rm: cannot remove '${t}': No such file or directory`); continue; }
      if (n.type==="dir") {
        if (!recursive) { out.push(`rm: cannot remove '${t}': Is a directory`); continue; }
        // delete dir and all children
        Object.keys(this.fs).forEach(k => { if(k===p||k.startsWith(p+"/")) delete this.fs[k]; });
      } else {
        delete this.fs[p];
      }
    }
    return out.join("\n");
  }

  _cp(args) {
    const recursive = args.some(a=>a.match(/^-[^-]*r/i));
    const files = args.filter(a=>!a.startsWith("-"));
    if (files.length<2) return `cp: missing destination file operand`;
    const src = this._resolve(files[files.length-2]);
    const dst = this._resolve(files[files.length-1]);
    const srcNode = this._node(src);
    if (!srcNode) return `cp: cannot stat '${files[files.length-2]}': No such file or directory`;
    if (srcNode.type==="dir" && !recursive) return `cp: -r not specified; omitting directory '${files[files.length-2]}'`;
    const dstNode = this._node(dst);
    const finalDst = dstNode?.type==="dir" ? dst+"/"+src.split("/").pop() : dst;
    this._mkParents(finalDst);
    if (srcNode.type==="file") {
      this.fs[finalDst] = { ...srcNode, owner:this.user, mtime:this._fmtDate(new Date()) };
    } else {
      // copy dir recursively
      Object.keys(this.fs).filter(k=>k===src||k.startsWith(src+"/")).forEach(k => {
        const newKey = finalDst + k.slice(src.length);
        this.fs[newKey] = { ...this.fs[k], owner:this.user };
      });
    }
    return "";
  }

  _mv(args) {
    const files = args.filter(a=>!a.startsWith("-"));
    if (files.length<2) return `mv: missing destination file operand`;
    const src = this._resolve(files[files.length-2]);
    const dst = this._resolve(files[files.length-1]);
    const srcNode = this._node(src);
    if (!srcNode) return `mv: cannot stat '${files[files.length-2]}': No such file or directory`;
    const dstNode = this._node(dst);
    const finalDst = dstNode?.type==="dir" ? dst+"/"+src.split("/").pop() : dst;
    this._mkParents(finalDst);
    Object.keys(this.fs).filter(k=>k===src||k.startsWith(src+"/")).forEach(k => {
      const newKey = finalDst + k.slice(src.length);
      this.fs[newKey] = this.fs[k];
      delete this.fs[k];
    });
    return "";
  }

  _ln(args) {
    if (args.length<2) return `ln: missing operand`;
    return `ln: '${args[args.length-1]}': symlink created (simulated)`;
  }

  _find(args) {
    const pathArg = args.find(a=>!a.startsWith("-"))||".";
    const nameIdx = args.indexOf("-name");
    const typeIdx = args.indexOf("-type");
    const pattern = nameIdx>=0 ? args[nameIdx+1] : "*";
    const ftype   = typeIdx>=0 ? args[typeIdx+1] : null;
    const root = this._resolve(pathArg);
    return Object.keys(this.fs)
      .filter(k => {
        if (!k.startsWith(root)) return false;
        const n = this.fs[k];
        if (ftype==="f" && n.type!=="file") return false;
        if (ftype==="d" && n.type!=="dir")  return false;
        if (pattern!=="*") {
          const name = k.split("/").pop();
          const re = new RegExp("^"+pattern.replace(/\*/g,".*").replace(/\?/g,".")+"$");
          if (!re.test(name)) return false;
        }
        return true;
      }).join("\n");
  }

  _locate(args) {
    const q = args[0]||"";
    return Object.keys(this.fs).filter(k=>k.includes(q)).join("\n")||`locate: nothing found for '${q}'`;
  }

  _stat(args) {
    const file = args.find(a=>!a.startsWith("-"));
    if (!file) return `stat: missing operand`;
    const p = this._resolve(file);
    const n = this._node(p);
    if (!n) return `stat: cannot stat '${file}': No such file or directory`;
    return `  File: ${p}\n  Size: ${n.size}\tBlocks: 8\t${n.type==="dir"?"directory":"regular file"}\nAccess: (0644/${n.perms})\tUid: ( 1000/${n.owner})\tGid: ( 1000/${n.owner})\nModify: 2024-06-25 ${n.mtime}`;
  }

  _file(args) {
    const f = args[0];
    if (!f) return `file: missing operand`;
    const p = this._resolve(f);
    const n = this._node(p);
    if (!n) return `${f}: cannot open (No such file or directory)`;
    if (n.type==="dir") return `${f}: directory`;
    if (f.endsWith(".sh")) return `${f}: Bourne-Again shell script, ASCII text executable`;
    if (f.endsWith(".py")) return `${f}: Python script, ASCII text executable`;
    if (f.endsWith(".txt")) return `${f}: ASCII text`;
    if (f.endsWith(".jpg")||f.endsWith(".png")) return `${f}: image data`;
    return `${f}: ASCII text`;
  }

  _du(args) {
    const human = args.includes("-h");
    const target = args.find(a=>!a.startsWith("-"))||this.cwd;
    const p = this._resolve(target);
    const total = Object.keys(this.fs).filter(k=>k.startsWith(p)).reduce((s,k)=>s+(this.fs[k].size||0),0);
    const size = human ? (total>1048576?`${(total/1048576).toFixed(1)}M`:`${(total/1024).toFixed(1)}K`) : total;
    return `${size}\t${p}`;
  }

  _df(args) {
    const human = args.includes("-h");
    if (human) return `Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1        50G   18G   30G  38% /\ntmpfs           3.9G     0  3.9G   0% /dev/shm`;
    return `Filesystem     1K-blocks     Used Available Use% Mounted on\n/dev/sda1       51475068 18350000  30540000  38% /`;
  }

  _wc(args) {
    const file = args.find(a=>!a.startsWith("-"));
    if (!file) return `wc: missing file operand`;
    const p = this._resolve(file);
    const n = this._node(p);
    if (!n||n.type!=="file") return `wc: ${file}: No such file or directory`;
    const content = n.content||"";
    const lines = content.split("\n").length;
    const words = content.split(/\s+/).filter(Boolean).length;
    const chars = content.length;
    if (args.includes("-l")) return `${lines} ${file}`;
    if (args.includes("-w")) return `${words} ${file}`;
    if (args.includes("-c")) return `${chars} ${file}`;
    return `  ${lines}  ${words} ${chars} ${file}`;
  }

  _sort(args) {
    const file = args.find(a=>!a.startsWith("-"));
    if (!file) return `sort: missing file operand`;
    const p = this._resolve(file);
    const n = this._node(p);
    if (!n||n.type!=="file") return `sort: ${file}: No such file or directory`;
    const lines = (n.content||"").split("\n");
    if (args.includes("-r")) lines.reverse();
    else lines.sort();
    if (args.includes("-n")) lines.sort((a,b)=>parseFloat(a)-parseFloat(b));
    return lines.join("\n");
  }

  _uniq(args) {
    const file = args.find(a=>!a.startsWith("-"));
    if (!file) return `uniq: missing file operand`;
    const p = this._resolve(file);
    const n = this._node(p);
    if (!n||n.type!=="file") return `uniq: ${file}: No such file or directory`;
    return [...new Set((n.content||"").split("\n"))].join("\n");
  }

  _diff(args) {
    const [f1,f2] = args.filter(a=>!a.startsWith("-"));
    if (!f1||!f2) return `diff: missing operand`;
    const n1 = this._node(this._resolve(f1));
    const n2 = this._node(this._resolve(f2));
    if (!n1) return `diff: ${f1}: No such file or directory`;
    if (!n2) return `diff: ${f2}: No such file or directory`;
    if (n1.content===n2.content) return ``;
    return `--- ${f1}\n+++ ${f2}\n@@ -1 +1 @@\n-${n1.content?.split("\n")[0]}\n+${n2.content?.split("\n")[0]}`;
  }

  _cut(args) {
    const dIdx = args.indexOf("-d");
    const d = dIdx>=0 ? args[dIdx+1] : "\t";
    const fIdx = args.indexOf("-f");
    const f = fIdx>=0 ? parseInt(args[fIdx+1])-1 : 0;
    const file = args.find(a=>!a.startsWith("-")&&!a.includes(d));
    if (!file) return `cut: missing file operand`;
    const p = this._resolve(file);
    const n = this._node(p);
    if (!n||n.type!=="file") return `cut: ${file}: No such file`;
    return (n.content||"").split("\n").map(l=>l.split(d)[f]||"").join("\n");
  }

  _paste(args) {
    const files = args.filter(a=>!a.startsWith("-"));
    if (!files.length) return `paste: missing file operand`;
    const contents = files.map(f=>{const n=this._node(this._resolve(f));return n?(n.content||"").split("\n"):[];});
    const len = Math.max(...contents.map(c=>c.length));
    return Array.from({length:len},(_,i)=>contents.map(c=>c[i]||"").join("\t")).join("\n");
  }

  _tee(args) {
    const file = args.find(a=>!a.startsWith("-"));
    return file ? `tee: reading from stdin... (pipe to this command)` : ``;
  }

  _shred(args) {
    const file = args.find(a=>!a.startsWith("-"));
    if (!file) return `shred: missing file operand`;
    const p = this._resolve(file);
    if (this.fs[p]) {
      this.fs[p].content = "x".repeat(this.fs[p].size);
      if (!args.includes("-n") && !args.includes("--zero")) delete this.fs[p];
    }
    return `shred: ${file}: pass 1/3 (random)...\nshred: ${file}: pass 2/3 (random)...\nshred: ${file}: pass 3/3 (random)...`;
  }

  _truncate(args) {
    const sIdx = args.indexOf("-s");
    const size = sIdx>=0 ? parseInt(args[sIdx+1])||0 : 0;
    const file = args.find(a=>!a.startsWith("-"));
    if (!file) return `truncate: missing file operand`;
    const p = this._resolve(file);
    if (this.fs[p]) { this.fs[p].content = (this.fs[p].content||"").slice(0,size); this.fs[p].size=size; }
    return "";
  }

  _grep(args) {
    const noArgs = args.filter(a=>!a.startsWith("-"));
    if (noArgs.length<2) return `grep: missing PATTERN or FILE`;
    const pattern = noArgs[0];
    const file = noArgs[1];
    const p = this._resolve(file);
    const n = this._node(p);
    if (!n||n.type!=="file") return `grep: ${file}: No such file or directory`;
    const re = args.includes("-i") ? new RegExp(pattern,"i") : new RegExp(pattern);
    const lines = (n.content||"").split("\n").filter(l=>re.test(l));
    if (args.includes("-c")) return String(lines.length);
    if (args.includes("-l")) return lines.length?file:"";
    return lines.join("\n");
  }

  _sed(args) {
    const expr = args.find(a=>!a.startsWith("-"));
    const file = args.filter(a=>!a.startsWith("-"))[1];
    if (!file||!expr) return `sed: missing operand`;
    const p = this._resolve(file);
    const n = this._node(p);
    if (!n||n.type!=="file") return `sed: ${file}: No such file`;
    const m = expr.match(/^s\/(.*?)\/(.*?)\/(g?)$/);
    if (!m) return `sed: invalid expression`;
    const content = (n.content||"").split("\n").map(l=>m[3]?l.replaceAll(m[1],m[2]):l.replace(m[1],m[2])).join("\n");
    if (args.includes("-i")) { this.fs[p].content=content; return ""; }
    return content;
  }

  _awk(args) {
    const prog = args.find(a=>!a.startsWith("-"));
    const file = args.filter(a=>!a.startsWith("-"))[1];
    if (!prog) return `awk: missing program`;
    if (!file) return `awk: no input files (pipe expected)`;
    const p = this._resolve(file);
    const n = this._node(p);
    if (!n||n.type!=="file") return `awk: ${file}: No such file`;
    const m = prog.match(/\{print \$(\d+)\}/);
    const col = m?parseInt(m[1])-1:0;
    return (n.content||"").split("\n").map(l=>l.split(/\s+/)[col]||"").join("\n");
  }

  _tr(args) {
    if (args.includes("-d")) return `tr: transformation (simulated — use pipe)`;
    return `tr: ${args.join(" ")} (simulated — use pipe)`;
  }

  _echo(args) {
    const n = args.includes("-n");
    const e = args.includes("-e");
    const text = args.filter(a=>a!=="-n"&&a!=="-e").join(" ");
    const out = e ? text.replace(/\\n/g,"\n").replace(/\\t/g,"\t") : text;
    return n ? out : out;
  }

  _printf(args) {
    const fmt = args[0]||"";
    return fmt.replace(/\\n/g,"\n").replace(/\\t/g,"\t").replace(/%s/g,args[1]||"").replace(/%d/g,args[1]||"0");
  }

  _column(args) {
    const file = args.find(a=>!a.startsWith("-"));
    if (!file) return `column: missing file operand`;
    const p = this._resolve(file);
    const n = this._node(p);
    if (!n||n.type!=="file") return `column: ${file}: No such file`;
    return n.content||"";
  }

  _export(args) {
    for (const a of args) {
      const [k,v] = a.split("=");
      if (v!==undefined) this.env[k]=v;
    }
    return "";
  }

  _alias(args) {
    if (!args.length) return Object.entries(this.aliases).map(([k,v])=>`alias ${k}='${v}'`).join("\n");
    const [k,v] = args[0].split("=");
    if (v) this.aliases[k]=v.replace(/^['"]|['"]$/g,"");
    return "";
  }

  _which(cmd) {
    const known = ["ls","cat","grep","find","nmap","python3","bash","sh","wget","curl","nc","ssh","git","vim","nano"];
    if (!cmd) return "";
    if (known.includes(cmd)) return `/usr/bin/${cmd}`;
    const kali = ["nmap","nikto","sqlmap","hydra","john","hashcat","aircrack-ng","msfconsole","dirb","gobuster","wfuzz","ffuf"];
    if (kali.includes(cmd)) return `/usr/bin/${cmd}`;
    return ``;
  }

  _chmod(args) {
    const mode = args.find(a=>!a.startsWith("-")&&!a.match(/^[./~]/));
    const file = args.find(a=>!a.startsWith("-")&&a.match(/^[./~]|^[a-z]/i)&&a!==mode);
    if (!mode||!file) return `chmod: missing operand`;
    const p = this._resolve(file);
    if (!this.fs[p]) return `chmod: cannot access '${file}': No such file or directory`;
    return "";
  }

  _chown(args) {
    if (args.length<2) return `chown: missing operand`;
    return `chown: changing ownership of '${args[1]}': Operation not permitted`;
  }

  _chgrp(args) {
    if (args.length<2) return `chgrp: missing operand`;
    return "";
  }

  _sudo(args) {
    if (!args.length) return `usage: sudo command`;
    const subcmd = args[0];
    // simulate some sudo escalation
    if (subcmd==="su"||subcmd==="-s") return `root@${this.hostname}:/home/user# `;
    const result = this._dispatch(subcmd, args.slice(1), args.join(" "));
    return result;
  }

  _uname(args) {
    if (args.includes("-a")) return `Linux ${this.hostname} 6.1.0-kali5-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.12-1kali2 x86_64 GNU/Linux`;
    if (args.includes("-r")) return `6.1.0-kali5-amd64`;
    if (args.includes("-m")) return `x86_64`;
    return `Linux`;
  }

  _uptime() {
    return ` ${new Date().toLocaleTimeString()} up 3 days,  5:32,  1 user,  load average: 0.08, 0.12, 0.09`;
  }

  _lscpu() {
    return `Architecture:            x86_64\nCPU op-mode(s):          32-bit, 64-bit\nByte Order:              Little Endian\nCPU(s):                  12\nOn-line CPU(s) list:     0-11\nVendor ID:               GenuineIntel\nModel name:              Intel(R) Core(TM) i7-8750H CPU @ 2.20GHz\nCPU MHz:                 2200.000\nL2 cache:                9MiB`;
  }

  _free(args) {
    const h = args.includes("-h");
    if (h) return `               total        used        free      shared  buff/cache   available\nMem:           7.7Gi       3.2Gi       2.1Gi       234Mi       2.4Gi       4.0Gi\nSwap:          2.0Gi       120Mi       1.9Gi`;
    return `               total        used        free      shared  buff/cache   available\nMem:         7869392     3276800     2149232      239616     2443360     4107968\nSwap:        2097148      122880      1974268`;
  }

  _top() {
    return `top - ${new Date().toLocaleTimeString()} up 3 days,  5:32,  1 user,  load average: 0.08, 0.12, 0.09\nTasks: 187 total,   1 running, 186 sleeping,   0 stopped,   0 zombie\n%Cpu(s):  2.1 us,  1.0 sy,  0.0 ni, 96.8 id,  0.0 wa,  0.0 hi,  0.1 si\nMiB Mem :   7681.0 total,   2099.6 free,   3200.0 used,   2381.4 buff/cache\n  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n 1234 ${this.user}   20   0  563648  54672  38400 S   2.0   0.7   0:05.23 bash\n 5678 ${this.user}   20   0 2386700 234560  78900 S   1.5   3.0   1:23.45 firefox`;
  }

  _ps(args) {
    const all = args.some(a=>a.match(/a/));
    const base = `  PID TTY          TIME CMD\n 1234 pts/0    00:00:01 bash\n 9999 pts/0    00:00:00 ps`;
    if (all) return `USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot           1  0.0  0.1 165640  9216 ?        Ss   Jun24   0:02 /sbin/init\n${this.user}       1234  0.0  0.1 563648 54672 pts/0    S    09:00   0:01 bash\nroot         222  0.0  0.0  15744  4096 ?        Ss   Jun24   0:00 /usr/sbin/sshd\n${this.user}       9999  0.0  0.0  21432  3584 pts/0    R+   09:05   0:00 ps aux`;
    return base;
  }

  _pgrep(args) {
    const name = args.find(a=>!a.startsWith("-"));
    if (!name) return `pgrep: missing pattern`;
    const map = {bash:"1234",sshd:"222",python3:"5678",nginx:"80"};
    return map[name] || "";
  }

  _kill(args) {
    const sig = args.find(a=>a.startsWith("-"))||"-15";
    const pid = args.find(a=>!a.startsWith("-"));
    if (!pid) return `kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec`;
    return ``;
  }

  _lsof(args) {
    return `COMMAND   PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME\nbash     1234  ${this.user}  cwd    DIR    8,1     4096    2 ${this.cwd}\nbash     1234  ${this.user}  txt    REG    8,1   895912 1234 /bin/bash\nsshd      222   root    4u  IPv4  12345      0t0  TCP *:ssh (LISTEN)`;
  }

  _ifconfig(args) {
    return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255\n        inet6 fe80::1a2b:3c4d:5e6f:7a8b  prefixlen 64  scopeid 0x20<link>\n        ether 00:1a:2b:3c:4d:5e  txqueuelen 1000  (Ethernet)\n        RX packets 12345  bytes 8765432 (8.3 MiB)\n        TX packets 6789  bytes 4321098 (4.1 MiB)\n\nlo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n        inet 127.0.0.1  netmask 255.0.0.0\n        inet6 ::1  prefixlen 128  scopeid 0x10<host>\n        loop  txqueuelen 1000  (Local Loopback)`;
  }

  _ip(args) {
    const sub = args[0];
    if (sub==="addr"||sub==="a") return this._ifconfig([]);
    if (sub==="route"||sub==="r") return this._route([]);
    if (sub==="link"||sub==="l") return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP\n    link/ether 00:1a:2b:3c:4d:5e brd ff:ff:ff:ff:ff:ff`;
    return this._ifconfig([]);
  }

  _iwconfig() {
    return `wlan0     IEEE 802.11  ESSID:"CyberLab-5G"\n          Mode:Managed  Frequency:5.18 GHz  Access Point: AA:BB:CC:DD:EE:FF\n          Bit Rate=300 Mb/s   Tx-Power=20 dBm\n          Link Quality=70/70  Signal level=-30 dBm`;
  }

  _ping(args) {
    const host = args.find(a=>!a.startsWith("-"))||"";
    if (!host) return `ping: missing host operand`;
    const c = parseInt(args[args.indexOf("-c")+1])||4;
    const lines = [`PING ${host} (192.168.1.1) 56(84) bytes of data.`];
    for (let i=1;i<=Math.min(c,4);i++) lines.push(`64 bytes from ${host}: icmp_seq=${i} ttl=64 time=${(10+Math.random()*5).toFixed(1)} ms`);
    lines.push(`\n--- ${host} ping statistics ---\n${c} packets transmitted, ${c} received, 0% packet loss`);
    return lines.join("\n");
  }

  _traceroute(args) {
    const host = args.find(a=>!a.startsWith("-"))||"target";
    return `traceroute to ${host}, 30 hops max\n 1  192.168.1.1  1.234 ms  1.100 ms  0.998 ms\n 2  10.0.0.1     5.432 ms  4.987 ms  5.123 ms\n 3  172.16.0.1   8.765 ms  9.001 ms  8.543 ms\n 4  ${host}      12.345 ms  11.987 ms  12.001 ms`;
  }

  _netstat(args) {
    return `Active Internet connections (only servers)\nProto Recv-Q Send-Q Local Address           Foreign Address         State\ntcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN\ntcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN\ntcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN\ntcp6       0      0 :::22                   :::*                    LISTEN\nudp        0      0 0.0.0.0:68              0.0.0.0:*`;
  }

  _ss(args) {
    return `Netid  State   Recv-Q  Send-Q   Local Address:Port     Peer Address:Port\ntcp    LISTEN  0       128          0.0.0.0:22            0.0.0.0:*\ntcp    LISTEN  0       128          0.0.0.0:80            0.0.0.0:*\ntcp    ESTAB   0       0      192.168.1.100:22      192.168.1.5:54321`;
  }

  _nmap(args) {
    const target = args.find(a=>!a.startsWith("-"))||"127.0.0.1";
    const sV = args.includes("-sV");
    const sC = args.includes("-sC");
    const O  = args.includes("-O");
    let out = `Starting Nmap 7.94 ( https://nmap.org ) at ${new Date().toLocaleString()}\nNmap scan report for ${target}\nHost is up (0.0012s latency).\n\nPORT     STATE  SERVICE${sV?" VERSION":""}\n22/tcp   open   ssh${sV?"     OpenSSH 9.0p1 Ubuntu 1ubuntu8.5":""}\n80/tcp   open   http${sV?"    Apache httpd 2.4.56":""}\n443/tcp  open   https${sV?"   Apache httpd 2.4.56":""}\n8080/tcp open   http-proxy${sV?" Squid http proxy 5.7":""}`;
    if (O) out += `\nDevice type: general purpose\nRunning: Linux 5.X|6.X\nOS details: Linux 5.4 - 6.1`;
    if (sC) out += `\n|   ssh-hostkey:\n|     3072 ab:cd:ef:01:23:45:67:89:00 (RSA)\n|_    256 12:34:56:78:90:ab:cd:ef (ECDSA)`;
    out += `\n\nNmap done: 1 IP address (1 host up) scanned in 2.34 seconds`;
    return out;
  }

  _curl(args) {
    const url = args.find(a=>!a.startsWith("-"))||"";
    if (!url) return `curl: no URL specified`;
    if (args.includes("-I")||args.includes("--head")) return `HTTP/1.1 200 OK\nDate: ${new Date().toUTCString()}\nServer: Apache/2.4.56\nContent-Type: text/html\nContent-Length: 1234`;
    return `curl: (7) Failed to connect to ${url}: Network is simulated\n(Hint: in real Kali this would fetch ${url})`;
  }

  _wget(args) {
    const url = args.find(a=>!a.startsWith("-"))||"";
    if (!url) return `wget: no URL specified`;
    return `--${new Date().toLocaleTimeString()}-- ${url}\nResolving ${url}... (simulated)\nConnecting to ${url}|93.184.216.34|:80... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: 1234 [text/html]\nSaving to: 'index.html'\n\nindex.html  100%[===================>]   1.21K  --.-KB/s  in 0s`;
  }

  _nslookup(args) {
    const domain = args[0]||"example.com";
    return `Server:\t\t8.8.8.8\nAddress:\t8.8.8.8#53\n\nNon-authoritative answer:\nName:\t${domain}\nAddress: 93.184.216.34`;
  }

  _dig(args) {
    const domain = args.find(a=>!a.startsWith("-")&&!a.startsWith("@"))||"example.com";
    return `; <<>> DiG 9.18.1 <<>> ${domain}\n;; QUESTION SECTION:\n;${domain}.\t\tIN\tA\n\n;; ANSWER SECTION:\n${domain}.\t\t300\tIN\tA\t93.184.216.34\n\n;; Query time: 12 msec\n;; SERVER: 8.8.8.8#53(8.8.8.8)`;
  }

  _host(args) {
    const domain = args[0]||"example.com";
    return `${domain} has address 93.184.216.34\n${domain} has IPv6 address 2606:2800:220:1:248:1893:25c8:1946\n${domain} mail is handled by 0 .`;
  }

  _arp(args) {
    return `Address                  HWtype  HWaddress           Flags Mask     Iface\n192.168.1.1              ether   aa:bb:cc:dd:ee:ff   C               eth0\n192.168.1.5              ether   11:22:33:44:55:66   C               eth0`;
  }

  _route(args) {
    return `Kernel IP routing table\nDestination     Gateway         Genmask         Flags Metric Ref    Use Iface\n0.0.0.0         192.168.1.1     0.0.0.0         UG    100    0        0 eth0\n192.168.1.0     0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
  }

  _nc(args) {
    const l = args.includes("-l");
    const host = args.find(a=>!a.startsWith("-"));
    const port = args[args.indexOf(host)+1]||args.find(a=>parseInt(a)>0);
    if (l) return `Ncat: Listening on 0.0.0.0:${port||4444} (simulated)`;
    return `Ncat: Connection to ${host} ${port||80} port [tcp/*] failed: Connection refused`;
  }

  _tcpdump(args) {
    const iface = args[args.indexOf("-i")+1]||"eth0";
    return `tcpdump: verbose output suppressed, use -v[v]... for full protocol decode\nlistening on ${iface}, link-type EN10MB (Ethernet), snapshot length 262144 bytes\n14:32:01.123456 IP 192.168.1.5.54321 > 192.168.1.100.22: Flags [S], seq 1234567890, win 64240, length 0\n14:32:01.123789 IP 192.168.1.100.22 > 192.168.1.5.54321: Flags [S.], seq 987654321, ack 1234567891, win 65160, length 0\n^C\n2 packets captured\n2 packets received by filter\n0 packets dropped by kernel`;
  }

  _tshark(args) {
    return `  1   0.000000 192.168.1.5 → 192.168.1.100 TCP 74 54321 → 22 [SYN]\n  2   0.000234 192.168.1.100 → 192.168.1.5 TCP 74 22 → 54321 [SYN, ACK]`;
  }

  _whois(args) {
    const domain = args[0]||"example.com";
    return `Domain Name: ${domain.toUpperCase()}\nRegistry Domain ID: 2336799_DOMAIN_COM-VRSN\nRegistrar: RESERVED-Internet Assigned Numbers Authority\nCreation Date: 1995-08-14T04:00:00Z\nName Server: A.IANA-SERVERS.NET\nName Server: B.IANA-SERVERS.NET\nDNSSEC: signedDelegation`;
  }

  _iptables(args) {
    if (args.includes("-L")) return `Chain INPUT (policy ACCEPT)\ntarget     prot opt source               destination\nACCEPT     all  --  anywhere             anywhere             state RELATED,ESTABLISHED\nDROP       all  --  anywhere             anywhere\n\nChain FORWARD (policy DROP)\nChain OUTPUT (policy ACCEPT)`;
    return `iptables: ${args.join(" ")} (simulated)`;
  }

  _ufw(args) {
    if (args[0]==="status") return `Status: active\n\nTo                         Action      From\n--                         ------      ----\n22/tcp                     ALLOW       Anywhere\n80/tcp                     ALLOW       Anywhere\n443/tcp                    ALLOW       Anywhere`;
    return `ufw: ${args.join(" ")} (simulated)`;
  }

  // ---- Security Tools ----
  _nikto(args) {
    const host = args[args.indexOf("-h")+1]||args.find(a=>!a.startsWith("-"))||"target";
    return `- Nikto v2.1.6\n---------------------------------------------------------------------------\n+ Target IP:          192.168.1.100\n+ Target Hostname:    ${host}\n+ Target Port:        80\n---------------------------------------------------------------------------\n+ Server: Apache/2.4.56 (Ubuntu)\n+ /admin/: Admin page found (requires authentication)\n+ OSVDB-3233: /icons/README: Apache default file found.\n+ /phpinfo.php: Output from the phpinfo() function was found.\n+ 7 items checked: 3 error(s) and 1 item(s) reported on remote host\n+ End Time: ${new Date().toLocaleString()} (12 seconds)`;
  }

  _sqlmap(args) {
    const url = args[args.indexOf("-u")+1]||args.find(a=>!a.startsWith("-"))||"http://target/page.php?id=1";
    return `        ___\n       __H__\n ___ ___[']_____ ___ ___  {1.7.10#stable}\n|_ -| . [']     | .'| . |\n|___|_  [']_|_|_|__,|  _|\n      |_|              |_|   https://sqlmap.org\n\n[*] starting @ ${new Date().toLocaleTimeString()}\n[INFO] testing connection to the target URL: ${url}\n[INFO] testing if the target URL content is stable\n[INFO] target URL content is stable\n[INFO] testing if GET parameter 'id' is dynamic\n[INFO] GET parameter 'id' appears to be dynamic\n[INFO] heuristic (basic) test shows that GET parameter 'id' might be injectable (possible DBMS: 'MySQL')\n[CRITICAL] all tested parameters do not appear to be injectable`;
  }

  _hydra(args) {
    const target = args.find(a=>!a.startsWith("-")&&!a.includes("/"))||"192.168.1.100";
    const service = args[args.length-1]||"ssh";
    return `Hydra v9.5 (c) 2023 by van Hauser/THC & David Maciejak\n[INFO] Attacking ${target} with ${service} service\n[DATA] max 16 tasks per 1 server, overall 16 tasks, 1000 login tries (l:10/p:100)\n[DATA] attacking ${service}://${target}:22/\n[ERROR] target ${target} returned ERROR: could not connect\n1 of 1 target completed, 0 valid passwords found`;
  }

  _john(args) {
    const file = args.find(a=>!a.startsWith("-"))||"hashes.txt";
    return `Using default input encoding: UTF-8\nLoaded 1 password hash (MD5 [MD5 128/128 SSE4.1 4x3])\nWill run 4 OpenMP threads\nPressing any key interrupts the run...\n(Simulated) Found password: password123`;
  }

  _hashcat(args) {
    const mode = args[args.indexOf("-m")+1]||"0";
    return `hashcat (v6.2.6) starting...\n\nOpenCL API (OpenCL 3.0 PoCL) - Platform #1 [The pocl project]\n*Mode: ${mode} (MD5)\n\nDictionary cache built:\n* Filename..: /usr/share/wordlists/rockyou.txt\n* Passwords.: 14344385\n\n(Simulated) Cracked 1 hash in 0.1s`;
  }

  _airmon(args) {
    const sub = args[0]||"check";
    if (sub==="start") return `PHY\tInterface\tDriver\t\tChipset\nphy0\twlan0\t\tath9k_htc\tAtheros\n\n(mac80211 monitor mode already enabled for phy0 on [phy0]wlan0mon)`;
    return `Found 2 processes that could cause trouble.\nKill them using 'airmon-ng check kill'.`;
  }

  _airodump(args) {
    return ` CH  4 ][ Elapsed: 6 s ][ 2024-06-25 14:30\n\n BSSID              PWR  Beacons    #Data, #/s  CH   MB   ENC CIPHER  AUTH ESSID\n\n AA:BB:CC:DD:EE:FF  -42       12        0    0   6  130   WPA2 CCMP   PSK  CyberLab-5G\n 11:22:33:44:55:66  -65        8        0    0  11   54   WPA2 CCMP   PSK  HomeNetwork\n\n BSSID              STATION            PWR   Rate    Lost    Frames  Notes  Probes\n AA:BB:CC:DD:EE:FF  FF:EE:DD:CC:BB:AA  -50    1e- 0     0        8`;
  }

  _aircrack(args) {
    return `Aircrack-ng 1.7\n\n[00:00:01] 1024 keys tested (2048.00 k/s)\n\n                               Current passphrase: password123\n\nMaster Key     : AB CD EF 01 23 45 67 89 00 AB CD EF 01 23 45 67\nKEY FOUND! [ password123 ]`;
  }

  _msf(args) {
    return `       =[ metasploit v6.3.45-dev                          ]\n+ -- --=[ 2359 exploits - 1229 auxiliary - 413 post       ]\n+ -- --=[ 953 payloads - 45 encoders - 11 nops            ]\n+ -- --=[ 9 evasion                                       ]\n\nmsf6 > (type 'help' for commands — simulated console)`;
  }

  _msfvenom(args) {
    const p = args[args.indexOf("-p")+1]||"windows/meterpreter/reverse_tcp";
    const o = args[args.indexOf("-o")+1]||"payload.exe";
    return `[-] No platform was selected, choosing Msf::Module::Platform::Windows from the payload\n[-] No arch selected, selecting arch: x86 from the payload\nNo encoder specified, outputting raw payload\nPayload size: 354 bytes\nFinal size of exe file: 73802 bytes\nSaved as: ${o}`;
  }

  _dirb(args) {
    const url = args.find(a=>!a.startsWith("-"))||"http://target";
    return `-----------------\nDIRB v2.22\nBy The Dark Raver\n-----------------\n\nSTART_TIME: ${new Date().toLocaleString()}\nURL_BASE: ${url}/\nWORDLIST_FILES: /usr/share/dirb/wordlists/common.txt\n\n-----------------\n\n+ ${url}/admin (CODE:302|SIZE:0)\n+ ${url}/index.php (CODE:200|SIZE:5432)\n+ ${url}/login (CODE:200|SIZE:1234)\n+ ${url}/robots.txt (CODE:200|SIZE:42)\n\n-----------------\nEND_TIME: ${new Date().toLocaleString()}\nDOWNLOADED: 4612 - FOUND: 4`;
  }

  _gobuster(args) {
    const url = args[args.indexOf("-u")+1]||"http://target";
    return `===============================================================\nGobuster v3.6\nby OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)\n===============================================================\n[+] Url:       ${url}\n[+] Mode:      dir\n[+] Wordlist:  /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt\n===============================================================\n/admin        (Status: 301) [Size: 313]\n/login        (Status: 200) [Size: 1234]\n/api          (Status: 200) [Size: 567]\n/backup       (Status: 403) [Size: 276]\n===============================================================`;
  }

  _ffuf(args) {
    const url = args[args.indexOf("-u")+1]||"http://target/FUZZ";
    return `\n        /'___\\  /'___\\           /'___\\\n       /\\ \\__/ /\\ \\__/  __  __  /\\ \\__/\n       \\ \\ ,__\\\\ \\ ,__\\/\\ \\/\\ \\ \\ \\ ,__\\\n        \\ \\ \\_/ \\ \\ \\_/\\ \\ \\_\\ \\ \\ \\ \\_/\n         \\ \\_\\   \\ \\_\\  \\ \\____/  \\ \\_\\\n          \\/_/    \\/_/   \\/___/    \\/_/\n\n       v2.1.0\n________________________________________________\n\n admin               [Status: 301, Size: 313]\n login               [Status: 200, Size: 1234]\n api                 [Status: 200, Size: 567]`;
  }

  _whatweb(args) {
    const target = args.find(a=>!a.startsWith("-"))||"http://target";
    return `${target} [200 OK] Apache[2.4.56], Bootstrap[4.6.0], Country[UNITED STATES][US], HTML5, HTTPServer[Ubuntu Linux][Apache/2.4.56 (Ubuntu)], IP[93.184.216.34], JQuery[3.6.0], PHP[8.1.27], Title[Welcome], X-Powered-By[PHP/8.1.27]`;
  }

  _wpscan(args) {
    const url = args[args.indexOf("--url")+1]||args.find(a=>!a.startsWith("-"))||"http://target";
    return `_______________________________________________________________\n         __          _______   _____\n         \\ \\        / /  __ \\ / ____|\n          \\ \\  /\\  / /| |__) | (___   ___  __ _ _ __ ®\n           \\ \\/  \\/ / |  ___/ \\___ \\ / __|/ _' | '_ \\\n            \\  /\\  /  | |     ____) | (__| (_| | | | |\n             \\/  \\/   |_|    |_____/ \\___|\\__,_|_| |_|\n\n WordPress Security Scanner by the WPScan Team\n\n[+] URL: ${url}\n[+] WordPress version: 6.4.2\n[+] WordPress theme: twentytwentyfour\n[+] 3 vulnerabilities found:\n  - CVE-2024-1234: XSS in comments (Medium)\n  - CVE-2024-5678: SQL injection in WooCommerce (High)\n  - CVE-2024-9012: RCE via file upload (Critical)`;
  }

  _enum4linux(args) {
    const target = args.find(a=>!a.startsWith("-"))||"192.168.1.100";
    return `Starting enum4linux v0.9.1 against ${target}\n========================================\n|    Target Information    |\n========================================\nTarget ........... ${target}\nRID Range ........ 500-550,1000-1050\nUsername ......... ''\nPassword ......... ''\n\n========================================\n|    OS information    |\n========================================\nUse of uninitialized value in string at ./enum4linux.pl line 434.\nUse of uninitialized value in string at ./enum4linux.pl line 434.\n[+] Got OS info for ${target} from smbclient: \n\n========================================\n|    Users on ${target}   |\n========================================\nindex: 0x1 RID: 0x3e8 acb: 0x00000010 Account: administrator  Name: (null)  Desc: (null)\n\nenum4linux complete on ${new Date().toLocaleString()}`;
  }

  _smbclient(args) {
    const host = args.find(a=>!a.startsWith("-"))||"//target/share";
    return `Try "help" to get a list of possible commands.\nsmb: \\> `;
  }

  _cme(args) {
    const proto = args[0]||"smb";
    const target = args[1]||"192.168.1.0/24";
    return `SMB         ${target}   445    WIN-TARGET       [*] Windows 10.0 Build 19041 x64 (name:WIN-TARGET) (domain:WORKGROUP) (signing:False) (SMBv1:False)\nSMB         ${target}   445    WIN-TARGET       [+] WORKGROUP\\Administrator:password123 (Pwn3d!)`;
  }

  _searchsploit(args) {
    const q = args.join(" ");
    return `--------------------------------------------------------------------------------- ---------------------------------\n Exploit Title                                                                   |  Path\n--------------------------------------------------------------------------------- ---------------------------------\nApache 2.4.50 - Remote Code Execution (RCE) (2)                                 | multiple/webapps/50406.py\nApache 2.4.49 - Path Traversal & Remote Code Execution (RCE)                    | multiple/webapps/50383.py\nApache 2.4.x - Buffer Overflow                                                  | linux/dos/51662.py\n--------------------------------------------------------------------------------- ---------------------------------`;
  }

  // ---- Crypto ----
  _base64(args) {
    const decode = args.includes("-d");
    const file = args.find(a=>!a.startsWith("-"));
    if (file) {
      const p = this._resolve(file);
      const n = this._node(p);
      if (!n||n.type!=="file") return `base64: ${file}: No such file`;
      try {
        return decode ? atob(n.content||"") : btoa(n.content||"");
      } catch(e) { return `base64: invalid input`; }
    }
    return decode ? `(decoded content)` : `KHNpbXVsYXRlZCBiYXNlNjQgZW5jb2RpbmcpCg==`;
  }

  _xxd(args) {
    const file = args.find(a=>!a.startsWith("-"));
    if (!file) return `xxd: missing filename`;
    const p = this._resolve(file);
    const n = this._node(p);
    if (!n||n.type!=="file") return `xxd: ${file}: No such file`;
    const content = n.content||"";
    const lines = [];
    for (let i=0;i<Math.min(content.length,64);i+=16) {
      const chunk = content.slice(i,i+16);
      const hex = chunk.split("").map(c=>c.charCodeAt(0).toString(16).padStart(2,"0")).join(" ");
      const asc = chunk.replace(/[^\x20-\x7e]/g,".");
      lines.push(`${i.toString(16).padStart(8,"0")}: ${hex.padEnd(47)}  ${asc}`);
    }
    return lines.join("\n");
  }

  _od(args) {
    return `0000000  072150  073557  072040  063147  065156  072141  061564  060505\n0000020  074440  060562  060573  066551  072157  006564\n0000036`;
  }

  _openssl(args) {
    const sub = args[0];
    if (sub==="genrsa") return `Generating RSA private key, 2048 bit long modulus\n........+++\n.+++\ne is 65537 (0x010001)`;
    if (sub==="s_client") return `CONNECTED(00000003)\ndepth=2 O = Digital Signature Trust Co., CN = DST Root CA X3\n---\nSSL-Session:\n    Protocol  : TLSv1.3\n    Cipher    : TLS_AES_256_GCM_SHA384`;
    if (sub==="enc") return `enter aes-256-cbc encryption password:\n(simulated encryption)`;
    if (sub==="dgst") return `SHA256(input)= e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`;
    return `OpenSSL 3.0.11 19 Sep 2023 (simulated)\nusage: openssl command [ options ]`;
  }

  _gpg(args) {
    const sub = args[0];
    if (sub==="--gen-key") return `gpg (GnuPG) 2.2.27\nNote: Use "gpg --full-generate-key" for a full featured key generation dialog.`;
    if (sub==="--list-keys") return `pub   rsa4096 2024-06-25 [SC]\n      ABCDEF01234567890ABCDEF01234567890ABCDEF\nuid           [ultimate] Kali User <kali@cyber-academy>\nsub   rsa4096 2024-06-25 [E]`;
    return `gpg: ${args.join(" ")} (simulated)`;
  }

  _hash(alg, args) {
    const file = args.find(a=>!a.startsWith("-"));
    if (!file) return `${alg}sum: missing file operand`;
    // fake hash output
    const fakeHashes = {
      md5:"5f4dcc3b5aa765d61d8327deb882cf99",
      sha1:"5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8",
      sha256:"ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f",
      sha512:"b109f3bbbc244eb82441917ed06d618b9008dd09b3befd1b5e07394c706a8bb980b1d7785e5976ec049b46df5f1326af5a2ea6d103fd07c95385ffab0cacbc86"
    };
    return `${fakeHashes[alg]||"a"*64}  ${file}`;
  }

  _strings(args) {
    const file = args.find(a=>!a.startsWith("-"));
    if (!file) return `strings: missing file operand`;
    const p = this._resolve(file);
    const n = this._node(p);
    if (!n||n.type!=="file") return `strings: ${file}: No such file`;
    return (n.content||"").split("\n").filter(l=>l.trim().length>3).join("\n");
  }

  _binwalk(args) {
    const file = args.find(a=>!a.startsWith("-"));
    if (!file) return `binwalk: missing file operand`;
    return `DECIMAL       HEXADECIMAL     DESCRIPTION\n--------------------------------------------------------------------------------\n0             0x0             ELF, 64-bit LSB executable, AMD x86-64\n1024          0x400           gzip compressed data, last modified: 2024-06-25\n5678          0x162E          PNG image, 200 x 150`;
  }

  _exiftool(args) {
    const file = args.find(a=>!a.startsWith("-"));
    if (!file) return `exiftool: missing file operand`;
    return `ExifTool Version Number         : 12.60\nFile Name                       : ${file}\nFile Size                       : 1024 bytes\nFile Modification Date/Time     : 2024:06:25\nFile Type                       : JPEG\nMIME Type                       : image/jpeg\nGPS Latitude                    : 30.0444 N\nGPS Longitude                   : 31.2357 E\nCamera Model Name               : iPhone 14 Pro\nSoftware                        : 17.2`;
  }

  // ---- Archives ----
  _tar(args) {
    const file = args.find(a=>!a.startsWith("-")&&a.endsWith(".tar")||a.endsWith(".tar.gz")||a.endsWith(".tgz")||a.endsWith(".tar.bz2"));
    if (args.includes("-c")||args.includes("c")) return `tar: creating archive ${file||"archive.tar"}`;
    if (args.includes("-x")||args.includes("x")) return `tar: extracting ${file||"archive.tar"}\n./file1.txt\n./file2.txt`;
    if (args.includes("-t")||args.includes("t")) return `./file1.txt\n./file2.txt\n./dir/`;
    return `tar: ${args.join(" ")}`;
  }

  _zip(args) {
    const out = args.find(a=>a.endsWith(".zip"))||"archive.zip";
    return `  adding: ${args.filter(a=>!a.startsWith("-")&&!a.endsWith(".zip")).join(" ")} (deflated 50%)\narchive: ${out}`;
  }

  _unzip(args) {
    const file = args.find(a=>!a.startsWith("-"))||"archive.zip";
    return `Archive:  ${file}\n  inflating: file1.txt\n  inflating: file2.txt`;
  }

  // ---- Package mgmt ----
  _apt(args) {
    const sub = args[0];
    if (sub==="update") return `Hit:1 http://kali.download/kali kali-rolling InRelease\nGet:2 http://kali.download/kali kali-rolling/main amd64 Packages [20.1 MB]\nFetched 20.1 MB in 3s\nReading package lists... Done`;
    if (sub==="install") return `Reading package lists...\nBuilding dependency tree...\nThe following NEW packages will be installed:\n  ${args.slice(1).join(" ")}\n0 upgraded, ${args.length-1} newly installed, 0 to remove\n(Simulated install)`;
    if (sub==="search") return `Sorting... Done\nFull Text Search... Done\n${args[1]}/kali-rolling ${args[1]} amd64\n  Security tool`;
    if (sub==="list"&&args.includes("--installed")) return `nmap/kali-rolling 7.94+git20230807-1 amd64 [installed]\nmetasploit-framework/kali-rolling 6.3.45 amd64 [installed]\nwireshark/kali-rolling 4.0.6 amd64 [installed]`;
    return `apt: ${args.join(" ")} (simulated)`;
  }

  _dpkg(args) {
    if (args.includes("-l")) return `Desired=Unknown/Install/Remove/Purge/Hold\nStatus=Not/Inst/Conf-files/Unpacked/halF-conf/Half-inst/trig-aWait/Trig-pend\n||/ Name                  Version          Architecture Description\n+++-=====================-================-============-===========================================================\nii  nmap                  7.94             amd64        network mapper`;
    return `dpkg: ${args.join(" ")} (simulated)`;
  }

  _pip(args) {
    const sub = args[0];
    if (sub==="install") return `Collecting ${args[1]}\n  Downloading ${args[1]}-1.0.0-py3-none-any.whl (10 kB)\nSuccessfully installed ${args[1]}-1.0.0`;
    if (sub==="list") return `Package    Version\n---------- -------\nnumpy      1.24.3\nrequests   2.31.0\npwntools   4.11.0\nscapy      2.5.0`;
    return `pip3 ${args.join(" ")} (simulated)`;
  }

  // ---- Git ----
  _git(args) {
    const sub = args[0];
    switch(sub) {
      case "init":   return `Initialized empty Git repository in ${this.cwd}/.git/`;
      case "clone":  return `Cloning into '${(args[1]||"repo").split("/").pop().replace(".git","")}'...\nremote: Counting objects: 100, done.\nReceiving objects: 100% (100/100), done.`;
      case "status": return `On branch main\nYour branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean`;
      case "log":    return `commit a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0 (HEAD -> main, origin/main)\nAuthor: ${this.user} <${this.user}@${this.hostname}>\nDate:   ${new Date().toDateString()}\n\n    Initial commit`;
      case "add":    return ``;
      case "commit": return `[main (root-commit) a1b2c3d] ${args.slice(2).join(" ")||"update"}\n 1 file changed, 1 insertion(+)`;
      case "push":   return `Enumerating objects: 3, done.\nTo https://github.com/user/repo.git\n   a1b2c3d..f4e5d6c  main -> main`;
      case "pull":   return `Already up to date.`;
      case "branch": return `* main\n  develop\n  feature/exploit`;
      case "diff":   return `diff --git a/notes.txt b/notes.txt\nindex abc1234..def5678 100644\n--- a/notes.txt\n+++ b/notes.txt\n@@ -1,3 +1,4 @@\n+New line added`;
      case "stash":  return `Saved working directory and index state WIP on main: a1b2c3d Initial commit`;
      default:       return `git: '${sub}' is not a git command. See 'git --help'.`;
    }
  }

  // ---- Python ----
  _python(args) {
    if (args.includes("-c")) {
      const code = args[args.indexOf("-c")+1]||"";
      if (code.includes("print")) {
        const m = code.match(/print\(['"](.+)['"]\)/);
        return m ? m[1] : "(python output)";
      }
      return "(python output)";
    }
    if (args[0]) return `python3: can't open file '${args[0]}': [Errno 2] No such file or directory`;
    return `Python 3.11.6 (main, Oct 3 2023, 17:16:34)\n[GCC 13.2.0] on linux\nType "help", "copyright", "credits" or "license" for more information.\n>>>`;
  }

  _gcc(args) {
    const out = args[args.indexOf("-o")+1]||"a.out";
    const src = args.find(a=>a.endsWith(".c")||a.endsWith(".cpp"));
    if (!src) return `gcc: fatal error: no input files`;
    return `(compiled ${src} → ${out})`;
  }

  _ldd(args) {
    return `\tlinux-vdso.so.1 (0x00007fffd9abc000)\n\tlibc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007f123abc0000)\n\t/lib64/ld-linux-x86-64.so.2 (0x00007f456def0000)`;
  }

  _readelf(args) {
    return `ELF Header:\n  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00\n  Class:                             ELF64\n  Data:                              2's complement, little endian\n  Type:                              EXEC (Executable file)\n  Machine:                           Advanced Micro Devices X86-64`;
  }

  // ---- System services ----
  _systemctl(args) {
    const sub = args[0];
    const svc = args[1]||"";
    if (sub==="status") return `● ${svc}.service - ${svc}\n   Loaded: loaded (/lib/systemd/system/${svc}.service)\n   Active: active (running) since ${new Date().toLocaleString()}; 3 days ago\n Main PID: 1234 (${svc})`;
    if (sub==="start"||sub==="stop"||sub==="restart"||sub==="enable"||sub==="disable") return ``;
    if (sub==="list-units") return `UNIT                     LOAD   ACTIVE SUB     DESCRIPTION\nssh.service              loaded active running OpenBSD Secure Shell server\ncron.service             loaded active running Regular background program processing daemon\nnetworkd.service         loaded active running Network Configuration\n\n3 loaded units listed.`;
    return `systemctl: ${args.join(" ")} (simulated)`;
  }

  _service(args) {
    const svc = args[0]||"";
    const sub = args[1]||"";
    return `[ ok ] ${sub} ${svc}.`;
  }

  _journalctl(args) {
    return `-- Logs begin at ${new Date().toLocaleString()} --\nJun 25 09:00:01 ${this.hostname} systemd[1]: Started OpenSSH Server Daemon.\nJun 25 09:01:23 ${this.hostname} sshd[1022]: Accepted publickey for ${this.user} from 192.168.1.5\nJun 25 10:30:00 ${this.hostname} cron[900]: (root) CMD (cd / && run-parts --report /etc/cron.hourly)`;
  }

  _crontab(args) {
    if (args.includes("-l")) return `# Edit this file to introduce tasks to be run by cron.\n# m h  dom mon dow   command\n0 * * * * /home/user/scripts/scan.sh\n0 2 * * * /usr/bin/apt-get update -q`;
    if (args.includes("-e")) return `crontab: opening editor...`;
    return `crontab: ${args.join(" ")}`;
  }

  _mount() {
    return `/dev/sda1 on / type ext4 (rw,relatime,errors=remount-ro)\ntmpfs on /dev/shm type tmpfs (rw,nosuid,nodev)\n/dev/sdb1 on /media/usb type vfat (rw,nosuid,nodev,relatime)`;
  }

  // ---- Misc ----
  _history() {
    return this.history.map((h,i)=>`  ${String(i+1).padStart(4)}  ${h}`).join("\n");
  }

  _man(cmd) {
    if (!cmd) return `What manual page do you want?`;
    const descs = {
      nmap:"network exploration tool and security scanner",
      grep:"print lines that match patterns",
      ls:"list directory contents",
      cat:"concatenate files and print on the standard output",
      chmod:"change file mode bits",
      find:"search for files in a directory hierarchy",
      ssh:"OpenSSH remote login client",
      netstat:"print network connections, routing tables, interface statistics",
    };
    return `${cmd.toUpperCase()}(1)                  User Commands                 ${cmd.toUpperCase()}(1)\n\nNAME\n       ${cmd} - ${descs[cmd]||"a command-line utility"}\n\nSYNOPSIS\n       ${cmd} [OPTION]... [FILE]...\n\nDESCRIPTION\n       See online documentation for full manual page.\n\nEXAMPLES\n       ${cmd} --help\n\n(Press q to exit — simulated)`;
  }

  _help() {
    return `Kali Linux Terminal — 200+ commands available

━━━ FILE SYSTEM ━━━
ls, cd, pwd, cat, touch, mkdir, rmdir, rm, cp, mv, find, locate, stat, file, du, df, tree, ln, tac, shred, truncate

━━━ TEXT PROCESSING ━━━
grep, sed, awk, sort, uniq, wc, head, tail, cut, paste, tr, echo, diff, column, jq, yq, xmllint, csvkit, jc, fx, miller, parallel, pv, lolcat, toilet, boxes

━━━ PERMISSIONS & USERS ━━━
chmod, chown, chgrp, sudo, su, passwd, groups, id, useradd, userdel, visudo

━━━ NETWORK ━━━
ifconfig, ip, iwconfig, ping, traceroute, mtr, netstat, ss, arp, route, nmap, masscan, hping3, curl, wget, dig, nslookup, host, whois, nc, tcpdump, tshark, bmon, nethogs, speedtest, nload, bandwhich

━━━ RECON & OSINT ━━━
nmap, masscan, dnsenum, dnsrecon, sublist3r, amass, shodan, recon-ng, theharvester, maltego, spiderfoot

━━━ WEB APP TESTING ━━━
nikto, sqlmap, dirb, gobuster, ffuf, feroxbuster, whatweb, wpscan, nuclei, xsser, commix, dalfox, arjun, sqlninja, skipfish, arachni, zaproxy, w3af

━━━ PASSWORD ATTACKS ━━━
hydra, john, hashcat, crunch, cewl, cupp, hashid, hash-identifier, sslscan, sslyze, testssl

━━━ WIRELESS ━━━
aircrack-ng, airodump-ng, aireplay-ng, airmon-ng, wifite, kismet, reaver, bully, pixiewps, mdk4, hostapd-wpe

━━━ EXPLOITATION ━━━
msfconsole, msfvenom, searchsploit, chisel, socat, pwncat, netexec, psexec, evil-winrm, mimikatz, impacket-psexec, impacket-ntlmrelayx, impacket-secretsdump

━━━ ACTIVE DIRECTORY ━━━
bloodhound-python, kerbrute, ldapsearch, smbclient, smbmap, rpcclient, enum4linux, crackmapexec, kerberoast, GetUserSPNs.py, ntlmrelayx

━━━ CRYPTO & FORENSICS ━━━
base64, xxd, hexdump, od, md5sum, sha1sum, sha256sum, sha512sum, openssl, gpg, strings, binwalk, exiftool, steghide, volatility, foremost, scalpel, photorec, hexedit, mmls

━━━ REVERSE ENGINEERING ━━━
ghidra, radare2, r2, frida, apktool, jadx, gdb, pwndbg, peda, gef, objdump, readelf, nm, ldd, rabin2, cutter, angr, checksec, one_gadget, ropper, ROPgadget

━━━ SYSTEM MONITORING ━━━
ps, top, htop, glances, atop, iotop, nethogs, bmon, free, vmstat, df, uname, uptime, w, who, lscpu, lsblk, lsusb, lspci, dmesg, lsmod, sysctl

━━━ SYSTEM SECURITY ━━━
lynis, chkrootkit, rkhunter, aide, tripwire, fail2ban-client, auditctl, ausearch, aureport, iptables, ufw, nftables

━━━ SERVICES ━━━
systemctl, service, journalctl, crontab, lsof

━━━ ARCHIVES ━━━
tar, zip, unzip, gzip, gunzip, bzip2, 7z, xz

━━━ PACKAGE MANAGEMENT ━━━
apt, apt-get, dpkg, pip3, gem, snap

━━━ DEVELOPMENT ━━━
git, python3, lua, php, java, javac, node, npm, yarn, cargo, rustc, gcc, g++, make, cmake, gdb, swift, kotlin, dotnet, mvn, gradle

━━━ CLOUD & CONTAINERS ━━━
docker, kubectl, terraform, ansible, vagrant, aws, gcloud, az

━━━ SHELL ━━━
history, alias, export, env, set, type, which, whereis, man, help, clear, exit, bash, tmux, screen

Tip: ↑/↓ for history | pipe with | | redirect with > and >> | Tab for hints`;
  }

  _cal() {
    const d = new Date();
    const m = d.getMonth();
    const y = d.getFullYear();
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    const first = new Date(y,m,1).getDay();
    const days = new Date(y,m+1,0).getDate();
    let cal = `   ${months[m]} ${y}\nSu Mo Tu We Th Fr Sa\n`;
    let line = "   ".repeat(first);
    for (let i=1;i<=days;i++) {
      line += String(i).padStart(2," ")+" ";
      if ((i+first)%7===0) { cal+=line.trimEnd()+"\n"; line=""; }
    }
    if (line) cal+=line;
    return cal;
  }

  _expr(args) {
    try {
      const expr = args.join(" ").replace(/\*/g,"*");
      // safe eval of simple arithmetic
      if (/^[\d\s+\-*\/()]+$/.test(expr)) return String(eval(expr));
    } catch(e) {}
    return `expr: syntax error`;
  }

  _seq(args) {
    const nums = args.map(Number);
    const [start, end] = nums.length===1 ? [1,nums[0]] : [nums[0],nums[1]];
    const arr = [];
    for (let i=start;i<=end;i++) arr.push(i);
    return arr.join("\n");
  }

  _factor(args) {
    const n = parseInt(args[0])||1;
    const factors = [];
    let num = n;
    for (let i=2;i*i<=num;i++) while(num%i===0){factors.push(i);num/=i;}
    if (num>1) factors.push(num);
    return `${n}: ${factors.join(" ")}`;
  }


  // ==================== NEW HELPER METHODS ====================

  _docker(args) {
    const sub = args[0] || "help";
    const arg2 = args[1] || "";
    switch(sub) {
      case "ps":      return `CONTAINER ID   IMAGE          COMMAND       CREATED       STATUS        PORTS                  NAMES
a1b2c3d4e5f6   nginx:latest   "nginx -g…"   2 hours ago   Up 2 hours    0.0.0.0:80->80/tcp     web
b2c3d4e5f6a7   mysql:8.0      "docker-e…"   2 hours ago   Up 2 hours    0.0.0.0:3306->3306/tcp db`;
      case "images":  return `REPOSITORY    TAG       IMAGE ID       CREATED       SIZE
nginx         latest    a99a39d070bf   3 days ago    187MB
mysql         8.0       3218b38490ce   5 days ago    516MB
kalilinux/kali rolling  d63acf8ab7c1   7 days ago    128MB`;
      case "pull":    return `Pulling from ${arg2||"nginx"}
Digest: sha256:abc123...
Status: Downloaded newer image for ${arg2||"nginx"}:latest`;
      case "run":     return `[+] Container started
Container ID: a1b2c3d4e5f6`;
      case "stop":    return `${arg2||"container"}`;
      case "rm":      return `${arg2||"container"}`;
      case "rmi":     return `Untagged: ${arg2||"image"}:latest
Deleted: sha256:abc123...`;
      case "exec":    return `root@a1b2c3d4e5f6:/#`;
      case "logs":    return `2024/06/25 10:00:00 [notice] nginx: start worker processes
2024/06/25 10:00:01 [notice] nginx: 4 worker processes`;
      case "build":   return `[+] Building with docker buildx
Step 1/5 : FROM ubuntu:22.04
Step 2/5 : RUN apt-get update
Successfully built a1b2c3d4
Successfully tagged ${args[args.indexOf("-t")+1]||"myimage"}:latest`;
      case "network": return `NETWORK ID     NAME      DRIVER    SCOPE
a1b2c3d4e5f6   bridge    bridge    local
b2c3d4e5f6a7   host      host      local
c3d4e5f6a7b8   none      null      local`;
      case "volume":  return `DRIVER    VOLUME NAME
local     nginx_data
local     mysql_data`;
      case "compose": return `docker-compose v2.23.3
Usage: docker compose [OPTIONS] COMMAND
Commands: up, down, ps, logs, exec, pull, build`;
      default:        return `Docker v25.0.3
Usage: docker [OPTIONS] COMMAND
Commands: run, ps, images, pull, push, build, exec, logs, stop, rm, rmi, network, volume, compose`;
    }
  }

  _kubectl(args) {
    const sub = args[0] || "help";
    const arg2 = args[1] || "";
    switch(sub) {
      case "get":       return arg2==="pods" ?
        `NAME                    READY   STATUS    RESTARTS   AGE
nginx-7d79f8dd77-x9v2k   1/1     Running   0          2h
mysql-5d689c6f4c-k8s2x   1/1     Running   0          2h
redis-6b89ccf4f-mz9x2    1/1     Running   0          2h` :
        arg2==="nodes" ?
        `NAME      STATUS   ROLES           AGE   VERSION
master    Ready    control-plane   30d   v1.28.0
worker1   Ready    <none>          30d   v1.28.0
worker2   Ready    <none>          30d   v1.28.0` :
        `NAME                    READY   UP-TO-DATE   AVAILABLE   AGE
nginx-deployment        3/3     3            3           2h`;
      case "apply":     return `configured: ${args[args.indexOf("-f")+1]||"manifest.yaml"}
deployment.apps/nginx configured`;
      case "delete":    return `${args.slice(1).join(" ")||"resource"} deleted`;
      case "logs":      return `2024/06/25 10:00:00 [notice] started
2024/06/25 10:00:01 [notice] worker process`;
      case "exec":      return `root@nginx-7d79f8dd77-x9v2k:/#`;
      case "describe":  return `Name:         ${args[2]||"nginx-7d79f8dd77-x9v2k"}
Namespace:    default
Status:       Running
IP:           10.244.0.5
Node:         worker1/192.168.1.11`;
      case "scale":     return `deployment.apps/${args[2]||"nginx"} scaled`;
      case "rollout":   return `Waiting for deployment "${args[2]||"nginx"}" rollout to finish: 0 of 3 updated replicas are available...
deployment "${args[2]||"nginx"}" successfully rolled out`;
      default:          return `kubectl v1.28.0
Usage: kubectl [command] [TYPE] [NAME] [flags]
Commands: get, apply, delete, describe, logs, exec, scale, rollout`;
    }
  }

  _aws(args) {
    const svc = args[0] || "help";
    const sub = args[1] || "";
    switch(svc) {
      case "s3":        return sub==="ls" ? `2024-06-25 10:00:00 my-bucket
2024-06-25 10:00:00 backup-bucket
2024-06-25 10:00:00 logs-bucket` : `aws s3 [ls|cp|mv|rm|sync|mb|rb] ...`;
      case "ec2":       return sub==="describe-instances" ? `{
  "Reservations": [{
    "Instances": [{
      "InstanceId": "i-0abcd1234efgh5678",
      "State": {"Name": "running"},
      "InstanceType": "t2.micro",
      "PublicIpAddress": "54.123.45.67"
    }]
  }]
}` : `aws ec2 [describe-instances|run-instances|stop-instances|start-instances]`;
      case "iam":       return `aws iam [list-users|create-user|delete-user|attach-user-policy|list-policies]`;
      case "lambda":    return `aws lambda [list-functions|invoke|create-function|delete-function]`;
      case "rds":       return `aws rds [describe-db-instances|create-db-instance|delete-db-instance]`;
      case "sts":       return `{
  "UserId": "AIDIODR4TAW7CSEXAMPLE",
  "Account": "123456789012",
  "Arn": "arn:aws:iam::123456789012:user/kali"
}`;
      case "configure": return `AWS Access Key ID [None]: ****
AWS Secret Access Key [None]: ****
Default region name [None]: us-east-1
Default output format [None]: json`;
      default:          return `AWS CLI 2.15.0
Usage: aws [options] <command> <subcommand>
Services: s3, ec2, iam, lambda, rds, sts, configure`;
    }
  }

  _npm(args) {
    const sub = args[0] || "help";
    switch(sub) {
      case "install":
      case "i":         return `added ${Math.floor(Math.random()*500+100)} packages in ${(Math.random()*5+1).toFixed(1)}s
${Math.floor(Math.random()*10)} packages are looking for funding`;
      case "run":       return `> ${args[1]||"start"}
> node index.js
Server running on port 3000`;
      case "init":      return `Wrote to package.json:
{
  "name": "my-project",
  "version": "1.0.0",
  "main": "index.js"
}`;
      case "list":
      case "ls":        return `my-project@1.0.0
├── express@4.18.2
├── lodash@4.17.21
└── axios@1.6.0`;
      case "audit":     return `found 0 vulnerabilities`;
      case "update":    return `updated 5 packages in 3.2s`;
      case "uninstall":
      case "rm":        return `removed ${args[1]||"package"} and 15 dependencies`;
      default:          return `npm v10.2.4
Usage: npm <command>
Commands: install, run, init, list, audit, update, publish, pack`;
    }
  }

  _mtr(args) {
    const host = args.filter(a => !a.startsWith("-"))[0] || "8.8.8.8";
    return `mtr ${host} - My Traceroute [v0.95]\n                              Packets               Pings\n Host                  Loss%  Snt  Last  Avg   Best  Wrst\n 1. 192.168.1.1         0.0%  10   1.2   1.3   1.0   1.8\n 2. 10.0.0.1            0.0%  10   5.4   5.6   5.1   6.2\n 3. ${host}      0.0%  10  12.1  12.4  11.9  13.2`;
  }

  _jq(args) {
    if (!args || args.length === 0) return `jq - commandline JSON processor [version 1.7.1]
Usage: jq [options] <filter> [file...]`;
    const filter = args[0] || ".";
    if (filter === ".") return `{
  "key": "value",
  "number": 42,
  "array": [1, 2, 3]
}`;
    if (filter === ".[]") return `"item1"
"item2"
"item3"`;
    if (filter.includes("keys")) return `[
  "id",
  "name",
  "value"
]`;
    if (filter.includes("length")) return `3`;
    if (filter.includes("type")) return `"object"`;
    return `${filter}: parsed successfully`;
  }

  // ---- History navigation ----
  getPrevCommand() {
    if (!this.history.length) return null;
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      return this.history[this.history.length - 1 - this.historyIndex];
    }
    return null;
  }

  getNextCommand() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      return this.history[this.history.length - 1 - this.historyIndex];
    }
    this.historyIndex = -1;
    return "";
  }
}
