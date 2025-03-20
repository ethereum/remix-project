const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { runExecutor } = require("@nx/devkit"); // ✅ Correct import for running Nx tasks

const CACHE_SERVER_URL = "http://localhost:4000/nx-cache";

async function retrieve(hash) {
  try {
    const cacheFilePath = path.join(".nx-cache", hash);
    console.log(`🟢 Retrieving cache for hash: ${hash}`);

    const response = await axios.get(`${CACHE_SERVER_URL}/${hash}`, { responseType: "arraybuffer" });

    if (!fs.existsSync(".nx-cache")) {
      fs.mkdirSync(".nx-cache");
    }

    fs.writeFileSync(cacheFilePath, response.data);
    console.log(`✅ Cache retrieved: ${cacheFilePath}`);
    return cacheFilePath;
  } catch (error) {
    console.log(`❌ Cache not found for hash: ${hash}`);
    return null;
  }
}

async function store(hash, cacheFilePath) {
  try {
    console.log(`🟡 Storing cache for hash: ${hash}`);
    const fileData = fs.readFileSync(cacheFilePath);
    await axios.put(`${CACHE_SERVER_URL}/${hash}`, fileData, {
      headers: { "Content-Type": "application/octet-stream" },
    });
    console.log(`✅ Cache stored: ${hash}`);
  } catch (error) {
    console.error(`❌ Failed to store cache for hash: ${hash}`, error.message);
  }
}

module.exports = async function customTasksRunner(tasks, options, context) {
  console.log("🚀 Running custom Nx tasks runner...");

  console.log(context);

  if (!context || !context.projectsConfigurations) {
    console.error("❌ Error: `context.projectsConfigurations` is missing.");
    process.exit(1);
  }


  for (const task of tasks) {
    console.log(`🔄 Processing task: ${task.id}`);

    try {
      // ✅ Use Nx's built-in executor properly
      const execution = await runExecutor(
        {
          project: task.target.project,
          target: task.target.target,
          configuration: task.target.configuration,
        },
        {},
        context
      );

      for await (const result of execution) {
        if (!result.success) {
          console.error(`❌ Task failed: ${task.id}`);
          process.exit(1);
        }
      }

      // Save cache
      const cacheFilePath = path.join(".nx-cache", task.hash);
      fs.writeFileSync(cacheFilePath, JSON.stringify({ success: true }));

      await store(task.hash, cacheFilePath);
    } catch (error) {
      console.error(`❌ Task execution failed: ${task.id}`, error.message);
    }
  }

  return Promise.resolve();
};