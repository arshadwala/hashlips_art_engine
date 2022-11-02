const dotenv = require("dotenv");
const minimist = require("minimist");
const web3Storage = require("web3.storage");
Web3Storage = web3Storage.Web3Storage;
getFilesFromPath = web3Storage.getFilesFromPath;

async function main() {
  dotenv.config();

  const args = minimist(process.argv.slice(2));
  const token = process.env.WEB3TOKEN;

  if (args._.length < 1) {
    return console.error("Please supply the path to a file or directory");
  }

  const storage = new Web3Storage({ token });
  const files = [];

  for (const path of args._) {
    const pathFiles = await getFilesFromPath(path);
    files.push(...pathFiles);
  }

  console.log(`Uploading ${files.length} files`);
  const cid = await storage.put(files);
  console.log("Content added with CID:", cid);
}

main();
