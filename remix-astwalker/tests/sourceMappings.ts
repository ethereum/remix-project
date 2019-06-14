import tape from "tape";
import { SourceMappings, sourceLocationFromAstNode } from "../src/sourceMappings";
import node from "./resources/newAST";

tape("SourceMappings", (t: tape.Test) => {
  const source = node.source;
  const srcMappings = new SourceMappings(source);
  t.test("SourceMappings constructor", (st: tape.Test) => {
    st.plan(2);

    st.equal(source, srcMappings.source);
    st.deepEqual(srcMappings.lineBreaks,
      [15, 26, 27, 38, 39, 81, 87, 103, 119, 135, 141, 142, 186, 192, 193, 199]);
    st.end();
  });
  t.test("SourceMappings fns", (st: tape.Test) => {
    st.plan(2);
    const ast = node.ast;
    st.deepEqual(sourceLocationFromAstNode(ast.nodes[0]),
      { start: 0, length: 31, file: 0 });
    const loc = { start: 267, length: 20, file: 0 };
    const rr = srcMappings.findNodeAtSourceLocation('ExpressionStatement', loc, ast);
    st.ok(rr);
    st.end();
  });
});
