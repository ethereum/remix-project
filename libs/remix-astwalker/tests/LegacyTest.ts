import tape from "tape";
import { AstWalker, AstNodeLegacy } from "../src";
import node from "./resources/legacyAST";


tape("ASTWalker Legacy", (t: tape.Test) => {
  t.test("ASTWalker.walk && .walkAST", (st: tape.Test) => {
    st.plan(19);
    // New Ast Object
    const astWalker = new AstWalker();
    // EventListener
    astWalker.on("node", node => {
      if (node.name === "ContractDefinition") {
        checkContract(st, node);
      }
      if (node.name === "FunctionDefinition") {
        checkSetFunction(st, node);
        checkGetFunction(st, node);
      }
      if (node.name === "VariableDeclaration") {
        checkSetFunction(st, node);
        checkGetFunction(st, node);
      }
    });

    // Callback pattern
    astWalker.walk(node.legacyAST, (node: AstNodeLegacy) => {
      if (node.name === "ContractDefinition") {
        checkContract(st, node);
      }
      if (node.name === "FunctionDefinition") {
        checkSetFunction(st, node);
        checkGetFunction(st, node);
      }
      if (node.name === "VariableDeclaration") {
        checkSetFunction(st, node);
        checkGetFunction(st, node);
      }
    });

    // Callback Object
    var callback: any = {};
    callback.FunctionDefinition = function(node: AstNodeLegacy): boolean {
      st.equal(node.name, "FunctionDefinition");

      return true;
    };
    // Calling walk function with cb
    astWalker.walk(node.legacyAST, callback);

    // Calling walk function without cb
    astWalker.walk(node.legacyAST);

    // Calling WALKASTLIST function
    astWalker.walkAstList(node);
    // Calling walkASTList with new AST format
    astWalker.walkAstList(node);

    // Calling WALKASTLIST function with cb
    astWalker.walkAstList(node, node => {
      return true;
    });
    st.end();
  });
});

function checkContract(st: tape.Test, node: AstNodeLegacy) {
  st.equal(node.attributes.name, "Greeter");
  st.equal(node.children[1].attributes.name, "greeting");
  st.equal(node.children[1].attributes.type, "string");
  st.equal(node.children[2].name, "FunctionDefinition");
  st.equal(node.children[2].attributes.name, "");
}

function checkSetFunction(st: tape.Test, node: AstNodeLegacy) {
  if (node.attributes.name === "set") {
    st.equal(node.children[0].name, "ParameterList");
    st.equal(node.children[1].name, "ParameterList");
    st.equal(node.children[2].name, "Block");
    st.equal(node.children[2].children[1].name, "ExpressionStatement");
    checkExpressionStatement(st, node.children[2].children[0]);
  }
}

function checkGetFunction(st: tape.Test, node: AstNodeLegacy) {
  if (node.attributes.name === "get") {
    st.equal(node.children[0].name, "ParameterList");
    st.equal(node.children[1].name, "ParameterList");
    st.equal(node.children[2].name, "Block");
  }
}

function checkExpressionStatement(st: tape.Test, node: AstNodeLegacy) {
  st.equal(node.children[0].name, "Assignment");
  st.equal(node.children[0].attributes.operator, "=");
  st.equal(node.children[0].attributes.type, "int256");
  st.equal(node.children[0].children[0].name, "Identifier");
  st.equal(node.children[0].children[0].attributes.value, "x");
  st.equal(node.children[0].children[1].name, "Identifier");
  st.equal(node.children[0].children[1].attributes.value, "_x");
}
