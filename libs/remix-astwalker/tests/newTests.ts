import tape from "tape";
import { AstWalker, AstNode, isAstNode } from "../src";
import node from "./resources/newAST";
import legacyNode from "./resources/legacyAST";

tape("New ASTWalker", (t: tape.Test) => {
  // New Ast Object
  const astWalker = new AstWalker();
  t.test("ASTWalker.walk && .walkastList", (st: tape.Test) => {
    st.plan(24);
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
  t.test("ASTWalkFull", (st: tape.Test) => {
    const astNodeCount = 26;
    st.plan(2 + astNodeCount);
    let count: number = 0;
    astWalker.walkFull(node.ast, (node: AstNode) => {
      st.ok(isAstNode(node), "passed an ast node");
      count += 1;
    });
    st.equal(count, astNodeCount, "traverses all AST nodes");
    count = 0;
    let badCall = function() {
      /* Typescript will keep us from calling walkFull with a legacyAST.
	 However, for non-typescript uses, we add this test which casts
	 to an AST to check that there is a run-time check in walkFull.
      */
      astWalker.walkFull(<AstNode>legacyNode, (node: AstNode) => {
        count += 1;
      });
    }
    t.throws(badCall, /first argument should be an ast/,
      "passing legacyAST fails");
    st.equal(count, 0, "traverses no AST nodes");
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
