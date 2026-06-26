// محاكي نظام ملفات وهمي + محرك تنفيذ أوامر Linux/Bash أساسية.
// مش Linux حقيقي — ده محاكاة تعليمية بتفهم أهم الأوامر وبترد بنفس
// الشكل اللي هيشوفه المستخدم في Terminal حقيقي.

// ---- بنية نظام الملفات الابتدائية ----
// كل عقدة (node) إما "dir" (وفيها children) أو "file" (وفيها content)
function makeInitialFS() {
  return {
    type: "dir",
    name: "/",
    children: {
      home: {
        type: "dir",
        name: "home",
        children: {
          hacker: {
            type: "dir",
            name: "hacker",
            children: {
              "readme.txt": {
                type: "file",
                name: "readme.txt",
                content: "أهلاً بيك في الـ Terminal التفاعلي!\nجرب أوامر زي ls, cat, cd, mkdir, pwd.",
              },
              "notes.txt": {
                type: "file",
                name: "notes.txt",
                content: "ملاحظات الدرس:\n- تعلمت pwd و ls\n- جاي دور cd بعد كده",
              },
              scripts: {
                type: "dir",
                name: "scripts",
                children: {
                  "scan.sh": {
                    type: "file",
                    name: "scan.sh",
                    content: "#!/bin/bash\necho 'Scanning network...'\nnmap -sV 192.168.1.0/24",
                  },
                },
              },
            },
          },
        },
      },
      etc: {
        type: "dir",
        name: "etc",
        children: {
          passwd: {
            type: "file",
            name: "passwd",
            content: "root:x:0:0:root:/root:/bin/bash\nhacker:x:1000:1000::/home/hacker:/bin/bash",
          },
          hostname: {
            type: "file",
            name: "hostname",
            content: "cyber-academy-vm",
          },
        },
      },
      var: {
        type: "dir",
        name: "var",
        children: {
          log: {
            type: "dir",
            name: "log",
            children: {
              "auth.log": {
                type: "file",
                name: "auth.log",
                content: "Jun 21 02:14:09 cyber-academy-vm sshd[1022]: Accepted password for hacker from 10.0.0.5",
              },
            },
          },
        },
      },
    },
  };
}

const HOME_PATH = ["home", "hacker"];

// ---- أدوات مساعدة للتنقل في الشجرة ----
function resolvePath(cwd, target) {
  // cwd: array زي ["home","hacker"]، target: نص من المستخدم
  if (!target || target === ".") return [...cwd];
  if (target === "~") return [...HOME_PATH];
  let parts;
  if (target.startsWith("/")) {
    parts = target.split("/").filter(Boolean);
  } else {
    parts = [...cwd, ...target.split("/").filter(Boolean)];
  }
  const resolved = [];
  for (const p of parts) {
    if (p === "..") resolved.pop();
    else if (p === ".") continue;
    else resolved.push(p);
  }
  return resolved;
}

function getNode(fs, pathArr) {
  let node = fs;
  for (const part of pathArr) {
    if (!node || node.type !== "dir" || !node.children[part]) return null;
    node = node.children[part];
  }
  return node;
}

function getParentAndName(pathArr) {
  return { parent: pathArr.slice(0, -1), name: pathArr[pathArr.length - 1] };
}

function pathToStr(pathArr) {
  return "/" + pathArr.join("/");
}

function formatPrompt(cwd) {
  const display = cwd.length === 0 ? "/" : pathToStr(cwd).replace(pathToStr(HOME_PATH), "~");
  return `hacker@cyber-academy:${display}$`;
}

// ---- محرك تنفيذ الأوامر ----
// state: { fs, cwd }  — بيترجع { output: string, newState } أو لو exit بيرجع علامة خاصة
export function runCommand(rawInput, state) {
  const input = rawInput.trim();
  if (!input) return { output: "", newState: state };

  const [cmd, ...args] = input.split(/\s+/);
  const fs = state.fs;
  const cwd = state.cwd;

  switch (cmd) {
    case "pwd":
      return { output: pathToStr(cwd) || "/", newState: state };

    case "whoami":
      return { output: "hacker", newState: state };

    case "hostname":
      return { output: "cyber-academy-vm", newState: state };

    case "echo":
      return { output: args.join(" "), newState: state };

    case "clear":
      return { output: "__CLEAR__", newState: state };

    case "ls": {
      const showHidden = args.includes("-a") || args.includes("-la") || args.includes("-al");
      const longFormat = args.includes("-l") || args.includes("-la") || args.includes("-al");
      const pathArg = args.find((a) => !a.startsWith("-"));
      const targetPath = resolvePath(cwd, pathArg);
      const node = getNode(fs, targetPath);
      if (!node) return { output: `ls: cannot access '${pathArg}': No such file or directory`, newState: state };
      if (node.type === "file") return { output: node.name, newState: state };
      let entries = Object.values(node.children);
      if (!showHidden) entries = entries.filter((e) => !e.name.startsWith("."));
      if (entries.length === 0) return { output: "", newState: state };
      if (longFormat) {
        const lines = entries.map((e) => {
          const perms = e.type === "dir" ? "drwxr-xr-x" : "-rw-r--r--";
          const size = e.type === "dir" ? 4096 : (e.content || "").length;
          return `${perms} 1 hacker hacker ${String(size).padStart(5)} Jun 21 02:00 ${e.name}${e.type === "dir" ? "/" : ""}`;
        });
        return { output: lines.join("\n"), newState: state };
      }
      return {
        output: entries.map((e) => e.name + (e.type === "dir" ? "/" : "")).join("  "),
        newState: state,
      };
    }

    case "cd": {
      const target = args[0] || "~";
      const newPath = resolvePath(cwd, target);
      const node = getNode(fs, newPath);
      if (!node) return { output: `bash: cd: ${target}: No such file or directory`, newState: state };
      if (node.type !== "dir") return { output: `bash: cd: ${target}: Not a directory`, newState: state };
      return { output: "", newState: { ...state, cwd: newPath } };
    }

    case "mkdir": {
      if (args.length === 0) return { output: "mkdir: missing operand", newState: state };
      const dirName = args[args.length - 1];
      const newPath = resolvePath(cwd, dirName);
      const { parent, name } = getParentAndName(newPath);
      const parentNode = getNode(fs, parent);
      if (!parentNode || parentNode.type !== "dir")
        return { output: `mkdir: cannot create directory '${dirName}': No such file or directory`, newState: state };
      if (parentNode.children[name])
        return { output: `mkdir: cannot create directory '${dirName}': File exists`, newState: state };
      const newFs = deepClone(fs);
      const newParentNode = getNode(newFs, parent);
      newParentNode.children[name] = { type: "dir", name, children: {} };
      return { output: "", newState: { ...state, fs: newFs } };
    }

    case "touch": {
      if (args.length === 0) return { output: "touch: missing file operand", newState: state };
      const fileName = args[args.length - 1];
      const newPath = resolvePath(cwd, fileName);
      const { parent, name } = getParentAndName(newPath);
      const parentNode = getNode(fs, parent);
      if (!parentNode || parentNode.type !== "dir")
        return { output: `touch: cannot touch '${fileName}': No such file or directory`, newState: state };
      const newFs = deepClone(fs);
      const newParentNode = getNode(newFs, parent);
      if (!newParentNode.children[name]) {
        newParentNode.children[name] = { type: "file", name, content: "" };
      }
      return { output: "", newState: { ...state, fs: newFs } };
    }

    case "cat": {
      if (args.length === 0) return { output: "cat: missing file operand", newState: state };
      const outputs = [];
      for (const fileName of args) {
        const targetPath = resolvePath(cwd, fileName);
        const node = getNode(fs, targetPath);
        if (!node) outputs.push(`cat: ${fileName}: No such file or directory`);
        else if (node.type === "dir") outputs.push(`cat: ${fileName}: Is a directory`);
        else outputs.push(node.content || "");
      }
      return { output: outputs.join("\n"), newState: state };
    }

    case "rm": {
      if (args.length === 0) return { output: "rm: missing operand", newState: state };
      const recursive = args.includes("-r") || args.includes("-rf") || args.includes("-fr");
      const targets = args.filter((a) => !a.startsWith("-"));
      const newFs = deepClone(fs);
      const outputs = [];
      for (const t of targets) {
        const targetPath = resolvePath(cwd, t);
        const node = getNode(newFs, targetPath);
        if (!node) {
          outputs.push(`rm: cannot remove '${t}': No such file or directory`);
          continue;
        }
        if (node.type === "dir" && !recursive && Object.keys(node.children).length > 0) {
          outputs.push(`rm: cannot remove '${t}': Is a directory`);
          continue;
        }
        const { parent, name } = getParentAndName(targetPath);
        const parentNode = getNode(newFs, parent);
        delete parentNode.children[name];
      }
      return { output: outputs.join("\n"), newState: { ...state, fs: newFs } };
    }

    case "rmdir": {
      if (args.length === 0) return { output: "rmdir: missing operand", newState: state };
      const targetPath = resolvePath(cwd, args[0]);
      const node = getNode(fs, targetPath);
      if (!node) return { output: `rmdir: failed to remove '${args[0]}': No such file or directory`, newState: state };
      if (node.type !== "dir") return { output: `rmdir: failed to remove '${args[0]}': Not a directory`, newState: state };
      if (Object.keys(node.children).length > 0)
        return { output: `rmdir: failed to remove '${args[0]}': Directory not empty`, newState: state };
      const newFs = deepClone(fs);
      const { parent, name } = getParentAndName(targetPath);
      const parentNode = getNode(newFs, parent);
      delete parentNode.children[name];
      return { output: "", newState: { ...state, fs: newFs } };
    }

    case "echo_to_file": // internal, not a real command
      return { output: "", newState: state };

    case "grep": {
      if (args.length < 2) return { output: "Usage: grep PATTERN FILE", newState: state };
      const pattern = args[0];
      const fileName = args[1];
      const targetPath = resolvePath(cwd, fileName);
      const node = getNode(fs, targetPath);
      if (!node || node.type !== "file")
        return { output: `grep: ${fileName}: No such file or directory`, newState: state };
      const matches = (node.content || "").split("\n").filter((l) => l.includes(pattern));
      return { output: matches.join("\n"), newState: state };
    }

    case "wc": {
      if (args.length === 0) return { output: "wc: missing file operand", newState: state };
      const fileName = args[args.length - 1];
      const targetPath = resolvePath(cwd, fileName);
      const node = getNode(fs, targetPath);
      if (!node || node.type !== "file")
        return { output: `wc: ${fileName}: No such file or directory`, newState: state };
      const lines = (node.content || "").split("\n").length;
      const words = (node.content || "").split(/\s+/).filter(Boolean).length;
      const chars = (node.content || "").length;
      return { output: `  ${lines}  ${words} ${chars} ${fileName}`, newState: state };
    }

    case "head": {
      if (args.length === 0) return { output: "head: missing file operand", newState: state };
      const fileName = args[args.length - 1];
      const targetPath = resolvePath(cwd, fileName);
      const node = getNode(fs, targetPath);
      if (!node || node.type !== "file")
        return { output: `head: cannot open '${fileName}'`, newState: state };
      return { output: (node.content || "").split("\n").slice(0, 10).join("\n"), newState: state };
    }

    case "tail": {
      if (args.length === 0) return { output: "tail: missing file operand", newState: state };
      const fileName = args[args.length - 1];
      const targetPath = resolvePath(cwd, fileName);
      const node = getNode(fs, targetPath);
      if (!node || node.type !== "file")
        return { output: `tail: cannot open '${fileName}'`, newState: state };
      const lines = (node.content || "").split("\n");
      return { output: lines.slice(Math.max(0, lines.length - 10)).join("\n"), newState: state };
    }

    case "chmod":
      return { output: "", newState: state }; // محاكاة بسيطة، مفيش تأثير فعلي على الصلاحيات

    case "history":
      return { output: (state.history || []).join("\n"), newState: state };

    case "help":
      return {
        output:
          "الأوامر المتاحة:\n" +
          "pwd, ls [-l] [-a], cd, mkdir, touch, cat, rm [-r], rmdir,\n" +
          "echo, grep, wc, head, tail, whoami, hostname, clear, history",
        newState: state,
      };

    case "":
      return { output: "", newState: state };

    default:
      return { output: `bash: ${cmd}: command not found`, newState: state };
  }
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

export { makeInitialFS, HOME_PATH, formatPrompt, resolvePath, getNode };
