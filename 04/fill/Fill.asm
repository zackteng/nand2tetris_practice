// This file is part of www.nand2tetris.org
// and the book "The Elements of Computing Systems"
// by Nisan and Schocken, MIT Press.
// File name: projects/04/Fill.asm

// Runs an infinite loop that listens to the keyboard input.
// When a key is pressed (any key), the program blackens the screen,
// i.e. writes "black" in every pixel;
// the screen should remain fully black as long as the key is pressed. 
// When no key is pressed, the program clears the screen, i.e. writes
// "white" in every pixel;
// the screen should remain fully clear as long as no key is pressed.

// Put your code here.
// 设置初始数据 R0-R15保存对应的0-15为为1的情况数值 index是当前填充的字 offset是当前填充的位
@R0
M=1
@3
D=A
@R1
M=D
@7
D=A
@R2
M=D
@15
D=A
@R3
M=D
@31
D=A
@R4
M=D
@63
D=A
@R5
M=D
@127
D=A
@R6
M=D
@255
D=A
@R7
M=D
@511
D=A
@R8
M=D
@1023
D=A
@R9
M=D
@2047
D=A
@R10
M=D
@4095
D=A
@R11
M=D
@8191
D=A
@R12
M=D
@16383
D=A
@R13
M=D
@32767
D=A
@R14
M=D
@R15
M=-1
@SCREEN
D=A
@index // current screen pixel index
M=D
@offset // current screen pixel offset
M=0
// @KBD
// M=1

(LOOP)
@KBD
D=M
@KEYZERO
D;JEQ
// 当键盘缓冲区有字符的时候 从前往后填充黑色 先判断index是否超过了最大值(24575) 超过了跳回到起始LOOP
@index
D=M
@KBD
D=D-A
@LOOP
D;JEQ
@offset
A=M
D=M
@index
A=M
M=D
@offset
D=M
@15
D=D-A
@NEXTUNIT
D;JGE
@offset
M=M+1
@LOOP
0;JMP
(NEXTUNIT)
@offset
M=0
@index
M=M+1
@LOOP
0;JMP
// 当键盘缓冲区没有字符的时候 从后往前回填白色 先判断offset有没有到0
(KEYZERO)
@offset
D=M
@PREVUNIT
D;JLE
// 当前offset还没到0
@offset
AM=M-1
D=M
@index
A=M
M=D
// 当前offset已经到0 需要回到上个index 先将当前@index置为0 再判断@index是否已经到了最起始的地方
(PREVUNIT)
@index
A=M
M=0
@index
D=M
@16384
D=D-A
@LOOP
D;JLE
// 没有到最起始地方 当前index的字填充0 offset填充15 并回到上个字
@15
D=A
@offset
M=D
@index
M=M-1
@LOOP
0;JMP