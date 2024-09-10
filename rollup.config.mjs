import ts from "rollup-plugin-ts";

/** @type {import('rollup').RollupOptions} */
export default [
  {
    input: "plugins/navidrome/index.ts", // 输入文件
    output: [{ file: "dist/navidrome/index.js", format: "cjs" }],
    plugins: [ts()],
  },
  {
    input: "plugins/emby/index.ts", // 输入文件
    output: [{ file: "dist/emby/index.js", format: "cjs" }],
    plugins: [ts()],
  },
];
