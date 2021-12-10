import { readFileSync } from "fs";

class Parser {
  lines = [];
  currentIndex = 0;
  currentCommand = null;

  constructor(path) {
    this.lines = readFileSync(path, { encoding: "utf-8" })
      .split(/\r?\n/)
      .map((line) => {
        const index = line.indexOf("//");
        return index === -1 ? line.trim() : line.slice(0, index).trim();
      })
      .filter((line) => line !== "" && !line.startsWith("//"));

    // console.log(this.lines)
  }

  hasMoreCommands() {
    return this.currentIndex < this.lines.length;
  }

  advance() {
    this.currentCommand = this.lines[this.currentIndex++];
  }

  commandType() {
    if (this.currentCommand !== null) {
      if (this.currentCommand.startsWith("@")) {
        return "A_COMMAND";
      } else if (this.currentCommand.startsWith("(")) {
        return "L_COMMAND";
      } else {
        return "C_COMMAND";
      }
    }
  }

  symbol() {
    return this.currentCommand.slice(1);
  }

  dest() {
    const index = this.currentCommand.indexOf("=");
    return index === -1 ? null : this.currentCommand.slice(0, index);
  }

  comp() {
    const index1 = this.currentCommand.indexOf("=");
    const index2 = this.currentCommand.indexOf(";");
    if (index1 !== -1 && index2 !== -1) {
      return this.currentCommand.slice(index1 + 1, index2);
    } else if (index1 !== -1) {
      return this.currentCommand.slice(index1 + 1);
    } else {
      return this.currentCommand.slice(0, index2);
    }
  }

  jump() {
    const index = this.currentCommand.indexOf(";");
    return index === -1 ? null : this.currentCommand.slice(index + 1);
  }
}

export { Parser };
