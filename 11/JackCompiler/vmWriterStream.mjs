import { createWriteStream } from "fs";

class VmWriterStream {
  writeStream = null;

  constructor(outputFilePath) {
    this.writeStream = createWriteStream(outputFilePath);
  }

  writePush(segment, index) {
    this.writeStream.write(`push ${segment} ${index}\n`);
  }

  writePop(segment, index) {
    this.writeStream.write(`pop ${segment} ${index}\n`);
  }

  writeArithmetic(command) {
    this.writeStream.write(`${command}\n`);
  }

  writeLabel(label) {
    this.writeStream.write(`label ${label}\n`);
  }

  writeGoto(label) {
    this.writeStream.write(`goto ${label}\n`);
  }

  writeIf(label) {
    this.writeStream.write(`if-goto ${label}\n`);
  }

  writeCall(name, nArgs) {
    this.writeStream.write(`call ${name} ${nArgs}\n`);
  }

  writeFunction(name, nArgs) {
    this.writeStream.write(`function ${name} ${nArgs}\n`);
  }

  writeReturn() {
    this.writeStream.write(`return\n`);
  }

  close() {
    this.writeStream.end();
  }
}

export { VmWriterStream };
