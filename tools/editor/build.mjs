import { build } from "esbuild";

await build({ entryPoints: ["tools/editor/src/editor-bundle.js"], bundle: true, format: "esm", target: "es2020", outfile: "assets/admin/editor-bundle.js" });
await build({ entryPoints: ["tools/editor/src/sanitizer-bundle.js"], bundle: true, format: "esm", target: "es2020", outfile: "assets/sanitize-bundle.js" });
console.log("Built the local editor and sanitizer bundles.");
