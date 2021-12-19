
      @261
      D=A
      @SP
      M=D
      @Sys.init
      0;JMP
    
      (Sys.init)
      @0
      D=A
      @Sys.init.initLocalsEnd
      D;JEQ
      (Sys.init.initLocalsStart)
      @SP
      A=M
      M=0
      @SP
      M=M+1
      D=D-1
      @Sys.init.initLocalsStart
      D;JNE
      (Sys.init.initLocalsEnd)
    
					@4000
					D=A
				
			@SP
			A=M
			M=D
			@SP
			M=M+1
		
						@3
						D=A
						@R13
						M=D
					
			@SP
      AM=M-1
			D=M
			@R13
			A=M
			M=D
		
					@5000
					D=A
				
			@SP
			A=M
			M=D
			@SP
			M=M+1
		
						@4
						D=A
						@R13
						M=D
					
			@SP
      AM=M-1
			D=M
			@R13
			A=M
			M=D
		
      @ReturnAddress.0
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
      @0
      D=D-A
      @5
      D=D-A
      @ARG
      M=D
      @Sys.main
      0;JMP
      (ReturnAddress.0)
    
				@6
				D=A
				@R13
				M=D
						
			@SP
      AM=M-1
			D=M
			@R13
			A=M
			M=D
		(Sys.init$LOOP)
      @Sys.init$LOOP
      0;JMP
    
      (Sys.main)
      @5
      D=A
      @Sys.main.initLocalsEnd
      D;JEQ
      (Sys.main.initLocalsStart)
      @SP
      A=M
      M=0
      @SP
      M=M+1
      D=D-1
      @Sys.main.initLocalsStart
      D;JNE
      (Sys.main.initLocalsEnd)
    
					@4001
					D=A
				
			@SP
			A=M
			M=D
			@SP
			M=M+1
		
						@3
						D=A
						@R13
						M=D
					
			@SP
      AM=M-1
			D=M
			@R13
			A=M
			M=D
		
					@5001
					D=A
				
			@SP
			A=M
			M=D
			@SP
			M=M+1
		
						@4
						D=A
						@R13
						M=D
					
			@SP
      AM=M-1
			D=M
			@R13
			A=M
			M=D
		
					@200
					D=A
				
			@SP
			A=M
			M=D
			@SP
			M=M+1
		
					@LCL
					D=M
					@1
					D=D+A
					@R13
					M=D
				
			@SP
      AM=M-1
			D=M
			@R13
			A=M
			M=D
		
					@40
					D=A
				
			@SP
			A=M
			M=D
			@SP
			M=M+1
		
					@LCL
					D=M
					@2
					D=D+A
					@R13
					M=D
				
			@SP
      AM=M-1
			D=M
			@R13
			A=M
			M=D
		
					@6
					D=A
				
			@SP
			A=M
			M=D
			@SP
			M=M+1
		
					@LCL
					D=M
					@3
					D=D+A
					@R13
					M=D
				
			@SP
      AM=M-1
			D=M
			@R13
			A=M
			M=D
		
					@123
					D=A
				
			@SP
			A=M
			M=D
			@SP
			M=M+1
		
      @ReturnAddress.1
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
      @1
      D=D-A
      @5
      D=D-A
      @ARG
      M=D
      @Sys.add12
      0;JMP
      (ReturnAddress.1)
    
				@5
				D=A
				@R13
				M=D
						
			@SP
      AM=M-1
			D=M
			@R13
			A=M
			M=D
		
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
		
					@LCL
					D=M
					@1
					A=D+A
					D=M
				
			@SP
			A=M
			M=D
			@SP
			M=M+1
		
					@LCL
					D=M
					@2
					A=D+A
					D=M
				
			@SP
			A=M
			M=D
			@SP
			M=M+1
		
					@LCL
					D=M
					@3
					A=D+A
					D=M
				
			@SP
			A=M
			M=D
			@SP
			M=M+1
		
					@LCL
					D=M
					@4
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
    
      (Sys.add12)
      @0
      D=A
      @Sys.add12.initLocalsEnd
      D;JEQ
      (Sys.add12.initLocalsStart)
      @SP
      A=M
      M=0
      @SP
      M=M+1
      D=D-1
      @Sys.add12.initLocalsStart
      D;JNE
      (Sys.add12.initLocalsEnd)
    
					@4002
					D=A
				
			@SP
			A=M
			M=D
			@SP
			M=M+1
		
						@3
						D=A
						@R13
						M=D
					
			@SP
      AM=M-1
			D=M
			@R13
			A=M
			M=D
		
					@5002
					D=A
				
			@SP
			A=M
			M=D
			@SP
			M=M+1
		
						@4
						D=A
						@R13
						M=D
					
			@SP
      AM=M-1
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
		
					@12
					D=A
				
			@SP
			A=M
			M=D
			@SP
			M=M+1
		
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
    