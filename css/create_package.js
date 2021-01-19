const fs = require("fs");
const path = require("path");
const mkdirp = require('mkdirp');
const program = require('commander');
const util = require("./dist/common/utils");

// Directory paths
global.rootDir = __dirname;
global.publicDir = path.join(rootDir, "public");
const package = JSON.parse(fs.readFileSync(`${rootDir}/package.json`, "utf8"));
global.ver = package.ver;

// Define command arguments
program
  .option("-n, --name <name>", "Package Name")
  .option("-t, --type <type>", "Package Type in {module}")
program.parse(process.argv);
if ( !program.name || !program.type ) throw new Error("You must provide the --name and --type arguments");

// Create Module
function createModule() {
  const modPath = path.join(publicDir, "modules", program.name);
  if ( fs.existsSync(modPath) ) throw new Error("A Module by this name already exists.");
  const metadata = {
    name: program.name,
    title: "Module Title",
    description: "Module Description",
    version: 0.1,
    author: "Your Name",
    systems: [],
    scripts: ["./script.js"],
    styles: ["./styles.css"],
    packs: [],
    languages: [
      {
        "lang": "en",
        "name": "English",
        "path": "lang/en.json"
      }
    ],
    url: "http://your.module.url/here",
    manifest: "http://raw.module.manifest/link.json",
    download: "http://your.packaged.module/directory.zip"
  };
  mkdirp.sync(modPath);
  fs.writeFileSync(path.join(modPath, "module.json"), JSON.stringify(metadata, null, 2));
  fs.writeFileSync(path.join(modPath, "script.js"), 'Hooks.on("ready", () => console.log("Hello Module!"));');
  fs.writeFileSync(path.join(modPath, "styles.css"), '.module.style { display: "block"; }');
  mkdirp.sync(path.join(modPath, "lang"));
  fs.writeFileSync(path.join(modPath, "lang/en.json"), JSON.stringify({"MODULE.STRING_KEY": "Translation"}, null, 2));
  mkdirp.sync(path.join(modPath, "packs"));
}

// Perform command
if ( program.type === "module" ) createModule();
