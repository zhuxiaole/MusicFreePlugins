const path = require("path");
const rimraf = require("rimraf");

const distPath = path.resolve(__dirname, "../dist");

async function run() {
    await rimraf(distPath);
}

run();
