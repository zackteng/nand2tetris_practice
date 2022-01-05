import { writeFileSync } from "fs";

const isOp = (symbol) =>
  ["+", "-", "*", "/", "&", "|", "<", ">", "="].includes(symbol);

const isUnaryOp = (symbol) => ["-", "~"].includes(symbol);

const isKeywordConstant = (keyword) =>
  ["true", "false", "null", "this"].includes(keyword);

class CompilationEngine {
  jackTokenizer = null;
  outputFilePath;
  constructor(jackTokenizer, outputFilePath) {
    this.jackTokenizer = jackTokenizer;
    this.outputFilePath = outputFilePath;
  }

  compileClass() {
    const result = [];
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      this.jackTokenizer.keyword() === "class"
    ) {
      result.push("<class>");
      result.push(`<keyword> ${this.jackTokenizer.keyword()} </keyword>`);
      this.jackTokenizer.advance();
      if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
        result.push(
          `<identifier> ${this.jackTokenizer.identifier()} </identifier>`
        );
      }
      this.jackTokenizer.advance();
      if (
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === "{"
      ) {
        result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
      }
      while (
        (this.jackTokenizer.advance(), this.jackTokenizer.hasMoreTokens())
      ) {
        if (
          this.jackTokenizer.tokenType() === "KEYWORD" &&
          (this.jackTokenizer.keyword() === "static" ||
            this.jackTokenizer.keyword() === "field")
        ) {
          const classVarDec = this.compileClassVarDec();
          result.push(classVarDec);
        } else if (
          this.jackTokenizer.tokenType() === "KEYWORD" &&
          (this.jackTokenizer.keyword() === "constructor" ||
            this.jackTokenizer.keyword() === "function" ||
            this.jackTokenizer.keyword() === "method")
        ) {
          const subroutineDec = this.compileSubroutine();
          result.push(subroutineDec);
        } else if (
          this.jackTokenizer.tokenType() === "SYMBOL" &&
          this.jackTokenizer.symbol() === "}"
        ) {
          result.push(
            `<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`
          );
        }
      }

      result.push("</class>");
    }
    // const xml = result.join("\n");
    // console.log(xml);
    writeFileSync(this.outputFilePath, result.join("\n"));
  }

  compileClassVarDec() {
    const result = [];
    result.push("<classVarDec>");
    result.push(`<keyword> ${this.jackTokenizer.keyword()} </keyword>`);
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      (this.jackTokenizer.keyword() === "int" ||
        this.jackTokenizer.keyword() === "char" ||
        this.jackTokenizer.keyword() === "boolean")
    ) {
      result.push(`<keyword> ${this.jackTokenizer.keyword()} </keyword>`);
    } else if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
      result.push(
        `<identifier> ${this.jackTokenizer.identifier()} </identifier>`
      );
    }
    this.jackTokenizer.advance();
    while (this.jackTokenizer.tokenType() === "IDENTIFIER") {
      result.push(
        `<identifier> ${this.jackTokenizer.identifier()} </identifier>`
      );
      this.jackTokenizer.advance();
      if (
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === ";"
      ) {
        result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
        break;
      } else if (
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === ","
      ) {
        result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
        this.jackTokenizer.advance();
      }
    }
    result.push("</classVarDec>");
    return result.join("\n");
  }

  compileSubroutine() {
    const result = [];
    result.push("<subroutineDec>");
    result.push(`<keyword> ${this.jackTokenizer.keyword()} </keyword>`);
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      this.jackTokenizer.keyword() === "void"
    ) {
      result.push(`<keyword> ${this.jackTokenizer.keyword()} </keyword>`);
    } else if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
      result.push(
        `<identifier> ${this.jackTokenizer.identifier()} </identifier>`
      );
    }
    this.jackTokenizer.advance();
    if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
      result.push(
        `<identifier> ${this.jackTokenizer.identifier()} </identifier>`
      );
    }
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === "("
    ) {
      result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
    }
    this.jackTokenizer.advance();

    // parameterList
    const parameterList = this.compileParameterList();
    result.push(parameterList);
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === ")"
    ) {
      result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
    }

    // body
    result.push("<subroutineBody>");
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === "{"
    ) {
      result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
    }

    // var dec
    while (
      (this.jackTokenizer.advance(),
      this.jackTokenizer.tokenType() === "KEYWORD" &&
        this.jackTokenizer.keyword() === "var")
    ) {
      const varDec = this.compileVarDec();
      result.push(varDec);
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
      const statements = this.compileStatements();
      result.push(statements);
    }

    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === "}"
    ) {
      result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
    }
    result.push("</subroutineBody>");

    result.push("</subroutineDec>");
    return result.join("\n");
  }

  compileParameterList() {
    const result = [];
    result.push("<parameterList>");
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
        result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
        this.jackTokenizer.advance();
        continue;
      } else if (
        this.jackTokenizer.tokenType() === "KEYWORD" &&
        (this.jackTokenizer.keyword() === "int" ||
          this.jackTokenizer.keyword() === "char" ||
          this.jackTokenizer.keyword() === "boolean")
      ) {
        result.push(`<keyword> ${this.jackTokenizer.keyword()} </keyword>`);
      } else if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
        result.push(
          `<identifier> ${this.jackTokenizer.identifier()} </identifier>`
        );
      }
      this.jackTokenizer.advance();
      if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
        result.push(
          `<identifier> ${this.jackTokenizer.identifier()} </identifier>`
        );
      }
      this.jackTokenizer.advance();
    }
    result.push("</parameterList>");
    return result.join("\n");
  }

  compileVarDec() {
    const result = [];
    result.push("<varDec>");
    result.push(`<keyword> ${this.jackTokenizer.keyword()} </keyword>`);
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      (this.jackTokenizer.keyword() === "int" ||
        this.jackTokenizer.keyword() === "char" ||
        this.jackTokenizer.keyword() === "boolean")
    ) {
      result.push(`<keyword> ${this.jackTokenizer.keyword()} </keyword>`);
    } else if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
      result.push(
        `<identifier> ${this.jackTokenizer.identifier()} </identifier>`
      );
    }
    this.jackTokenizer.advance();
    while (this.jackTokenizer.tokenType() === "IDENTIFIER") {
      result.push(
        `<identifier> ${this.jackTokenizer.identifier()} </identifier>`
      );
      this.jackTokenizer.advance();
      if (
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === ";"
      ) {
        result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
        break;
      } else if (
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === ","
      ) {
        result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
        this.jackTokenizer.advance();
      }
    }
    result.push("</varDec>");
    return result.join("\n");
  }

  compileStatements() {
    const result = [];
    result.push("<statements>");
    while (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      (this.jackTokenizer.keyword() === "let" ||
        this.jackTokenizer.keyword() === "if" ||
        this.jackTokenizer.keyword() === "while" ||
        this.jackTokenizer.keyword() === "do" ||
        this.jackTokenizer.keyword() === "return")
    ) {
      if (this.jackTokenizer.keyword() === "let") {
        const letStatement = this.compileLet();
        result.push(letStatement);
        this.jackTokenizer.advance();
      } else if (this.jackTokenizer.keyword() === "if") {
        const ifStatement = this.compileIf();
        result.push(ifStatement);
      } else if (this.jackTokenizer.keyword() === "while") {
        const whileStatement = this.compileWhile();
        result.push(whileStatement);
        this.jackTokenizer.advance();
      } else if (this.jackTokenizer.keyword() === "do") {
        const doStatement = this.compileDo();
        result.push(doStatement);
        this.jackTokenizer.advance();
      } else if (this.jackTokenizer.keyword() === "return") {
        const returnStatement = this.compileReturn();
        result.push(returnStatement);
        this.jackTokenizer.advance();
      }
    }
    result.push("</statements>");
    return result.join("\n");
  }

  compileDo() {
    const result = [];
    result.push("<doStatement>");
    if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      this.jackTokenizer.keyword() === "do"
    ) {
      result.push(`<keyword> ${this.jackTokenizer.keyword()} </keyword>`);
    }
    this.jackTokenizer.advance();
    if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
      result.push(
        `<identifier> ${this.jackTokenizer.identifier()} </identifier>`
      );
    }
    this.jackTokenizer.advance();
    if (this.jackTokenizer.tokenType() === "SYMBOL") {
      if (this.jackTokenizer.symbol() === "(") {
        // subroutineName'('expressionList')'
        result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
        this.jackTokenizer.advance();
        const expressionList = this.compileExpressionList();
        result.push(expressionList);
        if (
          this.jackTokenizer.tokenType() === "SYMBOL" &&
          this.jackTokenizer.symbol() === ")"
        ) {
          result.push(
            `<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`
          );
        }
      } else if (this.jackTokenizer.symbol() === ".") {
        // (className|varName)'.'subroutineName'('expressionList')'
        result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
        this.jackTokenizer.advance();
        if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
          result.push(
            `<identifier> ${this.jackTokenizer.identifier()} </identifier>`
          );
        }
        this.jackTokenizer.advance();
        if (
          this.jackTokenizer.tokenType() === "SYMBOL" &&
          this.jackTokenizer.symbol() === "("
        ) {
          result.push(
            `<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`
          );
        }
        this.jackTokenizer.advance();
        const expressionList = this.compileExpressionList();
        result.push(expressionList);
        if (
          this.jackTokenizer.tokenType() === "SYMBOL" &&
          this.jackTokenizer.symbol() === ")"
        ) {
          result.push(
            `<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`
          );
        }
      }
      this.jackTokenizer.advance();
      if (
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === ";"
      ) {
        result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
      }
    }
    result.push("</doStatement>");
    return result.join("\n");
  }

  compileLet() {
    const result = [];
    result.push("<letStatement>");
    if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      this.jackTokenizer.keyword() === "let"
    ) {
      result.push(`<keyword> ${this.jackTokenizer.keyword()} </keyword>`);
    }
    this.jackTokenizer.advance();
    if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
      result.push(
        `<identifier> ${this.jackTokenizer.identifier()} </identifier>`
      );
    }
    this.jackTokenizer.advance();
    if (this.jackTokenizer.tokenType() === "SYMBOL") {
      if (this.jackTokenizer.symbol() === "[") {
        result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
        // expression
        this.jackTokenizer.advance();
        const expression1 = this.compileExpression();
        result.push(expression1);
        if (
          this.jackTokenizer.tokenType() === "SYMBOL" &&
          this.jackTokenizer.symbol() === "]"
        ) {
          result.push(
            `<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`
          );
        }
        this.jackTokenizer.advance();
        if (this.jackTokenizer.symbol() === "=") {
          result.push(
            `<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`
          );
        }
      } else if (this.jackTokenizer.symbol() === "=") {
        result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
      }
    }
    // expression
    this.jackTokenizer.advance();
    const expression2 = this.compileExpression();
    result.push(expression2);
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === ";"
    ) {
      result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
    }
    result.push("</letStatement>");
    return result.join("\n");
  }

  compileWhile() {
    const result = [];
    result.push("<whileStatement>");
    if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      this.jackTokenizer.keyword() === "while"
    ) {
      result.push(`<keyword> ${this.jackTokenizer.keyword()} </keyword>`);
    }
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === "("
    ) {
      result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
    }
    this.jackTokenizer.advance();
    const expression = this.compileExpression();
    result.push(expression);
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === ")"
    ) {
      result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
    }
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === "{"
    ) {
      result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
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
      const statements = this.compileStatements();
      result.push(statements);
    }
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === "}"
    ) {
      result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
    }
    result.push("</whileStatement>");
    return result.join("\n");
  }

  compileReturn() {
    const result = [];
    result.push("<returnStatement>");
    if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      this.jackTokenizer.keyword() === "return"
    ) {
      result.push(`<keyword> ${this.jackTokenizer.keyword()} </keyword>`);
    }
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === ";"
    ) {
      result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
    } else {
      const expression = this.compileExpression();
      result.push(expression);
      if (
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === ";"
      ) {
        result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
      }
    }
    result.push("</returnStatement>");
    return result.join("\n");
  }

  compileIf() {
    const result = [];
    result.push("<ifStatement>");
    if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      this.jackTokenizer.keyword() === "if"
    ) {
      result.push(`<keyword> ${this.jackTokenizer.keyword()} </keyword>`);
    }
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === "("
    ) {
      result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
    }
    this.jackTokenizer.advance();
    const expression = this.compileExpression();
    result.push(expression);
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === ")"
    ) {
      result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
    }
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === "{"
    ) {
      result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
    }
    this.jackTokenizer.advance();
    const statements = this.compileStatements();
    result.push(statements);
    if (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      this.jackTokenizer.symbol() === "}"
    ) {
      result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
    }
    this.jackTokenizer.advance();
    if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      this.jackTokenizer.keyword() === "else"
    ) {
      result.push(`<keyword> ${this.jackTokenizer.keyword()} </keyword>`);
      this.jackTokenizer.advance();
      if (
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === "{"
      ) {
        result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
      }
      this.jackTokenizer.advance();
      const statements = this.compileStatements();
      result.push(statements);
      if (
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === "}"
      ) {
        result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
      }
      this.jackTokenizer.advance();
    }

    result.push("</ifStatement>");
    return result.join("\n");
  }

  compileExpression() {
    const result = [];
    result.push("<expression>");
    const term1 = this.compileTerm();
    result.push(term1);
    while (
      this.jackTokenizer.tokenType() === "SYMBOL" &&
      isOp(this.jackTokenizer.symbol())
    ) {
      result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
      this.jackTokenizer.advance();
      const term2 = this.compileTerm();
      result.push(term2);
    }
    result.push("</expression>");
    return result.join("\n");
  }

  compileTerm() {
    const result = [];
    result.push("<term>");
    if (this.jackTokenizer.tokenType() === "INT-CONST") {
      result.push(
        `<integerConstant> ${this.jackTokenizer.intVal()} </integerConstant>`
      );
      this.jackTokenizer.advance();
    } else if (this.jackTokenizer.tokenType() === "STRING-CONST") {
      result.push(
        `<stringConstant> ${this.jackTokenizer.stringVal()} </stringConstant>`
      );
      this.jackTokenizer.advance();
    } else if (
      this.jackTokenizer.tokenType() === "KEYWORD" &&
      isKeywordConstant(this.jackTokenizer.keyword())
    ) {
      result.push(`<keyword> ${this.jackTokenizer.keyword()} </keyword>`);
      this.jackTokenizer.advance();
    } else if (this.jackTokenizer.tokenType() === "SYMBOL") {
      if (isUnaryOp(this.jackTokenizer.symbol())) {
        result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
        this.jackTokenizer.advance();
        const term = this.compileTerm();
        result.push(term);
      } else if (this.jackTokenizer.symbol() === "(") {
        result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
        this.jackTokenizer.advance();
        const expression = this.compileExpression();
        result.push(expression);
        if (
          this.jackTokenizer.tokenType() === "SYMBOL" &&
          this.jackTokenizer.symbol() === ")"
        ) {
          result.push(
            `<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`
          );
        }
        this.jackTokenizer.advance();
      }
    } else if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
      result.push(
        `<identifier> ${this.jackTokenizer.identifier()} </identifier>`
      );
      this.jackTokenizer.advance();
      if (this.jackTokenizer.tokenType() === "SYMBOL") {
        if (this.jackTokenizer.symbol() === "[") {
          result.push(
            `<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`
          );
          this.jackTokenizer.advance();
          const expression = this.compileExpression();
          result.push(expression);
          if (
            this.jackTokenizer.tokenType() === "SYMBOL" &&
            this.jackTokenizer.symbol() === "]"
          ) {
            result.push(
              `<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`
            );
          }
          this.jackTokenizer.advance();
        } else if (this.jackTokenizer.symbol() === "(") {
          // subroutineName'('expressionList')'
          result.push(
            `<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`
          );
          this.jackTokenizer.advance();
          const expressionList = this.compileExpressionList();
          result.push(expressionList);
          if (
            this.jackTokenizer.tokenType() === "SYMBOL" &&
            this.jackTokenizer.symbol() === ")"
          ) {
            result.push(
              `<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`
            );
          }
          this.jackTokenizer.advance();
        } else if (this.jackTokenizer.symbol() === ".") {
          // (className|varName)'.'subroutineName'('expressionList')'
          result.push(
            `<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`
          );
          this.jackTokenizer.advance();
          if (this.jackTokenizer.tokenType() === "IDENTIFIER") {
            result.push(
              `<identifier> ${this.jackTokenizer.identifier()} </identifier>`
            );
          }
          this.jackTokenizer.advance();
          if (
            this.jackTokenizer.tokenType() === "SYMBOL" &&
            this.jackTokenizer.symbol() === "("
          ) {
            result.push(
              `<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`
            );
          }
          this.jackTokenizer.advance();
          const expressionList = this.compileExpressionList();
          result.push(expressionList);
          if (
            this.jackTokenizer.tokenType() === "SYMBOL" &&
            this.jackTokenizer.symbol() === ")"
          ) {
            result.push(
              `<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`
            );
          }
          this.jackTokenizer.advance();
        }
      }
    }
    result.push("</term>");
    return result.join("\n");
  }

  compileExpressionList() {
    const result = [];
    result.push("<expressionList>");
    if (
      !(
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === ")"
      )
    ) {
      const expression1 = this.compileExpression();
      result.push(expression1);
      while (
        this.jackTokenizer.tokenType() === "SYMBOL" &&
        this.jackTokenizer.symbol() === ","
      ) {
        result.push(`<symbol> ${this.jackTokenizer.escapeSymbol()} </symbol>`);
        this.jackTokenizer.advance();
        const expression2 = this.compileExpression();
        result.push(expression2);
      }
    }
    result.push("</expressionList>");
    return result.join("\n");
  }
}

export { CompilationEngine };
