import { resolve, parse, format, extname } from "path";
import { statSync, readdirSync } from "fs";
import { JackTokenizer } from "./jackTokenizer.mjs";
import { SymbolTable } from "./symbolTable.mjs";
// import { VmWriter } from "./vmWriter.mjs";
import { VmWriterStream } from "./vmWriterStream.mjs";
import { CompilationEngine } from "./compilationEngine.mjs";

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
    name: filePathParsered.name,
    ext: ".vm",
  });
  const jackTokenizer = new JackTokenizer(file);
  const symbolTable = new SymbolTable();
  // const vmWriter = new VmWriter(resultFilePath);
  const vmWriterStream = new VmWriterStream(resultFilePath);
  const compilationEngine = new CompilationEngine(jackTokenizer, symbolTable, vmWriterStream);
  compilationEngine.compileClass();
});
