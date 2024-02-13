import { ParseScopedStyleSheet } from "./parser";
const files = /(\.ts|\.js|\.cjs|\.mjs|\.tsx|\.jsx)$/;

export const ScopedStyleVitePlugin = ()=>{
  return {
    name: "transform-stylescope-object",
    enforce: "pre",
    transform(code, id) {
      if (files.test(id)) {
        return {
          code: ParseScopedStyleSheet(code),
          map: null,
        };
      }
    },
  };
}