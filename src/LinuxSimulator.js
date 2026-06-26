// Advanced Linux Simulator - Browser Based
export class LinuxSimulator {
  constructor() {
    this.fileSystem = {
      '/': { type: 'dir', owner: 'root', perms: '755', children: {} },
      '/home': { type: 'dir', owner: 'root', perms: '755', children: {} },
      '/home/user': { type: 'dir', owner: 'user', perms: '755', children: {} },
      '/home/user/Desktop': { type: 'dir', owner: 'user', perms: '755', children: {} },
      '/home/user/Documents': { type: 'dir', owner: 'user', perms: '755', children: {} },
      '/tmp': { type: 'dir', owner: 'root', perms: '777', children: {} },
      '/etc': { type: 'dir', owner: 'root', perms: '755', children: {} },
      '/var': { type: 'dir', owner: 'root', perms: '755', children: {} },
    };

    this.files = {
      '/home/user/.bashrc': {
        type: 'file',
        content: '# Bash configuration\nexport PATH=/usr/local/bin:/usr/bin:/bin\nalias ll="ls -la"',
        owner: 'user',
        perms: '644',
        size: 156
      },
      '/home/user/hello.txt': {
        type: 'file',
        content: 'Hello, World!\nWelcome to Cyber Academy Linux Simulator',
        owner: 'user',
        perms: '644',
        size: 54
      },
      '/home/user/script.sh': {
        type: 'file',
        content: '#!/bin/bash\necho "Script executed successfully!"\necho "User: $(whoami)"\necho "Date: $(date)"',
        owner: 'user',
        perms: '755',
        size: 89
      },
      '/etc/hostname': {
        type: 'file',
        content: 'cyber-academy',
        owner: 'root',
        perms: '644',
        size: 13
      },
      '/etc/passwd': {
        type: 'file',
        content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:cyber-user:/home/user:/bin/bash',
        owner: 'root',
        perms: '644',
        size: 95
      },
    };

    this.currentPath = '/home/user';
    this.currentUser = 'user';
    this.history = [];
    this.historyIndex = -1;
    this.processTable = [];
    this.environmentVars = {
      PATH: '/usr/local/bin:/usr/bin:/bin',
      HOME: '/home/user',
      USER: 'user',
      SHELL: '/bin/bash',
      PWD: '/home/user'
    };
  }

  getPrompt() {
    return `\x1b[92m${this.currentUser}\x1b[0m@\x1b[94mcyber\x1b[0m:\x1b[36m${this.currentPath}\x1b[0m$ `;
  }

  execute(command) {
    if (!command.trim()) return { output: '', error: false };

    this.history.push(command);
    this.historyIndex = -1;

    try {
      const { cmd, args } = this.parseCommand(command);

      switch (cmd) {
        case 'pwd':
          return { output: this.currentPath, error: false };

        case 'ls':
          return { output: this.ls(args), error: false };

        case 'cd':
          return this.cd(args);

        case 'cat':
          return this.cat(args);

        case 'echo':
          return { output: this.echo(args), error: false };

        case 'mkdir':
          return this.mkdir(args);

        case 'touch':
          return this.touch(args);

        case 'rm':
          return this.rm(args);

        case 'cp':
          return this.cp(args);

        case 'mv':
          return this.mv(args);

        case 'whoami':
          return { output: this.currentUser, error: false };

        case 'id':
          return {
            output: `uid=1000(${this.currentUser}) gid=1000(${this.currentUser}) groups=1000(${this.currentUser}),4(adm)`,
            error: false
          };

        case 'date':
          return { output: new Date().toString(), error: false };

        case 'hostname':
          return { output: 'cyber-academy', error: false };

        case 'uname':
          if (args.includes('-a')) {
            return { 
              output: 'Linux cyber-academy 5.10.0-generic #1 SMP x86_64 GNU/Linux',
              error: false 
            };
          }
          return { output: 'Linux', error: false };

        case 'whoami':
          return { output: this.currentUser, error: false };

        case 'ps':
          return {
            output: `  PID TTY      TIME CMD
 1234 pts/0    00:00:01 bash
 5678 pts/0    00:00:02 node
 9012 pts/0    00:00:03 python3`,
            error: false
          };

        case 'grep':
          return this.grep(args);

        case 'find':
          return this.find(args);

        case 'wc':
          return this.wc(args);

        case 'head':
          return this.head(args);

        case 'tail':
          return this.tail(args);

        case 'sort':
          return { output: 'sort: sorting text...', error: false };

        case 'chmod':
          return { output: '', error: false };

        case 'chown':
          return { output: '', error: false };

        case 'sudo':
          return { output: `[sudo] password for ${this.currentUser}: `, error: false };

        case 'clear':
          return { output: '___CLEAR___', error: false };

        case 'help':
          return { output: this.getHelp(), error: false };

        case 'history':
          return {
            output: this.history
              .map((h, i) => `  ${i + 1}  ${h}`)
              .join('\n'),
            error: false
          };

        case 'man':
          return { output: this.getManPage(args[0]), error: false };

        case 'file':
          return { output: this.fileType(args[0]), error: false };

        case 'stat':
          return { output: this.stat(args[0]), error: false };

        case 'tree':
          return { output: this.tree(), error: false };

        case 'du':
          return { output: '4.0K\t/home/user', error: false };

        case 'df':
          if (args.includes('-h')) {
            return {
              output: `Filesystem      Size  Used Avail Use%
/dev/sda1       100G   45G   55G  45%`,
              error: false
            };
          }
          return { output: 'df command', error: false };

        case 'free':
          if (args.includes('-h')) {
            return {
              output: `              total        used        free
Mem:          7.7Gi       3.2Gi       2.1Gi
Swap:         2.0Gi       1.2Gi       0.8Gi`,
              error: false
            };
          }
          return { output: 'free output', error: false };

        case 'uptime':
          return {
            output: ` ${new Date().toLocaleTimeString()} up 12 days, 3:45, 1 user, load average: 0.32, 0.28, 0.25`,
            error: false
          };

        case 'env':
          return {
            output: Object.entries(this.environmentVars)
              .map(([k, v]) => `${k}=${v}`)
              .join('\n'),
            error: false
          };

        case 'export':
          return { output: '', error: false };

        case 'alias':
          return { output: "alias ll='ls -la'", error: false };

        case 'which':
          return { output: `/usr/bin/${args[0]}`, error: false };

        case 'whereis':
          return { output: `${args[0]}: /usr/bin/${args[0]}`, error: false };

        case 'type':
          return { output: `${args[0]} is a shell builtin`, error: false };

        case 'exit':
          return { output: 'exit', error: false };

        default:
          return {
            output: `bash: ${cmd}: command not found`,
            error: true
          };
      }
    } catch (error) {
      return { output: `Error: ${error.message}`, error: true };
    }
  }

  parseCommand(command) {
    const parts = command.trim().split(/\s+/);
    return {
      cmd: parts[0],
      args: parts.slice(1)
    };
  }

  ls(args) {
    const showDetails = args.includes('-l') || args.includes('-la');
    const showHidden = args.includes('-a') || args.includes('-la');

    const entries = [];
    for (const [path, file] of Object.entries(this.files)) {
      if (path.startsWith(this.currentPath + '/')) {
        const name = path.substring(this.currentPath.length + 1);
        if (!name.includes('/')) {
          const hidden = name.startsWith('.');
          if (showHidden || !hidden) {
            entries.push({ name, ...file });
          }
        }
      }
    }

    if (showDetails) {
      return entries
        .map(f => `${f.perms} 1 ${f.owner} ${f.owner} ${f.size} Jan 1 12:00 ${f.name}`)
        .join('\n');
    }

    return entries.map(f => f.name).join('  ');
  }

  cd(args) {
    if (args.length === 0) {
      this.currentPath = '/home/user';
      return { output: '', error: false };
    }

    const target = args[0];
    let newPath;

    if (target === '..') {
      newPath = this.currentPath.substring(0, this.currentPath.lastIndexOf('/')) || '/';
    } else if (target === '~') {
      newPath = '/home/user';
    } else if (target.startsWith('/')) {
      newPath = target;
    } else {
      newPath = this.currentPath + '/' + target;
    }

    if (this.fileSystem[newPath] || newPath === '/') {
      this.currentPath = newPath;
      this.environmentVars.PWD = newPath;
      return { output: '', error: false };
    }

    return { output: `bash: cd: ${target}: No such file or directory`, error: true };
  }

  cat(args) {
    if (args.length === 0) return { output: 'cat: missing operand', error: true };

    const filePath = this.resolvePath(args[0]);
    const file = this.files[filePath];

    if (!file) {
      return { output: `cat: ${args[0]}: No such file or directory`, error: true };
    }

    if (file.type === 'dir') {
      return { output: `cat: ${args[0]}: Is a directory`, error: true };
    }

    return { output: file.content, error: false };
  }

  echo(args) {
    return args.join(' ');
  }

  mkdir(args) {
    if (args.length === 0) return { output: 'mkdir: missing operand', error: true };
    return { output: '', error: false };
  }

  touch(args) {
    if (args.length === 0) return { output: 'touch: missing operand', error: true };
    return { output: '', error: false };
  }

  rm(args) {
    if (args.length === 0) return { output: 'rm: missing operand', error: true };
    return { output: '', error: false };
  }

  cp(args) {
    if (args.length < 2) return { output: 'cp: missing operand', error: true };
    return { output: '', error: false };
  }

  mv(args) {
    if (args.length < 2) return { output: 'mv: missing operand', error: true };
    return { output: '', error: false };
  }

  grep(args) {
    if (args.length < 2) return { output: 'grep: missing pattern', error: true };
    return { output: 'matching lines...', error: false };
  }

  find(args) {
    return { output: '/home/user/hello.txt\n/home/user/script.sh', error: false };
  }

  wc(args) {
    if (args.length === 0) return { output: 'wc: missing operand', error: true };
    return { output: '  5  20 100 file.txt', error: false };
  }

  head(args) {
    const filePath = this.resolvePath(args[0]);
    const file = this.files[filePath];
    if (!file) return { output: `head: ${args[0]}: No such file`, error: true };
    return { output: file.content.split('\n').slice(0, 10).join('\n'), error: false };
  }

  tail(args) {
    const filePath = this.resolvePath(args[0]);
    const file = this.files[filePath];
    if (!file) return { output: `tail: ${args[0]}: No such file`, error: true };
    return { output: file.content.split('\n').slice(-10).join('\n'), error: false };
  }

  stat(args) {
    const filePath = this.resolvePath(args[0]);
    const file = this.files[filePath];
    if (!file) return { output: `stat: ${args[0]}: No such file`, error: true };
    return {
      output: `File: ${filePath}\nSize: ${file.size}\nAccess: (${file.perms}) Owner: ${file.owner}`,
      error: false
    };
  }

  tree() {
    return `/
├── home/
│   └── user/
│       ├── Desktop/
│       ├── Documents/
│       ├── .bashrc
│       ├── hello.txt
│       └── script.sh
├── etc/
│   ├── hostname
│   └── passwd
├── tmp/
└── var/`;
  }

  fileType(filename) {
    if (filename.endsWith('.sh')) return `${filename}: Bourne-Again shell script`;
    if (filename.endsWith('.txt')) return `${filename}: ASCII text`;
    if (filename.endsWith('.py')) return `${filename}: Python script`;
    return `${filename}: data`;
  }

  resolvePath(path) {
    if (path.startsWith('/')) return path;
    if (path === '.') return this.currentPath;
    if (path === '..') return this.currentPath.substring(0, this.currentPath.lastIndexOf('/')) || '/';
    return this.currentPath + '/' + path;
  }

  getHelp() {
    return `Available commands:
pwd              - print working directory
ls               - list directory contents
cd               - change directory
cat              - display file contents
echo             - print text
mkdir            - create directory
touch            - create file
rm               - remove file
cp               - copy file
mv               - move/rename file
whoami           - print username
id               - print user info
date             - print date/time
hostname         - print system hostname
uname            - print system info
ps               - list processes
grep             - search text
find             - find files
history          - command history
clear            - clear screen
help             - show this help
man              - manual pages
exit             - exit terminal`;
  }

  getManPage(cmd) {
    const pages = {
      ls: 'LS(1) - list directory contents\nUsage: ls [options] [files]\n-l: long format\n-a: show hidden',
      cd: 'CD(1) - change directory\nUsage: cd [directory]\nSpecial: .. (parent), ~ (home), - (previous)',
      cat: 'CAT(1) - concatenate files\nUsage: cat [files]\nDisplay file contents on stdout',
      echo: 'ECHO(1) - display a line of text\nUsage: echo [string]'
    };
    return pages[cmd] || `No manual entry for ${cmd}`;
  }

  getPrevCommand() {
    if (this.history.length === 0) return null;
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
    return '';
  }
}
