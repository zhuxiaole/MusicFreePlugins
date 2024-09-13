const path = require("path");
const fs = require("fs");
const rimraf = require("rimraf");

const distPath = path.resolve(__dirname, "../dist");

async function run() {
    if (fs.existsSync(distPath)) {
        await rimraf(distPath);
    }
}

run();
