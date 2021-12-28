import { readFileSync } from "fs";

// const symbols = [
//   "(",
//   ")",
//   "[",
//   "]",
//   "{",
//   "}",
//   ",",
//   ";",
//   "=",
//   ".",
//   "+",
//   "-",
//   "*",
//   "/",
//   "&",
//   "|",
//   "~",
//   "<",
//   ">",
// ];
// const keywords = [
//   "class",
//   "constructor",
//   "method",
//   "function",
//   "int",
//   "boolean",
//   "char",
//   "void",
//   "var",
//   "static",
//   "field",
//   "let",
//   "do",
//   "if",
//   "else",
//   "while",
//   "return",
//   "true",
//   "false",
//   "null",
//   "this",
// ];
// const identifier = /^[a-zA-Z_]\w*/;

class JackTokenizer {
  jackSource = null;
  tokenRegexp =
    /(class|constructor|method|function|int|boolean|char|void|var|static|field|let|do|if|else|while|return|true|false|null|this)|([a-zA-Z_]\w*)|(\(|\)|\[|\]|\{|\}|\,|\;|\=|\.|\+|\-|\*|\/|\&|\||\~|\<|\>)|(\d+)|\"(.*)\"/g;
  execResult;

  constructor(path) {
    this.jackSource = readFileSync(path, { encoding: "utf-8" })
      .replace(/(\s*\/\/.*)|(\s*\/\*(.|\r?\n)*?\*\/)/g, "")
      // .replace(/((\r?\n)|\t)+/g, " ")
      // .replace(/\s+/g, " ")
      // .split(/\s+/)
      // .filter((line) => line !== "")
      // .map((line) => line.trim().split(/\s+/));
      // console.log(this.jackSource)
  }
"//"
  hasMoreTokens() {
    return this.execResult !== null;
  }

  advance() {
    this.execResult = this.tokenRegexp.exec(this.jackSource);
  }

  tokenType() {
    if (this.execResult[1] !== undefined) return "KEYWORD";
    if (this.execResult[2] !== undefined) return "IDENTIFIER";
    if (this.execResult[3] !== undefined) return "SYMBOL";
    if (this.execResult[4] !== undefined) return "INT-CONST";
    if (this.execResult[5] !== undefined) return "STRING-CONST";
  }

  keyword() {
    return this.execResult[1];
  }

  symbol() {
    return this.execResult[3];
  }

  identifier() {
    return this.execResult[2];
  }

  intVal() {
    return this.execResult[4];
  }

  stringVal() {
    return this.execResult[5];
  }
}

export { JackTokenizer };