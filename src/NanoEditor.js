// Nano Editor Simulator
export class NanoEditor {
  constructor(filename = 'untitled.txt', initialContent = '') {
    this.filename = filename;
    this.content = initialContent;
    this.lines = initialContent ? initialContent.split('\n') : [''];
    this.cursorLine = 0;
    this.cursorCol = 0;
    this.isModified = false;
    this.isOpen = true;
  }

  insertChar(char) {
    if (this.cursorLine >= this.lines.length) {
      this.lines.push('');
    }
    
    const line = this.lines[this.cursorLine];
    this.lines[this.cursorLine] = 
      line.substring(0, this.cursorCol) + char + line.substring(this.cursorCol);
    
    this.cursorCol++;
    this.isModified = true;
  }

  newLine() {
    const line = this.lines[this.cursorLine] || '';
    const before = line.substring(0, this.cursorCol);
    const after = line.substring(this.cursorCol);
    
    this.lines[this.cursorLine] = before;
    this.lines.splice(this.cursorLine + 1, 0, after);
    
    this.cursorLine++;
    this.cursorCol = 0;
    this.isModified = true;
  }

  backspace() {
    if (this.cursorCol > 0) {
      const line = this.lines[this.cursorLine];
      this.lines[this.cursorLine] = 
        line.substring(0, this.cursorCol - 1) + line.substring(this.cursorCol);
      this.cursorCol--;
      this.isModified = true;
    } else if (this.cursorLine > 0) {
      const prevLine = this.lines[this.cursorLine - 1];
      this.cursorCol = prevLine.length;
      this.lines[this.cursorLine - 1] = prevLine + this.lines[this.cursorLine];
      this.lines.splice(this.cursorLine, 1);
      this.cursorLine--;
      this.isModified = true;
    }
  }

  delete() {
    const line = this.lines[this.cursorLine];
    if (this.cursorCol < line.length) {
      this.lines[this.cursorLine] = 
        line.substring(0, this.cursorCol) + line.substring(this.cursorCol + 1);
      this.isModified = true;
    } else if (this.cursorLine < this.lines.length - 1) {
      this.lines[this.cursorLine] = line + this.lines[this.cursorLine + 1];
      this.lines.splice(this.cursorLine + 1, 1);
      this.isModified = true;
    }
  }

  moveCursor(direction) {
    const line = this.lines[this.cursorLine];
    
    if (direction === 'left' && this.cursorCol > 0) {
      this.cursorCol--;
    } else if (direction === 'right' && this.cursorCol < line.length) {
      this.cursorCol++;
    } else if (direction === 'up' && this.cursorLine > 0) {
      this.cursorLine--;
      this.cursorCol = Math.min(this.cursorCol, this.lines[this.cursorLine].length);
    } else if (direction === 'down' && this.cursorLine < this.lines.length - 1) {
      this.cursorLine++;
      this.cursorCol = Math.min(this.cursorCol, this.lines[this.cursorLine].length);
    }
  }

  save() {
    this.isModified = false;
    this.content = this.lines.join('\n');
    return { filename: this.filename, content: this.content };
  }

  getContent() {
    return this.lines.join('\n');
  }

  getDisplay() {
    return {
      lines: this.lines,
      cursorLine: this.cursorLine,
      cursorCol: this.cursorCol,
      filename: this.filename,
      isModified: this.isModified,
      lineCount: this.lines.length,
      charCount: this.lines.join('\n').length
    };
  }
}
