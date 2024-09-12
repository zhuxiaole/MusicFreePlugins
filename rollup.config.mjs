import ts from "rollup-plugin-ts";
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import fs from "fs/promises";
import path from "path";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const pluginsSourcePath = path.resolve(__dirname, "./plugins");

async function getNeedDistPlugins() {
  const needDistPlugins = [];
  const pluginsDir = await fs.readdir(pluginsSourcePath);
  await Promise.all(pluginsDir.map(async (file) => {
    const stat = await fs.stat(path.resolve(pluginsSourcePath, file));
  
    if (stat.isDirectory()) {
      const pluginInfoPath = path.resolve(pluginsSourcePath, file, `${file}.json`);
      await fs.stat(pluginInfoPath);
      const pluginInfo = JSON.parse(await fs.readFile(pluginInfoPath));
      if (pluginInfo.dist ?? true) {
        needDistPlugins.push({
          input: `plugins/${file}/index.ts`,
          output: [{ file: `dist/${file}/index.js`, format: "cjs" }],
          plugins: [commonjs(), nodeResolve({
            exportConditions: ['node'],
            extensions: ['.ts', '.js'],
          }), ts(), json()],
        })
      }
    }
  }));

  return needDistPlugins;
}


/** @type {import('rollup').RollupOptions} */
export default [
  ...await(getNeedDistPlugins()),
];
