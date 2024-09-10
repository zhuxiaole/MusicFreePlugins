const fs = require('fs/promises');
const path = require('path');
const rimraf = require('rimraf');

const basePath = path.resolve(__dirname, '..');
const distPath = path.resolve(__dirname, '../dist');

/// <reference types="../types/global" />
global.env = {
    getUserVariables: () => {
      return {
        url: "",
        username: "",
        password: "",
      };
    },
    debug: true,
};

async function run() {
    console.log('生成json文件...');

    const pluginPath = path.resolve(distPath, 'plugins.json');
    const mypluginsPath = path.resolve(distPath, 'myplugins.json');
    const distPackagePath = path.resolve(distPath, 'package.json')

    await rimraf(pluginPath);
    await rimraf(mypluginsPath);
    await rimraf(distPackagePath);

    const bundledPlugins = await fs.readdir(distPath);

    const output = {
        plugins: []
    };

    await Promise.all(bundledPlugins.map(async (file) => {
        const filePath = path.resolve(distPath, file);
        const stat = await fs.stat(filePath);

        if (stat.isDirectory()) {
            const targetPluginPath = path.resolve(filePath, 'index.js');
            await fs.stat(targetPluginPath);
            const jsItem = require(targetPluginPath);

            if (jsItem && jsItem.platform) {
                output.plugins.push({
                    name: jsItem.platform,
                    url: jsItem.srcUrl,
                    version: jsItem.version,
                });
            }
        }
    }));

    // 写入 plugins.json
    await fs.writeFile(pluginPath, JSON.stringify(output,"","  "));

    // 写入 myplugins.json
    const mypluginBasePath = path.resolve(basePath, 'myplugins-base.json');
    await fs.stat(mypluginBasePath);
    const mypluginsBase = await fs.readFile(mypluginBasePath, 'utf-8');
    const mypluginsBaseJson = JSON.parse(mypluginsBase);
    mypluginsBaseJson.plugins.push(...output.plugins);

    await fs.writeFile(mypluginsPath, JSON.stringify(mypluginsBaseJson,"","  "));

    // 复制 publish-package.json 至 dist/package.json
    await fs.copyFile(path.resolve(basePath, 'publish-package.json'), distPackagePath);

    // 复制 README.md 至 dist/README.md
    await fs.copyFile(path.resolve(basePath, 'README.md'), path.resolve(distPath, 'README.md'));

    console.log('done√');
}


run();