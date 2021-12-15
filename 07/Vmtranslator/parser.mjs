import { readFileSync } from "fs";

const commandTypeMap = {
  add: "C_ARITHMETIC",
  sub: "C_ARITHMETIC",
  neg: "C_ARITHMETIC",
  eq: "C_ARITHMETIC",
  gt: "C_ARITHMETIC",
  lt: "C_ARITHMETIC",
  and: "C_ARITHMETIC",
  or: "C_ARITHMETIC",
  not: "C_ARITHMETIC",
  push: "C_PUSH",
  pop: "C_POP",
};

class Parser {
  lines = [];
  currentIndex = 0;
  currentCommand = null;

  constructor(path) {
    this.lines = readFileSync(path, { encoding: "utf-8" })
      .replace(/\s*\/\/.*/g, "")
      .split(/\r?\n/)
      .filter((line) => line !== "")
      .map((line) => line.trim().split(/\s+/));
  }

  hasMoreCommands() {
    return this.currentIndex < this.lines.length;
  }

  advance() {
    this.currentCommand = this.lines[this.currentIndex++];
  }

  commandType() {
    return commandTypeMap[this.currentCommand[0].toLowerCase()];
  }

  arg1() {
    if (this.commandType === "C_ARITHMETIC") {
      return this.currentCommand[0];
    }
    return this.currentCommand[1];
  }

  arg2() {
    return this.currentCommand[2];
  }
}

export { Parser };
