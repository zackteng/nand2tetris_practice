const isOp = (symbol) =>
  ["+", "-", "*", "/", "&", "|", "<", ">", "="].includes(symbol);

const opMap = {
  "+": "add",
  "-": "sub",
  "&": "and",
  "|": "or",
  "<": "lt",
  ">": "gt",
  "=": "eq",
};

const isUnaryOp = (symbol) => ["-", "~"].includes(symbol);
const unaryOpMap = { "-": "neg", "~": "not" };

const isKeywordConstant = (keyword) =>
  ["true", "false", "null", "this"].includes(keyword);

const kindMap = {
  static: "static",
  field: "this",
  argument: "argument",
  var: "local",
};

class CompilationEngine {
  jackTokenizer = null;
  symbolTable = null;
  vmWriter = null;
  className = "";
  labelCount = 0;

  constructor(jackTokenizer, symbolTable, vmWriter) {
    this.jackTokenizer = jackTokenizer;
    this.symbolTable = symbolTable;
    this.vmWriter = vmWriter;
  }

  compileClass() {
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      this.jackTokenizer.keyword() === "class"
    ) {
      this.jackTokenizer.advance();
      if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
        this.className = this.jackTokenizer.identifier();
      }
      this.jackTokenizer.advance();
      if (
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === "{"
      ) {
      }
      while (
        (this.jackTokenizer.advance(), this.jackTokenizer.hasMoreTokens())
      ) {
        if (
          this.jackTokenizer.tokenType() === "KEYWORD" &&
          (this.jackTokenizer.keyword() === "static" ||
            this.jackTokenizer.keyword() === "field")
        ) {
          this.compileClassVarDec();
        } else if (
          this.jackTokenizer.tokenType() === "KEYWORD" &&
          (this.jackTokenizer.keyword() === "constructor" ||
            this.jackTokenizer.keyword() === "function" ||
            this.jackTokenizer.keyword() === "method")
        ) {
          this.compileSubroutine();
        } else if (
          this.jackTokenizer.tokenType() === "SYMBOL" &&
          this.jackTokenizer.symbol() === "}"
        ) {
        }
      }
    }
    this.vmWriter.close();
  }

  compileClassVarDec() {
    let kind = this.jackTokenizer.keyword();
    let type = null;
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      (this.jackTokenizer.keyword() === "int" ||
        this.jackTokenizer.keyword() === "char" ||
        this.jackTokenizer.keyword() === "boolean")
    ) {
      type = this.jackTokenizer.keyword();
    } else if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
      type = this.jackTokenizer.identifier();
    }
    this.jackTokenizer.advance();
    while (this.jackTokenizer.tokenType() === "IDENTIFIER") {
      this.symbolTable.define(this.jackTokenizer.identifier(), type, kind);
      this.jackTokenizer.advance();
      if (
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === ";"
      ) {
        break;
      } else if (
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === ","
      ) {
        this.jackTokenizer.advance();
      }
    }
  }

  compileSubroutine() {
    this.symbolTable.startSubroutine();

    const kind = this.jackTokenizer.keyword();
    let name = "";

    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      this.jackTokenizer.keyword() === "void"
    ) {
    } else if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
    }
    this.jackTokenizer.advance();
    if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
      name = this.jackTokenizer.identifier();
    }
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === "("
    ) {
    }
    this.jackTokenizer.advance();

    // 先让this占据符号表里argument的第一个位置 因为this是第一个参数
    if (kind === "method") {
      this.symbolTable.define("this", this.className, "argument");
    }

    // parameterList
    this.compileParameterList();

    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === ")"
    ) {
    }

    // body
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === "{"
    ) {
    }

    // var dec
    let functionVarCount = 0;
    while (
      (this.jackTokenizer.advance(),
      this.jackTokenizer.tokenType() === "KEYWORD" &&
        this.jackTokenizer.keyword() === "var")
    ) {
      const varCount = this.compileVarDec();
      functionVarCount += varCount;
    }

    // 如果是方法 形参个数要算上this
    this.vmWriter.writeFunction(`${this.className}.${name}`, functionVarCount);

    // 如果是constructor 要分配this的内存
    if (kind === "constructor") {
      const memorySize = this.symbolTable.varCount("field");
      this.vmWriter.writePush("constant", memorySize);
      this.vmWriter.writeCall("Memory.alloc", 1);
      this.vmWriter.writePop("pointer", 0);
    }

    // 如果是方法 则把this当形参的第一个参数
    if (kind === "method") {
      // 将argument段的第0个参数放入pointer段的第0个位置(this)
      this.vmWriter.writePush("argument", 0);
      this.vmWriter.writePop("pointer", 0);
    }

    //statements
    if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      (this.jackTokenizer.keyword() === "let" ||
        this.jackTokenizer.keyword() === "if" ||
        this.jackTokenizer.keyword() === "while" ||
        this.jackTokenizer.keyword() === "do" ||
        this.jackTokenizer.keyword() === "return")
    ) {
      this.compileStatements();
    }

    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === "}"
    ) {
    }
  }

  compileParameterList() {
    let type = null;
    while (
      !(
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === ")"
      )
    ) {
      if (
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === ","
      ) {
        this.jackTokenizer.advance();
        continue;
      } else if (
        this.jackTokenizer.tokenType() === "KEYWORD" &&
        (this.jackTokenizer.keyword() === "int" ||
          this.jackTokenizer.keyword() === "char" ||
          this.jackTokenizer.keyword() === "boolean")
      ) {
        type = this.jackTokenizer.keyword();
      } else if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
        type = this.jackTokenizer.identifier();
      }
      this.jackTokenizer.advance();
      if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
        // 将栈里的参数放入到argument段里面去
        this.symbolTable.define(
          this.jackTokenizer.identifier(),
          type,
          "argument"
        );
      }
      this.jackTokenizer.advance();
    }
  }

  compileVarDec() {
    let type = null;
    let varCount = 0;
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      (this.jackTokenizer.keyword() === "int" ||
        this.jackTokenizer.keyword() === "char" ||
        this.jackTokenizer.keyword() === "boolean")
    ) {
      type = this.jackTokenizer.keyword();
    } else if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
      type = this.jackTokenizer.identifier();
    }
    this.jackTokenizer.advance();
    while (this.jackTokenizer.tokenType() === "IDENTIFIER") {
      varCount += 1;
      this.symbolTable.define(this.jackTokenizer.identifier(), type, "var");
      this.jackTokenizer.advance();
      if (
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === ";"
      ) {
        break;
      } else if (
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === ","
      ) {
        this.jackTokenizer.advance();
      }
    }
    return varCount;
  }

  compileStatements() {
    while (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      (this.jackTokenizer.keyword() === "let" ||
        this.jackTokenizer.keyword() === "if" ||
        this.jackTokenizer.keyword() === "while" ||
        this.jackTokenizer.keyword() === "do" ||
        this.jackTokenizer.keyword() === "return")
    ) {
      if (this.jackTokenizer.keyword() === "let") {
        this.compileLet();
        this.jackTokenizer.advance();
      } else if (this.jackTokenizer.keyword() === "if") {
        this.compileIf();
      } else if (this.jackTokenizer.keyword() === "while") {
        this.compileWhile();
        this.jackTokenizer.advance();
      } else if (this.jackTokenizer.keyword() === "do") {
        this.compileDo();
        this.jackTokenizer.advance();
      } else if (this.jackTokenizer.keyword() === "return") {
        this.compileReturn();
        this.jackTokenizer.advance();
      }
    }
  }

  compileDo() {
    let name = "";
    if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      this.jackTokenizer.keyword() === "do"
    ) {
    }
    this.jackTokenizer.advance();
    if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
      name = this.jackTokenizer.identifier();
    }
    this.jackTokenizer.advance();
    if (this.jackTokenizer.tokenType() === "SYMBOL") {
      if (this.jackTokenizer.symbol() === "(") {
        // subroutineName'('expressionList')'
        this.jackTokenizer.advance();
        // 直接调用当做是本地方法 需要将this压栈
        this.vmWriter.writePush("pointer", 0);
        const argumentCount = this.compileExpressionList();
        if (
          this.jackTokenizer.tokenType() === "SYMBOL" &&
          this.jackTokenizer.symbol() === ")"
        ) {
          this.vmWriter.writeCall(
            `${this.className}.${name}`,
            argumentCount + 1
          );
        }
      } else if (this.jackTokenizer.symbol() === ".") {
        // (className|varName)'.'subroutineName'('expressionList')'
        const kind = this.symbolTable.kindOf(name);
        const type = this.symbolTable.typeOf(name);
        const index = this.symbolTable.indexOf(name);
        let subName = "";
        this.jackTokenizer.advance();
        if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
          subName = this.jackTokenizer.identifier();
        }
        this.jackTokenizer.advance();
        if (
          this.jackTokenizer.tokenType() === "SYMBOL" &&
          this.jackTokenizer.symbol() === "("
        ) {
          if (kind !== "NONE") {
            //对象方法调用 第一个参数传this
            this.vmWriter.writePush(kindMap[kind], index);
          }
        }
        this.jackTokenizer.advance();
        const argumentCount = this.compileExpressionList();
        if (
          this.jackTokenizer.tokenType() === "SYMBOL" &&
          this.jackTokenizer.symbol() === ")"
        ) {
          if (kind === "NONE") {
            // 类函数调用调用
            this.vmWriter.writeCall(`${name}.${subName}`, argumentCount);
          } else {
            // 对象方法调用
            this.vmWriter.writeCall(`${type}.${subName}`, argumentCount + 1);
          }
        }
      }
      this.jackTokenizer.advance();
      if (
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === ";"
      ) {
        // 取出函数返回值 并忽略
        this.vmWriter.writePop("temp", 0);
      }
    }
  }

  compileLet() {
    let name = "";
    let isArray = false;
    if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      this.jackTokenizer.keyword() === "let"
    ) {
    }
    this.jackTokenizer.advance();
    if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
      name = this.jackTokenizer.identifier();
    }
    this.jackTokenizer.advance();
    if (this.jackTokenizer.tokenType() === "SYMBOL") {
      if (this.jackTokenizer.symbol() === "[") {
        // expression
        this.jackTokenizer.advance();
        this.compileExpression();
        if (
          this.jackTokenizer.tokenType() === "SYMBOL" &&
          this.jackTokenizer.symbol() === "]"
        ) {
          isArray = true;
        }
        this.jackTokenizer.advance();
        if (this.jackTokenizer.symbol() === "=") {
        }
      } else if (this.jackTokenizer.symbol() === "=") {
      }
    }
    // expression
    this.jackTokenizer.advance();
    this.compileExpression();
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === ";"
    ) {
      const kind = this.symbolTable.kindOf(name);
      const index = this.symbolTable.indexOf(name);
      if (isArray) {
        // 将等于号后面的表达式的值先存起来
        this.vmWriter.writePop("temp", 0);
        this.vmWriter.writePush(kindMap[kind], index);
        this.vmWriter.writeArithmetic("add");
        this.vmWriter.writePop("pointer", 1);
        this.vmWriter.writePush("temp", 0);
        this.vmWriter.writePop("that", 0);
      } else {
        this.vmWriter.writePop(kindMap[kind], index);
      }
    }
  }

  compileWhile() {
    const currentLabelCount = this.labelCount;
    this.labelCount += 1;
    if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      this.jackTokenizer.keyword() === "while"
    ) {
    }
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === "("
    ) {
      this.vmWriter.writeLabel(`${this.className}.${currentLabelCount}.WHILE`);
    }
    this.jackTokenizer.advance();
    this.compileExpression();
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === ")"
    ) {
      this.vmWriter.writeArithmetic("not");
    }
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === "{"
    ) {
      this.vmWriter.writeIf(`${this.className}.${currentLabelCount}.WHILE_END`);
    }
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      (this.jackTokenizer.keyword() === "let" ||
        this.jackTokenizer.keyword() === "if" ||
        this.jackTokenizer.keyword() === "while" ||
        this.jackTokenizer.keyword() === "do" ||
        this.jackTokenizer.keyword() === "return")
    ) {
      this.compileStatements();
      this.vmWriter.writeGoto(`${this.className}.${currentLabelCount}.WHILE`);
    }
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === "}"
    ) {
      this.vmWriter.writeLabel(
        `${this.className}.${currentLabelCount}.WHILE_END`
      );
    }
  }

  compileReturn() {
    if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      this.jackTokenizer.keyword() === "return"
    ) {
    }
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === ";"
    ) {
      // 没有返回值的默认返回0
      this.vmWriter.writePush("constant", 0);
    } else {
      // 表达式已经计算并将结果放在在栈顶
      this.compileExpression();
      if (
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === ";"
      ) {
      }
    }
    this.vmWriter.writeReturn();
  }

  compileIf() {
    const currentLabelCount = this.labelCount;
    this.labelCount += 1;
    if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      this.jackTokenizer.keyword() === "if"
    ) {
    }
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === "("
    ) {
    }
    this.jackTokenizer.advance();
    this.compileExpression();
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === ")"
    ) {
      this.vmWriter.writeArithmetic('not');
    }
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === "{"
    ) {
      this.vmWriter.writeIf(`${this.className}.${currentLabelCount}.IF_FALSE`);
    }
    this.jackTokenizer.advance();
    this.compileStatements();
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === "}"
    ) {
      this.vmWriter.writeGoto(`${this.className}.${currentLabelCount}.IF_END`);
      this.vmWriter.writeLabel(
        `${this.className}.${currentLabelCount}.IF_FALSE`
      );
    }
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      this.jackTokenizer.keyword() === "else"
    ) {
      this.jackTokenizer.advance();
      if (
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === "{"
      ) {
      }
      this.jackTokenizer.advance();
      this.compileStatements();
      if (
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === "}"
      ) {
      }
      this.jackTokenizer.advance();
    }
    this.vmWriter.writeLabel(`${this.className}.${currentLabelCount}.IF_END`);
  }

  compileExpression() {
    this.compileTerm();
    while (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      isOp(this.jackTokenizer.symbol())
    ) {
      const operator = this.jackTokenizer.symbol();
      this.jackTokenizer.advance();
      this.compileTerm();
      if (operator === "*") {
        this.vmWriter.writeCall("Math.multiply", 2);
      } else if (operator === "/") {
        this.vmWriter.writeCall("Math.divide", 2);
      } else {
        this.vmWriter.writeArithmetic(opMap[operator]);
      }
    }
  }

  compileTerm() {
    if (this.jackTokenizer.tokenType() === "INT-CONST") {
      this.vmWriter.writePush("constant", this.jackTokenizer.intVal());
      this.jackTokenizer.advance();
    } else if (this.jackTokenizer.tokenType() === "STRING-CONST") {
      this.vmWriter.writePush(
        "constant",
        this.jackTokenizer.stringVal().length
      );
      this.vmWriter.writeCall("String.new", 1);
      this.jackTokenizer
        .stringVal()
        .split("")
        .forEach((char) => {
          this.vmWriter.writePush("constant", char.charCodeAt());
          // 调用对象方法需要将对象压栈 参数个需要 +1
          this.vmWriter.writeCall("String.appendChar", 2);
        });
      this.jackTokenizer.advance();
    } else if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      isKeywordConstant(this.jackTokenizer.keyword())
    ) {
      if (this.jackTokenizer.keyword() === "this") {
        this.vmWriter.writePush("pointer", 0);
      } else if (this.jackTokenizer.keyword() === "true") {
        this.vmWriter.writePush("constant", 1);
        this.vmWriter.writeArithmetic("neg");
      } else {
        this.vmWriter.writePush("constant", 0);
      }
      this.jackTokenizer.advance();
    } else if (this.jackTokenizer.tokenType() === "SYMBOL") {
      if (isUnaryOp(this.jackTokenizer.symbol())) {
        const operator = this.jackTokenizer.symbol();
        this.jackTokenizer.advance();
        this.compileTerm();
        this.vmWriter.writeArithmetic(unaryOpMap[operator]);
      } else if (this.jackTokenizer.symbol() === "(") {
        this.jackTokenizer.advance();
        this.compileExpression();
        if (
          this.jackTokenizer.tokenType() === "SYMBOL" &&
          this.jackTokenizer.symbol() === ")"
        ) {
        }
        this.jackTokenizer.advance();
      }
    } else if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
      const name = this.jackTokenizer.identifier();

      const kind = this.symbolTable.kindOf(name);
      const type = this.symbolTable.typeOf(name);
      const index = this.symbolTable.indexOf(name);

      this.jackTokenizer.advance();
      if (this.jackTokenizer.tokenType() === "SYMBOL") {
        if (this.jackTokenizer.symbol() === "[") {
          this.vmWriter.writePush(kindMap[kind], index);
          this.jackTokenizer.advance();
          this.compileExpression();
          this.vmWriter.writeArithmetic("add");
          this.vmWriter.writePop("pointer", 1);
          this.vmWriter.writePush("that", 0);
          if (
            this.jackTokenizer.tokenType() === "SYMBOL" &&
            this.jackTokenizer.symbol() === "]"
          ) {
          }
          this.jackTokenizer.advance();
        } else if (this.jackTokenizer.symbol() === "(") {
          // subroutineName'('expressionList')'
          //函数调用
          this.jackTokenizer.advance();
          const argumentCount = this.compileExpressionList();
          if (
            this.jackTokenizer.tokenType() === "SYMBOL" &&
            this.jackTokenizer.symbol() === ")"
          ) {
            // 直接调用当做是本地方法 需要将this压栈
            this.vmWriter.writePush("pointer", 0);
            this.vmWriter.writeCall(
              `${this.className}.${name}`,
              argumentCount + 1
            );
          }
          this.jackTokenizer.advance();
        } else if (this.jackTokenizer.symbol() === ".") {
          // (className|varName)'.'subroutineName'('expressionList')'
          let subName = "";
          this.jackTokenizer.advance();
          if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
            subName = this.jackTokenizer.identifier();
          }
          this.jackTokenizer.advance();
          if (
            this.jackTokenizer.tokenType() === "SYMBOL" &&
            this.jackTokenizer.symbol() === "("
          ) {
            if (kind !== "NONE") {
              //对象方法调用 第一个参数传this
              this.vmWriter.writePush(kindMap[kind], index);
            }
          }
          this.jackTokenizer.advance();
          const argumentCount = this.compileExpressionList();
          if (
            this.jackTokenizer.tokenType() === "SYMBOL" &&
            this.jackTokenizer.symbol() === ")"
          ) {
            if (kind === "NONE") {
              // 类函数调用调用
              this.vmWriter.writeCall(`${name}.${subName}`, argumentCount);
            } else {
              // 对象方法调用
              this.vmWriter.writeCall(`${type}.${subName}`, argumentCount + 1);
            }
          }
          this.jackTokenizer.advance();
        } else {
          // 纯纯的变量
          this.vmWriter.writePush(kindMap[kind], index);
        }
      }
    }
  }

  compileExpressionList() {
    let count = 0;
    if (
      !(
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === ")"
      )
    ) {
      this.compileExpression();
      count = count + 1;
      while (
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === ","
      ) {
        this.jackTokenizer.advance();
        this.compileExpression();
        count = count + 1;
      }
    }
    return count;
  }
}

export { CompilationEngine };
