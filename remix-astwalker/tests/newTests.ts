import tape from "tape";
import { AstWalker, AstNode } from "../src";
import node from "./resources/newAST";

tape("New ASTWalker", (t: tape.Test) => {
  t.test("ASTWalker.walk && .walkAST", (st: tape.Test) => {
    st.plan(24);
    // New Ast Object
    const astWalker = new AstWalker();
    // EventListener
    astWalker.on("node", node => {
      if (node.nodeType === "ContractDefinition") {
        checkContract(st, node);
      }

      if (node.nodeType === "PragmaDirective") {
        checkProgramDirective(st, node);
      }
    });

    // Callback pattern
    astWalker.walk(node.ast, (node: AstNode) => {
      if (node.nodeType === "ContractDefinition") {
        checkContract(st, node);
      }

      if (node.nodeType === "PragmaDirective") {
        checkProgramDirective(st, node);
      }
    });

    // Callback Object
    var callback: any = {};
    callback.FunctionDefinition = function(node: AstNode): boolean {
      st.equal(node.name, "FunctionDefinition");

      return true;
    };
    // Calling walk function with cb
    astWalker.walk(node.ast, callback);

    // Calling walk function without cb
    astWalker.walk(node.ast);

    // Calling WALKASTLIST function
    astWalker.walkAstList(node);

    // Calling WALKASTLIST function with cb
    astWalker.walkAstList(node, node => {
      return true;
    });
    st.end();
  });
});

function checkProgramDirective(st: tape.Test, node: AstNode) {
  st.equal(node.id, 1);
  st.equal(node.literals.length, 7);
}

function checkContract(st: tape.Test, node: AstNode) {
  st.equal(node.name, "Greeter");
  st.equal(node.nodes[0].name, "greeting");
  st.equal(node.nodes[0].nodeType, "VariableDeclaration");
  st.equal(node.nodes[0].name, "greeting");
  st.equal(node.nodes[0].typeName.name, "string");
  st.equal(node.nodes[1].nodeType, "FunctionDefinition");
  st.equal(node.nodes[1].name, "");
  st.equal(node.nodes[1].scope, 25);
  st.equal(node.nodes[2].nodeType, "FunctionDefinition");
  st.equal(node.nodes[2].name, "greet");
}
