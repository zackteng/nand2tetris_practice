
					@0
					D=A
				
			@SP
			A=M
			M=D
			@SP
			M=M+1
		
					@LCL
					D=M
					@0
					D=D+A
					@R13
					M=D
				
			@SP
      M=M-1
			A=M
			D=M
			@R13
			A=M
			M=D
		(LOOP_START)
					@ARG
					D=M
					@0
					A=D+A
					D=M
				
			@SP
			A=M
			M=D
			@SP
			M=M+1
		
					@LCL
					D=M
					@0
					A=D+A
					D=M
				
			@SP
			A=M
			M=D
			@SP
			M=M+1
		
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
        
					@LCL
					D=M
					@0
					D=D+A
					@R13
					M=D
				
			@SP
      M=M-1
			A=M
			D=M
			@R13
			A=M
			M=D
		
					@ARG
					D=M
					@0
					A=D+A
					D=M
				
			@SP
			A=M
			M=D
			@SP
			M=M+1
		
					@1
					D=A
				
			@SP
			A=M
			M=D
			@SP
			M=M+1
		
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
          
				@ARG
				D=M
				@0
				D=D+A
				@R13
				M=D
				
			@SP
      M=M-1
			A=M
			D=M
			@R13
			A=M
			M=D
		
					@ARG
					D=M
					@0
					A=D+A
					D=M
				
			@SP
			A=M
			M=D
			@SP
			M=M+1
		
      @SP
      AM=M-1
      D=M
      @LOOP_START
      D;JNE
    
					@LCL
					D=M
					@0
					A=D+A
					D=M
				
			@SP
			A=M
			M=D
			@SP
			M=M+1
		