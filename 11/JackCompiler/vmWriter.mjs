import { writeFileSync } from "fs";

class VmWriter {
  result = [];
  outputFilePath = null;

  constructor(outputFilePath) {
    this.outputFilePath = outputFilePath;
  }

  writePush(segment, index) {
    this.result.push(`push ${segment} ${index}`);
  }

  writePop(segment, index) {
    this.result.push(`pop ${segment} ${index}`);
  }

  writeArithmetic(command) {
    this.result.push(`${command}`);
  }

  writeLabel(label) {
    this.result.push(`label ${label}`);
  }

  writeGoto(label) {
    this.result.push(`goto ${label}`);
  }

  writeIf(label) {
    this.result.push(`if-goto ${label}`);
  }

  writeCall(name, nArgs) {
    this.result.push(`call ${name} ${nArgs}`);
  }

  writeFunction(name, nArgs) {
    this.result.push(`function ${name} ${nArgs}`);
  }

  writeReturn() {
    this.result.push(`return`);
  }

  close() {
    writeFileSync(this.outputFilePath, this.result.join("\n"));
  }
}

export { VmWriter };
