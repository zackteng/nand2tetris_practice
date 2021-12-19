import { writeFileSync } from "fs";

class CodeWriter {
  path = null;
  fileName = null;
  result = [];
  labelCount = 0;
  returnIndex = 0;
  currentFunctionName = null;

  constructor(path) {
    this.path = path;
  }

  setFileName(fileName) {
    this.fileName = fileName;
  }

  writeArithmetic(command) {
    let asm = "";
    switch (command) {
      case "add":
        asm = `
        @SP
        AM=M-1
        D=M
        @R13
        M=D
        @SP
        AM=M-1
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
          AM=M-1
          D=M
          @R13
          M=D
          @SP
          AM=M-1
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
            AM=M-1
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
            AM=M-1
            D=M
            @R13
            M=D
            @SP
            AM=M-1
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
          AM=M-1
          D=M
          @R13
          M=D
          @SP
          AM=M-1
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
              AM=M-1
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
            AM=M-1
            D=M
            @R13
            M=D
            @SP
            AM=M-1
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
              AM=M-1
              D=M
              @R13
              M=D
              @SP
              AM=M-1
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
                AM=M-1
                D=M
                @R13
                M=D
                @SP
                AM=M-1
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
      AM=M-1
			D=M
			@R13
			A=M
			M=D
		`;
    }

    this.result.push(asm);
  }

  writeInit() {
    const asm = `
      @261
      D=A
      @SP
      M=D
      @Sys.init
      0;JMP
    `;
    this.result.push(asm);
  }

  writeLabel(label) {
    const labelName =
      this.currentFunctionName === null
        ? label
        : `${this.currentFunctionName}$${label}`;
    const asm = `(${labelName})`;
    this.result.push(asm);
  }

  writeGoto(label) {
    const labelName =
    this.currentFunctionName === null
      ? label
      : `${this.currentFunctionName}$${label}`;
    const asm = `
      @${labelName}
      0;JMP
    `;
    this.result.push(asm);
  }

  writeIf(label) {
    const labelName =
    this.currentFunctionName === null
      ? label
      : `${this.currentFunctionName}$${label}`;
    const asm = `
      @SP
      AM=M-1
      D=M
      @${labelName}
      D;JNE
    `;
    this.result.push(asm);
  }

  writeCall(functionName, numARgs) {
    const asm = `
      @ReturnAddress.${this.returnIndex}
      D=A
      @SP
      A=M
      M=D
      @SP
      M=M+1
      @LCL
      D=M
      @SP
      A=M
      M=D
      @SP
      M=M+1
      @ARG
      D=M
      @SP
      A=M
      M=D
      @SP
      M=M+1
      @THIS
      D=M
      @SP
      A=M
      M=D
      @SP
      M=M+1
      @THAT
      D=M
      @SP
      A=M
      M=D
      @SP
      MD=M+1
      @LCL
      M=D
      @${numARgs}
      D=D-A
      @5
      D=D-A
      @ARG
      M=D
      @${functionName}
      0;JMP
      (ReturnAddress.${this.returnIndex++})
    `;
    this.result.push(asm);
  }

  writeReturn() {
    const asm = `
      @LCL
      D=M
      @R13
      M=D
      @5
      A=D-A
      D=M
      @R14
      M=D
      @SP
      AM=M-1
      D=M
      @ARG
      A=M
      M=D
      @ARG
      D=M+1
      @SP
      M=D
      @R13
      D=M
      A=D-1
      D=M
      @THAT
      M=D
      @R13
      D=M
      @2
      A=D-A
      D=M
      @THIS
      M=D
      @R13
      D=M
      @3
      A=D-A
      D=M
      @ARG
      M=D
      @R13
      D=M
      @4
      A=D-A
      D=M
      @LCL
      M=D
      @R14
      A=M
      0;JMP
    `;
    this.result.push(asm);
  }

  writeFunction(functionName, numLocals) {
    this.currentFunctionName = functionName;
    const asm = `
      (${functionName})
      @${numLocals}
      D=A
      @${functionName}.initLocalsEnd
      D;JEQ
      (${functionName}.initLocalsStart)
      @SP
      A=M
      M=0
      @SP
      M=M+1
      D=D-1
      @${functionName}.initLocalsStart
      D;JNE
      (${functionName}.initLocalsEnd)
    `;
    this.result.push(asm);
  }

  close() {
    writeFileSync(this.path, this.result.join(""));
  }
}

export { CodeWriter };
