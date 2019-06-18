import tape from "tape";
import { AstNode, isAstNode, SourceMappings, sourceLocationFromAstNode } from "../src";
import node from "./resources/newAST";

tape("SourceMappings", (t: tape.Test) => {
  const source = node.source;
  const srcMappings = new SourceMappings(source);
  t.test("SourceMappings constructor", (st: tape.Test) => {
    st.plan(2)
    st.equal(srcMappings.source, source, "sourceMappings object has source-code string");
    st.deepEqual(srcMappings.lineBreaks,
      [15, 26, 27, 38, 39, 81, 87, 103, 119, 135, 141, 142, 186, 192, 193, 199],
      "sourceMappings has line-break offsets");
    st.end();
  });
  t.test("SourceMappings functions", (st: tape.Test) => {
    // st.plan(2)
    const ast = node.ast;
    st.deepEqual(sourceLocationFromAstNode(ast.nodes[0]),
      { start: 0, length: 31, file: 0 },
      "sourceLocationFromAstNode extracts a location");

    /* Typescript will keep us from calling sourceLocationFromAstNode
       with the wrong type. However, for non-typescript uses, we add
       this test which casts to an AST to check that there is a
       run-time check in walkFull.
    */
    st.notOk(sourceLocationFromAstNode(<AstNode>null),
      "sourceLocationFromAstNode rejects an invalid astNode");
    const loc = { start: 267, length: 20, file: 0 };
    let astNode = srcMappings.findNodeAtSourceLocation('ExpressionStatement', loc, ast);
    st.ok(isAstNode(astNode), "findsNodeAtSourceLocation finds something");
    astNode = srcMappings.findNodeAtSourceLocation('NotARealThingToFind', loc, ast);
    st.notOk(isAstNode(astNode),
      "findsNodeAtSourceLocation fails to find something when it should");
    let astNodes = srcMappings.nodesAtPosition(null, loc, ast);
    st.equal(astNodes.length, 2, "nodesAtPosition should find more than one astNode");
    st.ok(isAstNode(astNodes[0]), "nodesAtPosition returns only AST nodes");
    // console.log(astNodes[0]);
    astNodes = srcMappings.nodesAtPosition("ExpressionStatement", loc, ast);
    st.equal(astNodes.length, 1, "nodesAtPosition filtered to a single nodeType");
    st.end();
  });
});
