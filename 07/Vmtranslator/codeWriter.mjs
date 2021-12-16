import { writeFileSync } from "fs";

class CodeWriter {
  path = null;
  fileName = null;
  result = [];
  labelCount = 0;

  constructor(path) {
    this.path = path;
  }

  setFileName(fileName) {
    this.fileName = fileName;
  }

  writeArithmetic(command) {
    console.log(command);
    let asm = "";
    switch (command) {
      case "add":
        asm = `
        @SP
        M=M-1
        A=M
        D=M
        @R13
        M=D
        @SP
        M=M-1
        A=M
        D=M
        @R13
        D=D+M
        @SP
        A=M
        M=D
        @SP
        M=M+1
        `;
        break;
      case "sub":
        asm = `
          @SP
          M=M-1
          A=M
          D=M
          @R13
          M=D
          @SP
          M=M-1
          A=M
          D=M
          @R13
          D=D-M
          @SP
          A=M
          M=D
          @SP
          M=M+1
          `;
        break;
      case "neg":
        asm = `
            @SP
            M=M-1
            A=M
            D=-M
            @SP
            A=M
            M=D
            @SP
            M=M+1
            `;
        break;
      case "and":
        asm = `
            @SP
            M=M-1
            A=M
            D=M
            @R13
            M=D
            @SP
            M=M-1
            A=M
            D=M
            @R13
            D=D&M
            @SP
            A=M
            M=D
            @SP
            M=M+1
            `;
        break;
      case "or":
        asm = `
          @SP
          M=M-1
          A=M
          D=M
          @R13
          M=D
          @SP
          M=M-1
          A=M
          D=M
          @R13
          D=D|M
          @SP
          A=M
          M=D
          @SP
          M=M+1
          `;
        break;
      case "not":
        asm = `
              @SP
              M=M-1
              A=M
              D=!M
              @SP
              A=M
              M=D
              @SP
              M=M+1
              `;
        break;
      case "eq":
        asm = `
            @SP
            M=M-1
            A=M
            D=M
            @R13
            M=D
            @SP
            M=M-1
            A=M
            D=M
            @R13
            D=D-M
            @SP
            A=M
            M=-1
            @${this.fileName.toUpperCase()}.${this.labelCount}
            D;JEQ
            @SP
            A=M
            M=0
            (${this.fileName.toUpperCase()}.${this.labelCount++})
            @SP
            M=M+1
            `;
        break;
      case "gt":
        asm = `
              @SP
              M=M-1
              A=M
              D=M
              @R13
              M=D
              @SP
              M=M-1
              A=M
              D=M
              @R13
              D=D-M
              @SP
              A=M
              M=-1
              @${this.fileName.toUpperCase()}.${this.labelCount}
              D;JGT
              @SP
              A=M
              M=0
              (${this.fileName.toUpperCase()}.${this.labelCount++})
              @SP
              M=M+1
              `;
        break;
      case "lt":
        asm = `
                @SP
                M=M-1
                A=M
                D=M
                @R13
                M=D
                @SP
                M=M-1
                A=M
                D=M
                @R13
                D=D-M
                @SP
                A=M
                M=-1
                @${this.fileName.toUpperCase()}.${this.labelCount}
                D;JLT
                @SP
                A=M
                M=0
                (${this.fileName.toUpperCase()}.${this.labelCount++})
                @SP
                M=M+1
                `;
        break;
    }
    this.result.push(asm);
  }

  writePushPop(command, segment, index) {
    console.log(command, " ", segment, " ", index);
    let asm = "";
    if (command === "push") {
      switch (segment) {
        case "constant":
          asm = `
					@${index}
					D=A
				`;
          break;
        case "local":
          asm = `
					@LCL
					D=M
					@${index}
					A=D+A
					D=M
				`;
          break;
        case "argument":
          asm = `
					@ARG
					D=M
					@${index}
					A=D+A
					D=M
				`;
          break;
        case "this":
          asm = `
					@THIS
					D=M
					@${index}
					A=D+A
					D=M
				`;
          break;
        case "that":
          asm = `
					@THAT
					D=M
					@${index}
					A=D+A
					D=M
				`;
          break;
        case "pointer":
          asm = `
						@${3 + index}
						D=M
					`;
          break;
        case "temp":
          asm = `
				@${5 + index}
				D=M
						`;
          break;
        case "static":
          asm = `
					@${this.fileName}.${index}
					D=M
							`;
          break;
      }
      asm += `
			@SP
			A=M
			M=D
			@SP
			M=M+1
		`;
    }

    if (command === "pop") {
      switch (segment) {
        case "local":
          asm = `
					@LCL
					D=M
					@${index}
					D=D+A
					@R13
					M=D
				`;
          break;
        case "argument":
          asm = `
				@ARG
				D=M
				@${index}
				D=D+A
				@R13
				M=D
				`;
          break;
        case "this":
          asm = `
				@THIS
				D=M
				@${index}
				D=D+A
				@R13
				M=D
				`;
          break;
        case "that":
          asm = `
				@THAT
				D=M
				@${index}
				D=D+A
				@R13
				M=D
				`;
          break;
        case "pointer":
          asm = `
						@${3 + index}
						D=A
						@R13
						M=D
					`;
          break;
        case "temp":
          asm = `
				@${5 + index}
				D=A
				@R13
				M=D
						`;
          break;
        case "static":
          asm = `
					@${this.fileName}.${index}
          D=A
          @R13
					M=D
							`;
          break;
      }

      asm += `
			@SP
      M=M-1
			A=M
			D=M
			@R13
			A=M
			M=D
		`;
    }

    this.result.push(asm);
  }

  writeInit() {

  }

  writeLabel(label) {
    const asm = `(${label})`;
    this.result.push(asm);
  }

  writeGoto(label) {
    const asm = `
      @${label}
      0;JMP
    `;
    this.result.push(asm);
  }

  writeIf(label) {
    const asm = `
      @SP
      AM=M-1
      D=M
      @${label}
      D;JNE
    `;
    this.result.push(asm);
  }

  writeCall(functionName, numARgs) {

  }

  writeReturn() {

  }

  writeFunction(functionName, numLocals) {

  }

  close() {
    writeFileSync(this.path, this.result.join(""));
  }
}

export { CodeWriter };
