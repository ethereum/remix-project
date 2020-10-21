import tape from "tape";
import {
  AstNode, isAstNode,
  LineColPosition, lineColPositionFromOffset,
  LineColRange, Location,
  SourceMappings, sourceLocationFromAstNode,
  sourceLocationFromSrc
} from "../src";
import node from "./resources/newAST";

tape("SourceMappings", (t: tape.Test) => {
  const source = node.source;
  const srcMappings = new SourceMappings(source);
  t.test("SourceMappings conversions", (st: tape.Test) => {
    st.plan(9);
    const loc = <Location>{
      start: 32,
      length: 6,
      file: 0
    };

    const ast = node.ast;

    st.deepEqual(lineColPositionFromOffset(0, srcMappings.lineBreaks),
      <LineColPosition>{ line: 1, character: 1 },
      "lineColPositionFromOffset degenerate case");
    st.deepEqual(lineColPositionFromOffset(200, srcMappings.lineBreaks),
      <LineColPosition>{ line: 17, character: 1 },
      "lineColPositionFromOffset conversion");

    /* Typescript will keep us from calling sourceLocationFromAstNode
       with the wrong type. However, for non-typescript uses, we add
       this test which casts to an AST to check that there is a
       run-time check in walkFull.
    */
    st.notOk(sourceLocationFromAstNode(<AstNode>null),
      "sourceLocationFromAstNode rejects an invalid astNode");

    st.deepEqual(sourceLocationFromAstNode(ast.nodes[0]),
      { start: 0, length: 31, file: 0 },
      "sourceLocationFromAstNode extracts a location");
    st.deepEqual(sourceLocationFromSrc("32:6:0"), loc,
      "sourceLocationFromSrc conversion");
    const startLC = <LineColPosition>{ line: 6, character: 6 };
    st.deepEqual(srcMappings.srcToLineColumnRange("45:96:0"),
      <LineColRange>{
        start: startLC,
        end: <LineColPosition>{ line: 11, character: 6 }
      }, "srcToLineColumnRange end of line");
    st.deepEqual(srcMappings.srcToLineColumnRange("45:97:0"),
      <LineColRange>{
        start: startLC,
        end: <LineColPosition>{ line: 12, character: 1 }
      }, "srcToLineColumnRange beginning of next line");
    st.deepEqual(srcMappings.srcToLineColumnRange("45:98:0"),
      <LineColRange>{
        start: startLC,
        end: <LineColPosition>{ line: 13, character: 1 }
      }, "srcToLineColumnRange skip over empty line");
    st.deepEqual(srcMappings.srcToLineColumnRange("-1:0:0"),
      <LineColRange>{
        start: null,
        end: null
      }, "srcToLineColumnRange invalid range");
    st.end();
  });

  t.test("SourceMappings constructor", (st: tape.Test) => {
    st.plan(2);
    st.equal(srcMappings.source, source, "sourceMappings object has source-code string");
    st.deepEqual(srcMappings.lineBreaks,
      [15, 26, 27, 38, 39, 81, 87, 103, 119, 135, 141, 142, 186, 192, 193, 199],
      "sourceMappings has line-break offsets");
    st.end();
  });
  t.test("SourceMappings functions", (st: tape.Test) => {
    st.plan(5);
    const ast = node.ast;

    const loc = { start: 267, length: 20, file: 0 };
    let astNode = srcMappings.findNodeAtSourceLocation('ExpressionStatement', loc, ast);
    st.ok(isAstNode(astNode), "findsNodeAtSourceLocation finds something");
    astNode = srcMappings.findNodeAtSourceLocation('NotARealThingToFind', loc, ast);
    st.notOk(isAstNode(astNode),
      "findsNodeAtSourceLocation fails to find something when it should");
    let astNodes = srcMappings.nodesAtPosition(null, loc, ast);
    st.equal(astNodes.length, 2, "nodesAtPosition should find more than one astNode");
    st.ok(isAstNode(astNodes[0]), "nodesAtPosition returns only AST nodes");
    astNodes = srcMappings.nodesAtPosition("ExpressionStatement", loc, ast);
    st.equal(astNodes.length, 1, "nodesAtPosition filtered to a single nodeType");
    st.end();
  });
});
