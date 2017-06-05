function Writer() {
  this.buffer = "";
}

Writer.prototype = {
  buffer: null,
  __indent: 0,
  __indentStr: "",
  __currentLine: 0,
  
  write: function(str) {
    var t = this;
    
    for (var index = 0; index < str.length; index++) {
      var pos = str.indexOf('\n');
      if (pos > -1) {
        this.buffer += str.substring(index, pos + 1);
        this.__currentLine = this.buffer.length;
        this.buffer += this.__indentStr;
        index = pos;
      } else {
        this.buffer += str.substring(index);
        break;
      }
    }
    
    return this;
  },
  
  comments: function(comments) {
    var t = this;
    if (comments) {
      comments.forEach(function(comment) {
        t.write(comment.source + "\n");
      });
    }
  },
  
  indent: function(count) {
    var str = "";
    for (var i = 0; i < count; i++)
      str += "  ";
    var line = this.buffer.substring(this.__currentLine);
    if (line == this.__indentStr) {
      this.buffer = this.buffer.substring(0, this.__currentLine) + str;
    }
    this.__indentStr = str;
    
    return this;
  }
};

export function pretty(ast) {
  var writer = new Writer();
  
  function writeNode(node) {
    switch (node.type) {
    case "object":
      writer.comments(node.leadingComments);
      writer.write("{\n").indent(+1);
      node.children.forEach(function(child, index) {
        if (index > 0)
          writer.write(",\n");
        writer.write("\"" + child.key.value + "\" : ");
        writeNode(child.value);
      });
      if (node.children.length)
        writer.write("\n");
      writer.comments(node.trailingComments);
      writer.indent(-1).write("}\n");
      break;
      
    case "array":
      writer.comments(node.leadingComments);
      writer.write("[\n").indent(+1);
      node.children.forEach(function(child, index) {
        if (index > 0)
          writer.write(",\n");
        writeNode(child.value);
      });
      if (node.children.length)
        writer.write("\n");
      writer.comments(node.trailingComments);
      writer.indent(-1).write("]\n");
      
    case "literal":
      writer.comments(node.leadingComments);
      writer.write(node.rawValue);
      writer.comments(node.trailingComments);
      break;
      
    default:
      throw new Error("Unexpected node type '" + node.type + "'");
    }
  }
  
  writeNode(ast);
  
  return writer.buffer;
}

export function rewrite(ast) {
  var output = "";
  var tokenList = ast.tokenList;
  var tokenIndex = 0;
  var lastToken = null;
  var lastLoc = null;
  
  function advanceTo(from, to) {
    var line = from.line;
    var column = from.column;
    while (line < to.line) {
      output += "\n";
      line++;
      column = 1;
    }
    while (column < to.column) {
      output += " ";
      column++;
    }
  }
  
  function writeToken(token) {
    if (token) {
      var nibs = [token];
      if (token.comments)
        nibs = nibs.concat(token.comments).sort(function(l,r) {
          l = l.loc.start;
          r = r.loc.start;
          if (l.line < r.line)
            return -1;
          if (l.line > r.line)
            return 1;
          return l.column < r.column ? -1 : l.column > r.column ? 1 : 0;
        });
      nibs.forEach(function(nib) {
        if (lastLoc != null) {
          advanceTo(lastLoc.end, nib.loc.start);
        }
        lastLoc = nib.loc;
        if (nib.rawValue !== undefined)
          output += nib.rawValue;
        else
          output += nib.value;
      });
      lastToken = token;
    } else {
      lastLoc = null;
      lastToken = null;
    }
  }
  
  function writeNode(node) {
    if (node.startToken === undefined) {
      pretty(node);
      lastToken = null;
      return;
    }
    
    while (tokenIndex <= node.endToken)
      writeToken(tokenList[tokenIndex++]);
  }
  
  writeNode(ast);
  
  return output;
}


