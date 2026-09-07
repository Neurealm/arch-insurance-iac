import { test } from "node:test";
import assert from "node:assert/strict";
import { hclLiteral } from "./execution-policy.ts";

test("HCP run inputs preserve literal Terraform interpolation text", () => {
  assert.equal(hclLiteral("${1 + 1}"), '"$${1 + 1}"');
  assert.equal(hclLiteral('%{if true}x%{endif}'), '"%%{if true}x%%{endif}"');
  assert.equal(hclLiteral({ tag: "${file(path.root)}" }), '{"tag":"$${file(path.root)}"}');
  assert.equal(hclLiteral(["${var.other}", "literal"]), '["$${var.other}","literal"]');
  assert.equal(hclLiteral("$${already}"), '"$$${already}"');
});
test("HCP run inputs retain primitive literals", () => {
  assert.equal(hclLiteral("Standard_D2s_v5"), '"Standard_D2s_v5"');
  assert.equal(hclLiteral(2), "2");
  assert.equal(hclLiteral(false), "false");
  assert.throws(() => hclLiteral(undefined));
});
