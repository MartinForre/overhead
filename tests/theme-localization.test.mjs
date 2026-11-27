import assert from "node:assert/strict";
import { test } from "node:test";
import { norwegian } from "../apps/shared/norwegian.js";
import { themes } from "../apps/shared/settings-schema.js";

test("Every display theme has Bokmål and Nynorsk names", () => {
  for (const name of Object.values(themes)) {
    for (const language of ["nb", "nn"]) {
      assert.ok(norwegian[name]?.[language]?.trim(), `Missing ${language} theme name for ${name}`);
    }
  }
});
