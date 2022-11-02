var fs = require("fs");

dirPath = "../lib/";

const files = fs.readdirSync(dirPath);

const rmPrefix = false;
const rmExt = false;
const format = true;
const rewrite = false;

const weights = [];

let index = 0;

files.forEach((file) => {
  // rm DS_Store
  if (file == ".DS_Store") {
    fs.rmSync(dirPath + file);
    console.log("remove .DS_Store");
    return;
  }

  let fileName = file;
  let fileExt = "";

  // rm ext
  let lastIndex = file.lastIndexOf(".");

  if (lastIndex > 0) {
    fileName = file.slice(0, lastIndex);
    fileExt = file.slice(lastIndex);
  }

  let newFileName = fileName;

  //
  //
  //

  // remove weight
  if (weights.length > 0) newFileName = newFileName.split("#").shift();

  // remove pre-fix
  if (rmPrefix) {
    newFileName = newFileName.split("nft-layers-v2_0000s_00").pop();
    newFileName = newFileName.substring(3);
  }

  if (format) {
    newFileName = newFileName.replaceAll("-", " ");
  }

  //
  //
  //

  // add weight
  if (weights.length > 0)
    newFileName = newFileName + "#" + Number(weights[index]);

  // add ext
  if (!rmExt) newFileName = newFileName + fileExt;

  //
  //
  //

  console.log(newFileName, Number(weights[index]));

  if (rewrite) {
    fs.renameSync(dirPath + file, dirPath + newFileName);
  }

  index++;
});
