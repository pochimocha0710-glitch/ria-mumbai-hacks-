import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { type Server } from "node:http";

import express, { type Express } from "express";
import runApp from "./app";

export async function serveStatic(app: Express, _server: Server) {
  // Build outputs to dist/public from project root
  // Use fileURLToPath to get the directory of the current file
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  // Resolve from the dist/index.js location (where this file will be after build)
  // dist/index.js -> dist/public
  const distPath = path.resolve(__dirname, "public");

  // Fallback: resolve from process.cwd() (project root) in case path resolution fails
  const distPathAlt = path.resolve(process.cwd(), "dist", "public");

  const finalPath = fs.existsSync(distPath) ? distPath : distPathAlt;

  if (!fs.existsSync(finalPath)) {
    console.error(`Build directory not found. Tried:`);
    console.error(`  - ${distPath}`);
    console.error(`  - ${distPathAlt}`);
    console.error(`Current working directory: ${process.cwd()}`);
    throw new Error(
      `Could not find the build directory. Make sure to run 'npm run build' first.`,
    );
  }

  console.log(`✓ Serving static files from: ${finalPath}`);

  // Serve static files from the dist/public directory
  app.use(express.static(finalPath, {
    index: false, // Don't serve index.html for directory requests
    extensions: ['html', 'js', 'css', 'json', 'png', 'jpg', 'gif', 'svg', 'ico']
  }));

  // Fall through to index.html for all routes (SPA routing)
  app.use("*", (_req, res) => {
    const indexPath = path.resolve(finalPath, "index.html");
    if (!fs.existsSync(indexPath)) {
      return res.status(404).send("index.html not found. Make sure to build the client first.");
    }
    res.sendFile(indexPath);
  });
}

(async () => {
  await runApp(serveStatic);
})();
