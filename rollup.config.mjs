import ts from "rollup-plugin-ts";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

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
    plugins: [commonjs(), nodeResolve({
      exportConditions: ['node'],
      extensions: ['.ts', '.js'],
    }), ts()],
  },
];
