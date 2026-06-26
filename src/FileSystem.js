// نظام ملفات واقعي مع محتويات حقيقية
export class FileSystem {
  constructor() {
    this.root = {
      type: 'dir',
      name: '/',
      size: 4096,
      owner: 'root',
      perms: '755',
      contents: {
        'bin': { type: 'dir', size: 4096, owner: 'root', perms: '755', contents: {} },
        'etc': { 
          type: 'dir', size: 4096, owner: 'root', perms: '755', 
          contents: {
            'passwd': { type: 'file', size: 2048, owner: 'root', perms: '644', content: 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:user:/home/user:/bin/bash\n' },
            'hostname': { type: 'file', size: 15, owner: 'root', perms: '644', content: 'cyber-academy\n' },
          }
        },
        'home': {
          type: 'dir', size: 4096, owner: 'root', perms: '755',
          contents: {
            'user': {
              type: 'dir', size: 4096, owner: 'user', perms: '755',
              contents: {
                'documents': { type: 'dir', size: 4096, owner: 'user', perms: '755', contents: {} },
                'projects': { type: 'dir', size: 4096, owner: 'user', perms: '755', contents: {} },
                'Desktop': { type: 'dir', size: 4096, owner: 'user', perms: '755', contents: {} },
                '.bashrc': { type: 'file', size: 256, owner: 'user', perms: '644', content: 'export PATH=$PATH:/usr/local/bin\nalias ll="ls -la"\n' },
                '.bash_history': { type: 'file', size: 512, owner: 'user', perms: '600', content: 'ls\npwd\ncd documents\necho "Hello"\n' },
                'hello.txt': { type: 'file', size: 13, owner: 'user', perms: '644', content: 'Hello World!\n' },
                'script.sh': { type: 'file', size: 89, owner: 'user', perms: '755', content: '#!/bin/bash\necho "This is a script"\necho "Running..."\necho "Done"\n' },
                'data.csv': { type: 'file', size: 128, owner: 'user', perms: '644', content: 'name,age,city\nAhmed,25,Cairo\nFatima,30,Giza\nMohamed,28,Alex\n' },
              }
            }
          }
        },
        'var': {
          type: 'dir', size: 4096, owner: 'root', perms: '755',
          contents: {
            'log': { type: 'dir', size: 4096, owner: 'root', perms: '755', contents: {} },
          }
        },
        'tmp': { type: 'dir', size: 4096, owner: 'root', perms: '777', contents: {} },
      }
    };
    this.currentPath = '/home/user';
    this.env = {
      PATH: '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
      HOME: '/home/user',
      USER: 'user',
      SHELL: '/bin/bash',
      LANG: 'ar_EG.UTF-8',
      TERM: 'xterm-256color',
    };
    this.processes = [
      { pid: 1, name: 'init', user: 'root', cpu: '0.0', mem: '0.1' },
      { pid: 123, name: 'bash', user: 'user', cpu: '0.0', mem: '0.5' },
      { pid: 456, name: 'vim', user: 'user', cpu: '0.1', mem: '1.2' },
    ];
  }

  pwd() {
    return this.currentPath;
  }

  ls(path = null) {
    const targetPath = path || this.currentPath;
    const dir = this.getDir(targetPath);
    if (!dir) return `ls: cannot access '${targetPath}': No such file or directory`;
    if (dir.type !== 'dir') return `ls: cannot open directory '${targetPath}': Not a directory`;
    const items = Object.keys(dir.contents);
    if (items.length === 0) return '';
    return items.join('  ');
  }

  lsla(path = null) {
    const targetPath = path || this.currentPath;
    const dir = this.getDir(targetPath);
    if (!dir) return `ls: cannot access '${targetPath}': No such file or directory`;
    if (dir.type !== 'dir') return `ls: cannot open directory '${targetPath}': Not a directory`;
    let result = 'total ' + Object.keys(dir.contents).length + '\n';
    result += `drwxr-xr-x   3 ${dir.owner} ${dir.owner}    ${dir.size} Dec 21 15:38 .\n`;
    result += `drwxr-xr-x   4 root     root        4096 Dec 20 10:20 ..\n`;
    for (const name in dir.contents) {
      const item = dir.contents[name];
      const type = item.type === 'dir' ? 'd' : '-';
      result += `${type}rw-r--r--   1 ${item.owner || 'user'} ${item.owner || 'user'}    ${item.size} Dec 21 14:32 ${name}\n`;
    }
    return result.trim();
  }

  cd(path) {
    if (!path || path === '~') path = '/home/user';
    if (path === '..') {
      const parts = this.currentPath.split('/').filter(Boolean);
      parts.pop();
      this.currentPath = parts.length === 0 ? '/' : '/' + parts.join('/');
      return '';
    }
    const resolved = this.resolvePath(path);
    const dir = this.getDir(resolved);
    if (!dir) return `bash: cd: ${path}: No such file or directory`;
    if (dir.type !== 'dir') return `bash: cd: ${path}: Not a directory`;
    this.currentPath = resolved;
    return '';
  }

  mkdir(name) {
    if (!name) return 'mkdir: missing operand';
    const dir = this.getDir(this.currentPath);
    if (!dir) return 'mkdir: Error';
    if (dir.contents[name]) return `mkdir: cannot create directory '${name}': File exists`;
    dir.contents[name] = { type: 'dir', size: 4096, owner: 'user', perms: '755', contents: {} };
    return '';
  }

  touch(name) {
    if (!name) return 'touch: missing file operand';
    const dir = this.getDir(this.currentPath);
    if (!dir) return 'touch: Error';
    if (dir.contents[name]) return '';
    dir.contents[name] = { type: 'file', size: 0, owner: 'user', perms: '644', content: '' };
    return '';
  }

  cat(name) {
    if (!name) return 'cat: missing file operand';
    const file = this.getFile(this.currentPath, name);
    if (!file) return `cat: ${name}: No such file or directory`;
    if (file.type !== 'file') return `cat: ${name}: Is a directory`;
    return file.content;
  }

  rm(name) {
    if (!name) return 'rm: missing operand';
    const dir = this.getDir(this.currentPath);
    if (!dir) return 'rm: Error';
    if (!dir.contents[name]) return `rm: cannot remove '${name}': No such file or directory`;
    if (dir.contents[name].type === 'dir') return `rm: cannot remove '${name}': Is a directory`;
    delete dir.contents[name];
    return '';
  }

  rmdir(name) {
    if (!name) return 'rmdir: missing operand';
    const dir = this.getDir(this.currentPath);
    if (!dir) return 'rmdir: Error';
    const item = dir.contents[name];
    if (!item) return `rmdir: failed to remove '${name}': No such file or directory`;
    if (item.type !== 'dir') return `rmdir: failed to remove '${name}': Not a directory`;
    if (Object.keys(item.contents).length > 0) return `rmdir: failed to remove '${name}': Directory not empty`;
    delete dir.contents[name];
    return '';
  }

  echo(text) {
    return text || '';
  }

  grep(pattern, file) {
    if (!pattern || !file) return 'grep: missing operand';
    const content = this.cat(file);
    if (content.includes('No such file')) return content;
    const lines = content.split('\n').filter(line => line.includes(pattern));
    return lines.length > 0 ? lines.join('\n') : '';
  }

  wc(file) {
    if (!file) return 'wc: missing file operand';
    const content = this.cat(file);
    if (content.includes('No such file')) return content;
    const lines = content.split('\n').length;
    const words = content.split(/\s+/).length;
    const chars = content.length;
    return `  ${lines}  ${words}  ${chars} ${file}`;
  }

  head(file, n = 10) {
    if (!file) return 'head: missing file operand';
    const content = this.cat(file);
    if (content.includes('No such file')) return content;
    return content.split('\n').slice(0, n).join('\n');
  }

  tail(file, n = 10) {
    if (!file) return 'tail: missing file operand';
    const content = this.cat(file);
    if (content.includes('No such file')) return content;
    return content.split('\n').slice(-n).join('\n');
  }

  resolvePath(path) {
    if (path.startsWith('/')) return path;
    return this.currentPath === '/' ? '/' + path : this.currentPath + '/' + path;
  }

  getDir(path) {
    if (path === '/') return this.root;
    const parts = path.split('/').filter(Boolean);
    let current = this.root;
    for (const part of parts) {
      if (!current.contents || !current.contents[part]) return null;
      current = current.contents[part];
    }
    return current && current.type === 'dir' ? current : null;
  }

  getFile(dirPath, name) {
    const dir = this.getDir(dirPath);
    return dir && dir.contents ? dir.contents[name] : null;
  }
}
