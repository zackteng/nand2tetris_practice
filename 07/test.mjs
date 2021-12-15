const pushPop = (command, segment, index) => {
  let asm = "";
  if (command === "push") {
    switch (segment) {
      case "constant":
        asm = `
					@${index}\n
					D=A\n
				`;
        break;
      case "local":
        asm = `
					@LCL\n
					D=M\n
					@${index}\n
					A=D+A\n
					D=M\n
				`;
        break;
      case "argument":
        asm = `
					@ARG\n
					D=M\n
					@${index}\n
					A=D+A\n
					D=M\n
				`;
        break;
      case "this":
        asm = `
					@THIS\n
					D=M\n
					@${index}\n
					A=D+A\n
					D=M\n
				`;
        break;
      case "that":
        asm = `
					@THAT\n
					D=M\n
					@${index}\n
					A=D+A\n
					D=M\n
				`;
        break;
      case "pointer":
        asm = `
						@${3 + index}\n
						D=M\n
					`;
        break;
      case "temp":
        asm = `
				@${5 + index}\n
				D=M\n
						`;
        break;
      case "static":
        asm = `
					@filename.${index}\n
					D=M\n
							`;
        break;
    }
    asm += `
			@SP\n
			A=M\n
			M=D\n
			@SP\n
			M=M+1\n
		`;
  }

  if (command === "pop") {
    switch (segment) {
      case "local":
        asm = `
					@LCL\n
					D=M\n
					@${index}\n
					D=D+A\n
					@R13\n
					M=D\n
				`;
        break;
      case "argument":
        asm = `
				@ARG\n
				D=M\n
				@${index}\n
				D=D+A\n
				@R13\n
				M=D\n
				`;
        break;
      case "this":
        asm = `
				@THIS\n
				D=M\n
				@${index}\n
				D=D+A\n
				@R13\n
				M=D\n
				`;
        break;
      case "that":
        asm = `
				@THAT\n
				D=M\n
				@${index}\n
				D=D+A\n
				@R13\n
				M=D\n
				`;
        break;
      case "pointer":
        asm = `
						@${3 + index}\n
						D=A\n
						@R13\n
						M=D\n
					`;
        break;
      case "temp":
        asm = `
				@${5 + index}\n
				D=A\n
				@R13\n
				M=D\n
						`;
        break;
    }

    asm += `
			@SP\n
			A=M\n
			D=M\n
			@SP\n
			M=M-1\n
			@R13\n
			A=M\n
			M=D\n
		`;
  }
};
