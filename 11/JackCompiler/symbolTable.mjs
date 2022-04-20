class SymbolTable {
  classScope = {};
  staticIndex = 0;
  fieldIndex = 0;
  subroutineScope = {};
  argumentIndex = 0;
  varIndex = 0;

  constructor() {}

  startSubroutine() {
    this.subroutineScope = {};
    this.argumentIndex = 0;
    this.varIndex = 0;
  }

  define(name, type, kind) {
    if (kind === "static" || kind === "field") {
      this.classScope[name] = {
        name,
        type,
        kind,
        index: this[`${kind}Index`]++,
      };
    } else if (kind === "argument" || kind === "var") {
      this.subroutineScope[name] = {
        name,
        type,
        kind,
        index: this[`${kind}Index`]++,
      };
    }
  }

  varCount(kind) {
    return this[`${kind}Index`];
  }

  kindOf(name) {
    if (this.subroutineScope[name] !== undefined) {
      return this.subroutineScope[name].kind;
    }
    if (this.classScope[name] !== undefined) {
      return this.classScope[name].kind;
    }
    return "NONE";
  }

  typeOf(name) {
    if (this.subroutineScope[name] !== undefined) {
      return this.subroutineScope[name].type;
    }
    if (this.classScope[name] !== undefined) {
      return this.classScope[name].type;
    }
  }

  indexOf(name) {
    if (this.subroutineScope[name] !== undefined) {
      return this.subroutineScope[name].index;
    }
    if (this.classScope[name] !== undefined) {
      return this.classScope[name].index;
    }
  }
}

export { SymbolTable };
