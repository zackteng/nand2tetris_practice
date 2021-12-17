import { resolve, parse, format, extname, basename, dirname } from "path";
import { statSync, readdirSync } from "fs";
import { Parser } from "./parser.mjs";
import { CodeWriter } from "./codeWriter.mjs";

const vmPath = resolve(process.cwd(), process.argv[2]);
let files = null;
let asmPath = null;
const stat = statSync(vmPath);
if (stat.isDirectory()) {
  const dir = readdirSync(vmPath);
  files = dir
    .filter(
      (path) =>
        extname(path) === ".vm" && statSync(resolve(vmPath, path)).isFile()
    )
    .map((path) => resolve(vmPath, path));
  asmPath = resolve(vmPath, basename(vmPath) + ".asm");
} else {
  files = [vmPath];
  asmPath = resolve(dirname(vmPath), basename(vmPath, ".vm") + ".asm");
}

const codeWriter = new CodeWriter(asmPath);
codeWriter.writeInit();

files.forEach((file) => {
  const parser = new Parser(file);
  codeWriter.setFileName(basename(file, ".vm"));
  while (parser.hasMoreCommands()) {
    parser.advance();
    const commandType = parser.commandType();
    if (commandType === "C_ARITHMETIC") {
      codeWriter.writeArithmetic(parser.currentCommand[0]);
    } else if (commandType === "C_PUSH" || commandType === "C_POP") {
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
    } else if (commandType === "C_FUNCTION") {
      codeWriter.writeFunction(parser.arg1(), parser.arg2());
    } else if (commandType === "C_CALL") {
      codeWriter.writeCall(parser.arg1(), parser.arg2());
    } else if (commandType === "C_RETURN") {
      codeWriter.writeReturn();
    }
  }
});

codeWriter.close();
