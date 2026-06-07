import { expect, test } from "bun:test";
import { isPublicRoute } from "./middleware";

test("isPublicRoute keeps the landing and auth pages public", () => {
  expect(isPublicRoute("/")).toBe(true);
  expect(isPublicRoute("/login")).toBe(true);
  expect(isPublicRoute("/login/reset")).toBe(true);
  expect(isPublicRoute("/dashboard")).toBe(false);
  expect(isPublicRoute("/cadastros")).toBe(false);
});
