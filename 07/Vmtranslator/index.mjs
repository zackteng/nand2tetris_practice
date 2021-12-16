import { resolve, parse, format } from "path";
import { Parser } from "./parser.mjs";
import { CodeWriter } from "./codeWriter.mjs";

const vmPath = resolve(process.cwd(), process.argv[2]);
const vmPathParsed = parse(vmPath);
const asmPath = format({
  dir: vmPathParsed.dir,
  name: vmPathParsed.name,
  ext: ".asm",
});

const parser = new Parser(vmPath);
console.log(parser.lines);
const codeWriter = new CodeWriter(asmPath);
codeWriter.setFileName(vmPathParsed.name);

while (parser.hasMoreCommands()) {
  parser.advance();
  const commandType = parser.commandType();
  if (commandType === "C_ARITHMETIC") {
    codeWriter.writeArithmetic(parser.currentCommand[0]);
  } else if (
    commandType === "C_PUSH" ||
    commandType === "C_POP"
  ) {
    codeWriter.writePushPop(
      parser.currentCommand[0],
      parser.arg1(),
      +parser.arg2()
    );
  } else if (commandType === "C_LABEL") {
    codeWriter.writeLabel(parser.arg1());
  } else if (commandType === "C_GOTO") {
    codeWriter.writeGoto(parser.arg1());
  } else if (commandType === "C_IF") {
    codeWriter.writeIf(parser.arg1());
  }
}

codeWriter.close();

// console.log(parser.lines);
