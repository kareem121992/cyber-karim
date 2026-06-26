// محاكاة Python Interpreter
export class PythonInterpreter {
  constructor() {
    this.variables = {};
    this.output = [];
    this.indentStack = [0];
    this.codeLines = [];
    this.lineIndex = 0;
  }

  reset() {
    this.variables = {};
    this.output = [];
    this.indentStack = [0];
    this.codeLines = [];
    this.lineIndex = 0;
  }

  run(code) {
    this.reset();
    this.output = [];
    
    try {
      const lines = code.split('\n');
      this.codeLines = lines;
      
      // معالجة الأسطر
      let i = 0;
      while (i < lines.length) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // تخطي الأسطر الفارغة والتعليقات
        if (!trimmed || trimmed.startsWith('#')) {
          i++;
          continue;
        }

        // معالجة الأوامر
        i = this.executeLine(trimmed, lines, i);
      }

      return this.output.join('\n');
    } catch (error) {
      return `❌ Error: ${error.message}`;
    }
  }

  executeLine(line, allLines, lineIndex) {
    // print statement
    if (line.startsWith('print(')) {
      const content = line.substring(6, line.lastIndexOf(')')).trim();
      const result = this.evaluateExpression(content);
      this.output.push(result.toString());
      return lineIndex + 1;
    }

    // Variable assignment
    if (line.includes('=') && !line.includes('==')) {
      const [varName, ...valueParts] = line.split('=');
      const name = varName.trim();
      const value = valueParts.join('=').trim();
      
      if (name.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
        this.variables[name] = this.evaluateExpression(value);
      }
      return lineIndex + 1;
    }

    // for loop
    if (line.startsWith('for ')) {
      return this.executeFor(line, allLines, lineIndex);
    }

    // while loop
    if (line.startsWith('while ')) {
      return this.executeWhile(line, allLines, lineIndex);
    }

    // if statement
    if (line.startsWith('if ')) {
      return this.executeIf(line, allLines, lineIndex);
    }

    // input()
    if (line.startsWith('input(')) {
      const promptMatch = line.match(/input\((.*?)\)/);
      const prompt = promptMatch ? this.evaluateExpression(promptMatch[1]) : '';
      this.output.push(`[INPUT] ${prompt}`);
      return lineIndex + 1;
    }

    return lineIndex + 1;
  }

  executeFor(line, allLines, lineIndex) {
    // for x in range(5):
    const match = line.match(/for\s+(\w+)\s+in\s+(.+):/);
    if (!match) return lineIndex + 1;

    const varName = match[1];
    const iterableStr = match[2].trim();

    let iterable = [];
    if (iterableStr.startsWith('range(')) {
      const rangeArgs = iterableStr.substring(6, iterableStr.indexOf(')')).split(',').map(x => parseInt(x.trim()));
      if (rangeArgs.length === 1) {
        iterable = Array.from({ length: rangeArgs[0] }, (_, i) => i);
      } else if (rangeArgs.length === 2) {
        iterable = Array.from({ length: rangeArgs[1] - rangeArgs[0] }, (_, i) => rangeArgs[0] + i);
      } else if (rangeArgs.length === 3) {
        const [start, end, step] = rangeArgs;
        for (let i = start; i < end; i += step) iterable.push(i);
      }
    } else if (this.variables[iterableStr]) {
      const val = this.variables[iterableStr];
      iterable = Array.isArray(val) ? val : val.toString().split('');
    }

    // إيجاد محتوى الـ loop
    const loopBody = [];
    let i = lineIndex + 1;
    const baseIndent = this.getIndent(allLines[lineIndex]);

    while (i < allLines.length) {
      const nextLine = allLines[i];
      if (nextLine.trim() === '' || nextLine.trim().startsWith('#')) {
        i++;
        continue;
      }
      const nextIndent = this.getIndent(nextLine);
      if (nextIndent <= baseIndent) break;
      loopBody.push(nextLine.trim());
      i++;
    }

    // تنفيذ الـ loop
    for (const value of iterable) {
      this.variables[varName] = value;
      for (const bodyLine of loopBody) {
        this.executeLine(bodyLine, allLines, 0);
      }
    }

    return i;
  }

  executeWhile(line, allLines, lineIndex) {
    const match = line.match(/while\s+(.+):/);
    if (!match) return lineIndex + 1;

    const condition = match[1].trim();
    const loopBody = [];
    let i = lineIndex + 1;
    const baseIndent = this.getIndent(allLines[lineIndex]);

    while (i < allLines.length) {
      const nextLine = allLines[i];
      if (nextLine.trim() === '' || nextLine.trim().startsWith('#')) {
        i++;
        continue;
      }
      const nextIndent = this.getIndent(nextLine);
      if (nextIndent <= baseIndent) break;
      loopBody.push(nextLine.trim());
      i++;
    }

    let iterations = 0;
    while (this.evaluateCondition(condition) && iterations < 1000) {
      for (const bodyLine of loopBody) {
        this.executeLine(bodyLine, allLines, 0);
      }
      iterations++;
    }

    return i;
  }

  executeIf(line, allLines, lineIndex) {
    const match = line.match(/if\s+(.+):/);
    if (!match) return lineIndex + 1;

    const condition = match[1].trim();
    const ifBody = [];
    let i = lineIndex + 1;
    const baseIndent = this.getIndent(allLines[lineIndex]);

    while (i < allLines.length) {
      const nextLine = allLines[i];
      if (nextLine.trim() === '' || nextLine.trim().startsWith('#')) {
        i++;
        continue;
      }
      const nextIndent = this.getIndent(nextLine);
      if (nextIndent <= baseIndent) break;
      ifBody.push(nextLine.trim());
      i++;
    }

    if (this.evaluateCondition(condition)) {
      for (const bodyLine of ifBody) {
        this.executeLine(bodyLine, allLines, 0);
      }
    }

    return i;
  }

  evaluateExpression(expr) {
    expr = expr.trim();

    // String literals
    if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
      return expr.slice(1, -1);
    }

    // Numbers
    if (!isNaN(expr) && expr !== '') {
      return Number(expr);
    }

    // Variables
    if (this.variables.hasOwnProperty(expr)) {
      return this.variables[expr];
    }

    // len()
    if (expr.startsWith('len(')) {
      const arg = expr.substring(4, expr.lastIndexOf(')')).trim();
      const val = this.evaluateExpression(arg);
      return val.toString().length;
    }

    // str()
    if (expr.startsWith('str(')) {
      const arg = expr.substring(4, expr.lastIndexOf(')')).trim();
      return this.evaluateExpression(arg).toString();
    }

    // int()
    if (expr.startsWith('int(')) {
      const arg = expr.substring(4, expr.lastIndexOf(')')).trim();
      return parseInt(this.evaluateExpression(arg));
    }

    // list()
    if (expr.startsWith('[') && expr.endsWith(']')) {
      const items = expr.slice(1, -1).split(',').map(x => this.evaluateExpression(x.trim()));
      return items;
    }

    // Arithmetic
    const simpleMatch = expr.match(/^(\d+)\s*([+\-*/])\s*(\d+)$/);
    if (simpleMatch) {
      const [, a, op, b] = simpleMatch;
      const numA = Number(a);
      const numB = Number(b);
      if (op === '+') return numA + numB;
      if (op === '-') return numA - numB;
      if (op === '*') return numA * numB;
      if (op === '/') return Math.floor(numA / numB);
    }

    // String concatenation
    if (expr.includes('+')) {
      const parts = expr.split('+').map(p => this.evaluateExpression(p.trim()));
      return parts.join('');
    }

    return expr;
  }

  evaluateCondition(condition) {
    // x > 5
    const gtMatch = condition.match(/(\w+)\s*>\s*(\d+)/);
    if (gtMatch) {
      const val = this.variables[gtMatch[1]];
      return val > Number(gtMatch[2]);
    }

    // x < 5
    const ltMatch = condition.match(/(\w+)\s*<\s*(\d+)/);
    if (ltMatch) {
      const val = this.variables[ltMatch[1]];
      return val < Number(ltMatch[2]);
    }

    // x == 5
    const eqMatch = condition.match(/(\w+)\s*==\s*(\d+)/);
    if (eqMatch) {
      const val = this.variables[eqMatch[1]];
      return val === Number(eqMatch[2]);
    }

    return true;
  }

  getIndent(line) {
    const match = line.match(/^(\s*)/);
    return match ? match[1].length : 0;
  }
}
