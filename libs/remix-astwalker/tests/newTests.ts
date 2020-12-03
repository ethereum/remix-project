import tape from "tape";
import { AstWalker, AstNode, isAstNode } from "../src";
import node from "./resources/newAST";
import legacyNode from "./resources/legacyAST";

tape("New ASTWalker", (t: tape.Test) => {
  // New Ast Object
  const astWalker = new AstWalker();
  const latestASTNode = JSON.parse(JSON.stringify(node.ast))
  t.test("ASTWalker.walk && .walkastList", (st: tape.Test) => {
    const latestAST = JSON.parse(JSON.stringify(latestASTNode))
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
    astWalker.walk(latestAST, (node: AstNode) => {
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
    astWalker.walk(latestAST, callback);

    // Calling walk function without cb
    astWalker.walk(latestAST);

    // Calling WALKASTLIST function
    astWalker.walkAstList(node);

    // Calling WALKASTLIST function with cb
    astWalker.walkAstList(node, node => {
      return true;
    });
    st.end();
  });

  t.test("ASTWalker.getASTNodeChildren", (st: tape.Test) => {
    const latestAST = JSON.parse(JSON.stringify(latestASTNode))
    st.plan(26);
    st.equal(latestAST.nodeType, 'SourceUnit')

    let subNodes1 = astWalker.getASTNodeChildren(latestAST)

    st.equal(subNodes1.length, 3)
    st.equal(subNodes1[0].nodeType, 'PragmaDirective')
    st.equal(subNodes1[1].nodeType, 'ImportDirective')
    st.equal(subNodes1[2].nodeType, 'ContractDefinition')

    let subNodes2 = astWalker.getASTNodeChildren(subNodes1[0])
    st.equal(subNodes2.length, 0)

    subNodes2 = astWalker.getASTNodeChildren(subNodes1[1])
    st.equal(subNodes2.length, 0)

    subNodes2 = astWalker.getASTNodeChildren(subNodes1[2])
    st.equal(subNodes2.length, 4)
    st.equal(subNodes2[0].nodeType, 'VariableDeclaration')
    st.equal(subNodes2[1].nodeType, 'FunctionDefinition')
    st.equal(subNodes2[2].nodeType, 'FunctionDefinition')
    st.equal(subNodes2[3].nodeType, 'InheritanceSpecifier')

    let subNodes3 = astWalker.getASTNodeChildren(subNodes2[0])
    st.equal(subNodes3.length, 1)
    st.equal(subNodes3[0].nodeType, 'ElementaryTypeName')

    let subNodes4 = astWalker.getASTNodeChildren(subNodes3[0])
    st.equal(subNodes4.length, 0)

    subNodes3 = astWalker.getASTNodeChildren(subNodes2[1])
    st.equal(subNodes3.length, 1)
    st.equal(subNodes3[0].nodeType, 'Block')

    subNodes4 = astWalker.getASTNodeChildren(subNodes3[0])
    st.equal(subNodes4.length, 1)
    st.equal(subNodes4[0].nodeType, 'ExpressionStatement')

    let subNodes5 = astWalker.getASTNodeChildren(subNodes4[0])
    st.equal(subNodes5.length, 1)
    st.equal(subNodes5[0].nodeType, 'Assignment')

    let subNodes6 = astWalker.getASTNodeChildren(subNodes5[0])

    st.equal(subNodes6.length, 2)
    st.equal(subNodes6[0].nodeType, 'Identifier')
    st.equal(subNodes6[1].nodeType, 'Identifier')

    let subNodes7 = astWalker.getASTNodeChildren(subNodes6[0])
    st.equal(subNodes7.length, 0)

    subNodes7 = astWalker.getASTNodeChildren(subNodes6[1])
    st.equal(subNodes7.length, 0)

    st.end();
  });

  t.test("ASTWalkFull", (st: tape.Test) => {
    const latestAST = JSON.parse(JSON.stringify(latestASTNode))
    const astNodeCount = 26;
    st.plan(2 + astNodeCount);
    let count: number = 0;
    astWalker.walkFull(latestAST, (node: AstNode) => {
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
      astWalker.walkFull(<any>legacyNode, (node: AstNode) => {
        count += 1;
      });
    }
    // t.throws(badCall, /first argument should be an ast/,
    //   "passing legacyAST fails");
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
