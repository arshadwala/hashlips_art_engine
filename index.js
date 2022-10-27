const basePath = process.cwd();
const { numWorkers, batchSize } = require(`${basePath}/src/config.js`);
const {
  chooseDnas,
  createDnas,
  buildSetup,
} = require(`${basePath}/src/main.js`);

function chunks(array, size) {
  return Array.apply(0, new Array(Math.ceil(array.length / size))).map(
    (_, index) => array.slice(index * size, (index + 1) * size)
  );
}

(async () => {
  const nodeExec = process.argv[0];
  buildSetup();
  const createList = await chooseDnas();
  if (numWorkers === 1) {
    await createDnas(createList);
  } else {
    const { spawn } = require("child_process");
    const stream = require("stream");

    const batches = chunks(createList, batchSize);
    let currentBatch = numWorkers; // first `numWorkers` are kicked manually
    const runBatch = async (b) => {
      const child = spawn(nodeExec, [`${basePath}/src/child.js`]);

      child.stdout.pipe(process.stdout);
      child.stdin.write(JSON.stringify(b));
      child.stdin.end();

      await new Promise((resolve) => {
        child.on("close", (code) => {
          if (code !== 0) {
            throw new Error(
              `Child process ended with error code ${code} for batch ${JSON.stringify(
                b
              )}`
            );
          }
          resolve();
        });
      });
      // stack depth?
      if (currentBatch < batches.length) {
        let idx = currentBatch;
        currentBatch += 1;
        await runBatch(batches[idx]);
      }
    };

    let workers = [];
    for (let w = 0; w < numWorkers; ++w) {
      workers.push(runBatch(batches[w]));
    }

    await Promise.all(workers);

    await createAllMetadataFile();
  }
})();

const createAllMetadataFile = async () => {
  const allMetadataFilepath = "./build/json/_metadata.json";
  try {
    fs.unlinkSync(allMetadataFilepath);
  } catch (err) {}

  const jsonDir = "./build/json";
  const sortedFiles = await getSortedFiles(jsonDir);
  let all = [];
  for (let index in sortedFiles) {
    const filepath = `./build/json/${sortedFiles[index]}`;
    let jsonData = JSON.parse(fs.readFileSync(filepath, "utf-8"));
    all.push(jsonData);
  }

  fs.writeFileSync(allMetadataFilepath, JSON.stringify(all, null, 2));
};

const getSortedFiles = async (dir) => {
  const files = await fs.promises.readdir(dir);

  return files
    .map((fileName) => ({
      name: fileName,
      time: fs.statSync(`${dir}/${fileName}`).mtime.getTime(),
    }))
    .sort((a, b) => a.time - b.time)
    .map((file) => file.name);
};
