/* ************************************************************************

   Copyright:
     2017 Zenesis Limited, http://www.zenesis.com

   License:
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * John Spackman @johnspackman (john.spackman@zenesis.com)

************************************************************************ */

import {
  createObjectKey, 
  createObjectProperty, 
  createArray,
  createObject,
  createLiteral
  } from './types';


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
    this.__indent += count;
    for (var i = 0; i < this.__indent; i++)
      str += "  ";
    var line = this.buffer.substring(this.__currentLine);
    if (!line.match(/[^\s]/)) {
      this.buffer = this.buffer.substring(0, this.__currentLine) + str;
    }
    this.__indentStr = str;
    
    return this;
  }
};

export function prettyPrint(ast) {
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
      writer.indent(-1).write("}");
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
      break;
      
    case "property":
      writeNode(node.key);
      writer.write(" : ");
      writeNode(node.value);
      break;
      
    case "identifier":
      writer.write("\"" + node.value + "\"");
      break;
      
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
    if (typeof token == "number")
      token = tokenList[token];
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

  var lastGoodToken = -1;
  function writeNode(node) {
    
    
    //throw new Error(" this needs work!! ");
    
    if (node.startToken === undefined) {
      if (lastGoodToken > -1) {
        while (tokenIndex <= lastGoodToken)
          writeToken(tokenList[tokenIndex++]);
      }
      output += prettyPrint(node);
      lastToken = null;
      return;
    }
    lastGoodToken = node.startToken;
    
    switch(node.type) {
    case "object":
      node.children.forEach(function(node) {
        if (node.key.startToken && node.value.startToken) {
          writeNode(node.key);
          writeNode(node.value);
        } else {
          writeNode(node);
        }
      });
      break;
      
    case "property":
      
    case "array":
      node.children.forEach(writeNode);
      break;
      
    default:
    }
  }
  
  writeNode(ast);
  
  if (lastGoodToken > -1) {
    while (tokenIndex <= lastGoodToken)
      writeToken(tokenList[tokenIndex++]);
  }
  
  return output;
}

export function astToObject(ast, settings) {
  var result;
  
  function writeNode(node) {
    switch (node.type) {
    case "object":
      result = {}; 
      node.children.forEach(function(child, index) {
        result[child.key.value] = writeNode(child.value);
      });
      break;
      
    case "array":
      result = [];
      node.children.forEach(function(child, index) {
        result.push(writeNode(child.value));
      });
      break;
      
    case "literal":
      result = node.value;
      break;
      
    default:
      throw new Error("Unexpected node type '" + node.type + "'");
    }
  }
  
  writeNode(ast);
  
  return result;
}

export function objectToAst(object, ast) {
  
  var tokenList = (ast && ast.tokenList)||null;
  
  function isArray(value) {
    return (
      value !== null && (
      value instanceof Array ||
      Object.prototype.toString.call(value) === "[object Array]")
    );
  }
  
  function isPlainObject(obj) {
    if (typeof obj === 'object' && obj !== null) {
      var proto = Object.getPrototypeOf(obj);
      return proto === Object.prototype || proto === null;
    }

    return false;
  }

  
  function deleteNode(node) {
    if (node && tokenList) {
      if (node.startToken) {
        delete tokenList[node.startToken];
        delete node.startToken;
      }
      if (node.children)
        node.children.forEach(deleteNode);
    }
  }
  
  function mergeIntoAst(object, ast) {
    if (isArray(object)) {
      if (ast === null || ast.type !== "array") {
        deleteNode(ast);
        ast = createArray();
      }
      var lookup = {};
      object.forEach(function(value, index) {
        lookup[index] = value;
      });
      for (var index = 0; index < ast.children.length; index++) {
        var child = ast.children[index];
        var match = lookup[index];
        if (match !== undefined) {
          delete lookup[index];
          mergeIntoAst(match, child.value);
        } else {
          deleteNode(child);
          ast.children.splice(index--, 1);
        }
      }
      for (var name in lookup) {
        var node = mergeIntoAst(lookup[name], null);
        ast.children.push(node);
      }
      
      
    } else if (isPlainObject(object)) {
      if (ast === null || ast.type != "object") {
        deleteNode(ast);
        ast = createObject();
      }
      var lookup = {};
      for (var name in object)
        lookup[name] = object[name];
      
      // Check existing properties
      for (var index = 0; index < ast.children.length; index++) {
        var child = ast.children[index];
        var key = child.key.value;
        var match = lookup[key];
        
        // Found existing property
        if (match !== undefined) {
          delete lookup[key];
          mergeIntoAst(match, child.value);
          
        // Deleted a property
        } else {
          deleteNode(child);
          ast.children.splice(index--, 1);
        }
      }
      
      // Add new properties
      for (var name in lookup) {
        var node = mergeIntoAst(lookup[name], null);
        ast.children.push(createObjectProperty(createObjectKey(name), node));
      }
    } else {
      if (ast !== null && ast.type !== "literal") {
        deleteNode(ast);
        ast = null;
      }
      if (ast === null || object !== ast.value) {
        deleteNode(ast);
        ast = createLiteral(object, "" + object);
      }
    }
    
    return ast;
  }
  
  return mergeIntoAst(object, ast||null);
}
