import { FileSystem } from './FileSystem.js';

export class Terminal {
  constructor() {
    this.fs = new FileSystem();
    this.history = [];
    this.historyIndex = -1;
  }

  execute(command) {
    if (!command.trim()) return '';
    this.history.push(command);
    this.historyIndex = this.history.length;

    // معالجة Pipes
    if (command.includes('|')) {
      return this.executePipe(command);
    }

    // معالجة Redirection
    if (command.includes('>')) {
      return this.executeRedirect(command);
    }

    const parts = command.trim().split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    return this.executeCommand(cmd, args);
  }

  executePipe(command) {
    const pipes = command.split('|').map(c => c.trim());
    let output = '';

    for (let i = 0; i < pipes.length; i++) {
      const pipeCmd = pipes[i];
      const parts = pipeCmd.split(/\s+/);
      const cmd = parts[0];
      const args = parts.slice(1);

      if (i === 0) {
        output = this.executeCommand(cmd, args);
      } else {
        if (cmd === 'grep') {
          const pattern = args[0];
          output = output.split('\n').filter(l => l.includes(pattern)).join('\n');
        } else if (cmd === 'sort') {
          output = output.split('\n').sort().join('\n');
        } else if (cmd === 'wc') {
          const lines = output.split('\n').filter(l => l).length;
          const words = output.split(/\s+/).filter(w => w).length;
          output = `  ${lines}  ${words}  ${output.length}`;
        } else if (cmd === 'head') {
          const n = parseInt(args[0]) || 10;
          output = output.split('\n').slice(0, n).join('\n');
        } else if (cmd === 'tail') {
          const n = parseInt(args[0]) || 10;
          output = output.split('\n').slice(-n).join('\n');
        } else if (cmd === 'uniq') {
          output = [...new Set(output.split('\n'))].join('\n');
        }
      }
    }

    return output;
  }

  executeRedirect(command) {
    let actualCmd, redirectType = '>', filename = '';

    if (command.includes('>>')) {
      const parts = command.split('>>');
      actualCmd = parts[0].trim();
      filename = parts[1].trim();
      redirectType = '>>';
    } else {
      const parts = command.split('>');
      actualCmd = parts[0].trim();
      filename = parts[1].trim();
    }

    const parts = actualCmd.split(/\s+/);
    const output = this.executeCommand(parts[0], parts.slice(1));

    if (filename && !output.includes('Error')) {
      const dir = this.fs.getDir(this.fs.currentPath);
      if (redirectType === '>') {
        dir.contents[filename] = { type: 'file', size: output.length, owner: 'user', perms: '644', content: output };
      } else {
        if (dir.contents[filename]) {
          dir.contents[filename].content += output;
        } else {
          dir.contents[filename] = { type: 'file', size: output.length, owner: 'user', perms: '644', content: output };
        }
      }
      return `✓ تم حفظ في ${filename}`;
    }

    return output;
  }

  executeCommand(cmd, args) {
    switch (cmd) {
      case 'pwd': return this.fs.pwd();
      case 'ls': return args.includes('-la') ? this.fs.lsla(args.find(a => !a.startsWith('-'))) : this.fs.ls(args[0]);
      case 'cd': return this.fs.cd(args[0]);
      case 'mkdir': return this.fs.mkdir(args[0]);
      case 'touch': return this.fs.touch(args[0]);
      case 'cat': return this.fs.cat(args[0]);
      case 'rm': return this.fs.rm(args[0]);
      case 'rmdir': return this.fs.rmdir(args[0]);
      case 'head': return this.fs.head(args[0], parseInt(args[1]) || 10);
      case 'tail': return this.fs.tail(args[0], parseInt(args[1]) || 10);
      case 'wc': return this.fs.wc(args[0]);
      case 'grep': return this.fs.grep(args[0], args[1]);
      case 'echo': return args.join(' ');
      case 'whoami': return 'user';
      case 'date': return new Date().toLocaleString('ar-EG');
      case 'uname': return 'Linux cyber-academy 5.10.0-8-generic #1 SMP Debian';
      case 'hostname': return 'cyber-academy';
      case 'id': return 'uid=1000(user) gid=1000(user) groups=1000(user)';
      case 'uptime': return 'up 2 days, 14 hours, load average: 0.12, 0.18, 0.15';
      case 'ps': return 'PID USER COMMAND\n1 root /sbin/init\n123 user bash';
      case 'ping': return `PING ${args[0]}: 64 bytes, seq=1, ttl=64, time=10ms`;
      case 'ifconfig': return 'eth0: inet 192.168.1.100 netmask 255.255.255.0';
      case 'sudo': return `sudo: executed ${args.slice(1).join(' ')}`;
      case 'nano': 
        return `Opening nano editor: ${args[0] || 'untitled.txt'}...\n[Press ^X to exit, ^S to save]`;
      case 'vi':
      case 'vim': 
        return `Opening vim editor: ${args[0] || 'untitled.txt'}...\n[Type :q to quit, :w to save]`;
      case 'man': return this.man(args[0]);
      case 'help': return this.getHelp();
      default: return `bash: ${cmd}: command not found`;
    }
  }

  man(cmd) {
    const pages = {
      'ls': `LS(1) User Commands LS
NAME
  ls - list directory contents
SYNOPSIS
  ls [OPTION]... [FILE]...
DESCRIPTION
  List information about FILEs. By default, entries are sorted alphabetically.
OPTIONS
  -l    use a long listing format
  -a    do not ignore entries starting with .
  -h    print human readable sizes
EXAMPLES
  ls              List files in current directory
  ls -la /home    List all files with details in /home`,

      'grep': `GREP(1) User Commands GREP
NAME
  grep - search for lines matching a regular expression
SYNOPSIS
  grep [OPTION]... PATTERN [FILE]...
DESCRIPTION
  Searches files for lines that match PATTERN and prints the matching lines.
OPTIONS
  -i    ignore case distinctions
  -r    recursively search directories
  -n    print line numbers
EXAMPLES
  grep "error" logfile      Search for "error" in logfile
  grep -r "TODO" /src       Recursively search for "TODO"`,

      'cat': `CAT(1) User Commands CAT
NAME
  cat - concatenate files and print on standard output
SYNOPSIS
  cat [OPTION]... [FILE]...
DESCRIPTION
  Concatenate FILE(s), or standard input, and print on the standard output.
EXAMPLES
  cat file.txt              Display contents of file.txt
  cat file1.txt file2.txt   Display contents of multiple files`,

      'cd': `CD(1) Bash Built-in Commands CD
NAME
  cd - Change the shell working directory
SYNOPSIS
  cd [-L|-P] [directory]
DESCRIPTION
  Change the current directory to DIRECTORY.
EXAMPLES
  cd /home/user             Change to /home/user
  cd ..                     Change to parent directory
  cd ~                      Change to home directory`,

      'pwd': `PWD(1) User Commands PWD
NAME
  pwd - print name of current working directory
SYNOPSIS
  pwd [OPTION]...
DESCRIPTION
  Print the full pathname of the current working directory.
EXAMPLES
  pwd                       Print current directory path`,

      'mkdir': `MKDIR(1) User Commands MKDIR
NAME
  mkdir - make directories
SYNOPSIS
  mkdir [OPTION]... DIRECTORY...
DESCRIPTION
  Create the DIRECTORY(ies), if they do not already exist.
OPTIONS
  -p    make parent directories as needed
  -m    set file mode (permissions)
EXAMPLES
  mkdir mydir               Create directory "mydir"
  mkdir -p parent/child     Create nested directories`,

      'rm': `RM(1) User Commands RM
NAME
  rm - remove files or directories
SYNOPSIS
  rm [OPTION]... FILE...
DESCRIPTION
  Remove (unlink) the FILE(s).
WARNING
  This command permanently deletes files. Use with caution.
OPTIONS
  -r    remove directories and their contents recursively
  -f    force removal without prompting
EXAMPLES
  rm file.txt               Delete file.txt
  rm -r directory           Delete directory and contents`,

      'chmod': `CHMOD(1) User Commands CHMOD
NAME
  chmod - change file mode bits
SYNOPSIS
  chmod [OPTION]... MODE[,MODE]... FILE...
DESCRIPTION
  Change the file mode bits of each FILE according to MODE.
MODES
  u (user), g (group), o (others), a (all)
  + (add), - (remove), = (set)
  r (read), w (write), x (execute)
EXAMPLES
  chmod +x script.sh        Add execute permission
  chmod 755 file            Set rwxr-xr-x permissions
  chmod -w file             Remove write permission`,

      'ssh': `SSH(1) OpenSSH Remote Login Client
NAME
  ssh - OpenSSH remote login client
SYNOPSIS
  ssh [options] [user@]hostname [command]
DESCRIPTION
  ssh (SSH client) is a program for logging into a remote machine and for
  executing commands on a remote machine.
EXAMPLES
  ssh user@example.com      Connect to remote server
  ssh -p 2222 user@host     Connect on non-standard port
  ssh host 'ls -la'         Execute command on remote server`,

      'git': `GIT(1) Git Manual GIT
NAME
  git - the stupid content tracker
SYNOPSIS
  git [--version] [--help] [-C <path>] [-c <name>=<value>] <command> [<args>]
DESCRIPTION
  Git is a fast, scalable, distributed revision control system.
COMMANDS
  git status                Show working tree status
  git add <file>            Stage file for commit
  git commit -m "msg"       Commit changes with message
  git push origin main      Push to remote repository
  git pull origin main      Fetch and merge from remote`,
    };

    return pages[cmd] || `No manual entry for ${cmd}`;
  }

  getHelp() {
    return `╔══════════════════════════════════════════════════════════════════╗
║  CYBER ACADEMY INTERACTIVE TERMINAL - Linux & Bash              ║
╚══════════════════════════════════════════════════════════════════╝

📂 File & Directory Commands:
  pwd  ls  cd  mkdir  touch  cat  rm  rmdir  cp  mv  ln

🔍 Search & Filter:
  grep  find  wc  sort  uniq  head  tail  cut  tr  sed  awk

🛡️  Permissions & Ownership:
  chmod  chown  sudo

🖥️  System Information:
  whoami  date  uname  hostname  id  uptime  ps  top

🌐 Network Commands:
  ping  ifconfig  ip  netstat  ss  curl  wget  nslookup  dig

⚙️  Bash & Shell:
  echo  export  set  unset  env  source  for  if  while

📦 Compression & Archives:
  tar  gzip  gunzip  zip  unzip

💻 Development:
  gcc  python  node  git  npm  make

🔒 Security & Encryption:
  openssl  ssh  ssh-keygen  gpg

═══════════════════════════════════════════════════════════════════

⚡ Advanced Features:
  Pipes:       command1 | command2
  Redirect:    command > file.txt
  Append:      command >> file.txt
  History:     ↑ Arrow Up / ↓ Arrow Down

📚 Learn More:
  man <command>    Get detailed command documentation
  help             Show this help message

Try: ls -la | grep txt
Or:  cat /etc/passwd | grep user
Or:  echo "Hello" > output.txt`;
  }

  getPrevCommand() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      return this.history[this.historyIndex];
    }
    return null;
  }

  getNextCommand() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      return this.history[this.historyIndex];
    }
    this.historyIndex = this.history.length;
    return '';
  }
}
