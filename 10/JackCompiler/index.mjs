import { resolve, parse, format, extname } from "path";
import { statSync, readdirSync, writeFileSync } from "fs";
import { JackTokenizer } from "./jackTokenizer.mjs";

const vmPath = resolve(process.cwd(), process.argv[2]);
let files = null;
const stat = statSync(vmPath);
if (stat.isDirectory()) {
  const dir = readdirSync(vmPath);
  files = dir
    .filter(
      (path) =>
        extname(path) === ".jack" && statSync(resolve(vmPath, path)).isFile()
    )
    .map((path) => resolve(vmPath, path));
} else {
  files = [vmPath];
}

files.forEach((file) => {
  const filePathParsered = parse(file);
  const resultFilePath = format({
    dir: filePathParsered.dir,
    name: filePathParsered.name + "T1",
    ext: ".xml",
  });
  const jackTokenizer = new JackTokenizer(file);
  const tokens = ["<tokens>"];
  jackTokenizer.advance();
  while (jackTokenizer.hasMoreTokens()) {
    switch (jackTokenizer.tokenType()) {
      case "KEYWORD":
        tokens.push(`<keyword> ${jackTokenizer.keyword()} </keyword>`);
        break;
      case "IDENTIFIER":
        tokens.push(`<identifier> ${jackTokenizer.identifier()} </identifier>`);
        break;
      case "SYMBOL":
        let symbol = jackTokenizer.symbol();
        switch (symbol) {
          case "<":
            symbol = "&lt;";
            break;
          case ">":
            symbol = "&gt;";
            break;
          case "&":
            symbol = "&amp;";
            break;
        }
        tokens.push(`<symbol> ${symbol} </symbol>`);
        break;
      case "INT-CONST":
        tokens.push(
          `<integerConstant> ${jackTokenizer.intVal()} </integerConstant>`
        );
        break;
      case "STRING-CONST":
        tokens.push(
          `<stringConstant> ${jackTokenizer.stringVal()} </stringConstant>`
        );
        break;
    }
    jackTokenizer.advance();
  }
  tokens.push(["</tokens>"]);
  writeFileSync(resultFilePath, tokens.join("\n"));
});
