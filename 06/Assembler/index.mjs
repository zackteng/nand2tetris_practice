import { resolve, parse, format } from "path";
import { writeFileSync } from "fs";
import { Parser } from "./parser.mjs";
import { dest, comp, jump } from "./code.mjs";
import { SymbolTable } from "./symbolTable.mjs";

const asmPath = resolve(process.cwd(), process.argv[2]);
const asmPathParsed = parse(asmPath);
const hackPath = format({
  dir: asmPathParsed.dir,
  name: asmPathParsed.name + "1",
  ext: ".hack",
});

//构建符号表
let currentLineNo = 0;
const symbolTable = new SymbolTable();
const parser = new Parser(asmPath);
while (parser.hasMoreCommands()) {
  parser.advance();
  const commandType = parser.commandType();
  if (commandType === "L_COMMAND") {
    const symbol = parser.symbol().slice(0, -1);
    symbolTable.addEntry(symbol, currentLineNo);
    continue;
  }
  currentLineNo++;
}

// 真正翻译
let currentRAMIndex = 16;
const parser2 = new Parser(asmPath);
const result = [];
while (parser2.hasMoreCommands()) {
  parser2.advance();
  const commandType = parser2.commandType();
  if (commandType === "A_COMMAND") {
    const symbol = parser2.symbol();
    if (isNaN(+symbol[0])) {
      if(symbolTable.contains(symbol)) {
        const address = symbolTable.getAddress(symbol);
        result.push(
          `0${address.toString(2).padStart(15, "0")}`
        );
      } else {
        symbolTable.addEntry(symbol, currentRAMIndex);
        result.push(
          `0${currentRAMIndex.toString(2).padStart(15, "0")}`
        );
        currentRAMIndex ++;
      }
    } else {
      result.push(`0${(+symbol).toString(2).padStart(15, "0")}`);
    }
  } else if (commandType === "C_COMMAND") {
    result.push(
      `111${comp(parser2.comp())}${dest(parser2.dest())}${jump(parser2.jump())}`
    );
  }
}

writeFileSync(hackPath, result.join("\n"));
console.log(symbolTable);
