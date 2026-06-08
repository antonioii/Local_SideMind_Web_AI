import { build } from "esbuild";
import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

await build({
  entryPoints: {
    sidepanel: "src/sidepanel/index.ts",
    "service-worker": "src/background/service-worker.ts",
    content: "src/content/content.ts"
  },
  bundle: true,
  format: "esm",
  outdir: distDir,
  target: "chrome120",
  splitting: true,
  sourcemap: true,
  logLevel: "info"
});

await cp(path.join(root, "static"), distDir, { recursive: true });
await cp(
  path.join(root, "node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs"),
  path.join(distDir, "pdf.worker.mjs")
);
await mkdir(path.join(distDir, "ocr", "core"), { recursive: true });
await mkdir(path.join(distDir, "ocr", "lang"), { recursive: true });
await cp(
  path.join(root, "node_modules/tesseract.js/dist/worker.min.js"),
  path.join(distDir, "ocr", "worker.min.js")
);

for (const fileName of [
  "tesseract-core.wasm.js",
  "tesseract-core.wasm",
  "tesseract-core-simd.wasm.js",
  "tesseract-core-simd.wasm",
  "tesseract-core-lstm.wasm.js",
  "tesseract-core-lstm.wasm",
  "tesseract-core-simd-lstm.wasm.js",
  "tesseract-core-simd-lstm.wasm",
  "tesseract-core.js",
  "tesseract-core-simd.js",
  "tesseract-core-lstm.js",
  "tesseract-core-simd-lstm.js",
  "tesseract-core-relaxedsimd.wasm.js",
  "tesseract-core-relaxedsimd.wasm",
  "tesseract-core-relaxedsimd.js",
  "tesseract-core-relaxedsimd-lstm.wasm.js",
  "tesseract-core-relaxedsimd-lstm.wasm",
  "tesseract-core-relaxedsimd-lstm.js"
]) {
  await cp(
    path.join(root, "node_modules/tesseract.js-core", fileName),
    path.join(distDir, "ocr", "core", fileName)
  );
}

const assetsDir = path.join(root, "assets");
try {
  await cp(assetsDir, path.join(distDir, "assets"), { recursive: true });
} catch {
  // Optional assets folder.
}

try {
  await cp(path.join(root, "assets", "ocr"), path.join(distDir, "ocr"), {
    recursive: true
  });
} catch {
  // Optional OCR assets folder.
}
