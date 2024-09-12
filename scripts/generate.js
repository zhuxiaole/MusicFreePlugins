const fs = require("fs/promises");
const path = require("path");

const basePath = path.resolve(__dirname, "..");
const distPath = path.resolve(__dirname, "../dist");
const pluginsSourcePath = path.resolve(__dirname, "../plugins");

async function run() {
  console.log("生成json文件...");

  const distPluginPath = path.resolve(distPath, "plugins.json");
  const distMypluginsPath = path.resolve(distPath, "myplugins.json");
  const packagePath = path.resolve(basePath, "package.json");
  const distPackagePath = path.resolve(distPath, "package.json");

  const output = {
    plugins: [],
  };

  const distDir = await fs.readdir(distPath);

  await Promise.all(distDir.map(async (file) => {
    const stat = await fs.stat(path.resolve(distPath, file));

    if (stat.isDirectory()) {
      const pluginInfoPath = path.resolve(pluginsSourcePath, file, `${file}.json`);
      await fs.stat(pluginInfoPath);
      const pluginInfo = JSON.parse(await fs.readFile(pluginInfoPath));
      if (pluginInfo.dist ?? true) {
        output.plugins.push({
          name: pluginInfo.pluginName,
          url: pluginInfo.srcUrl,
          version: pluginInfo.pluginVersion,
        });
      }
    }
}));

  // 写入 plugins.json
  await fs.writeFile(distPluginPath, JSON.stringify(output, "", "  "));

  // 写入 myplugins.json
  const mypluginBasePath = path.resolve(basePath, "myplugins-base.json");
  await fs.stat(mypluginBasePath);
  const mypluginsBase = await fs.readFile(mypluginBasePath, "utf-8");
  const mypluginsBaseJson = JSON.parse(mypluginsBase);
  mypluginsBaseJson.plugins.push(...output.plugins);

  await fs.writeFile(
    distMypluginsPath,
    JSON.stringify(mypluginsBaseJson, "", "  ")
  );

  // 写入 dist/package.json 信息
  await fs.stat(packagePath);
  const packageInfo = JSON.parse(await fs.readFile(packagePath));
  const pubPackageInfo = {
    name: "musicfree-plugins",
    version: packageInfo.version,
    description: packageInfo.description,
    author: packageInfo.author
  };

  await fs.writeFile(
    distPackagePath,
    JSON.stringify(pubPackageInfo, "", "  ")
  );

  // 复制 README.md 至 dist/README.md
  await fs.copyFile(
    path.resolve(basePath, "README.md"),
    path.resolve(distPath, "README.md")
  );

  console.log("done√");
}

run();
