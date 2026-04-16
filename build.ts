// ビルドスクリプト
import { plugin } from "bun";

const result = await Bun.build({
  entrypoints: ["./src/index.tsx"],
  outdir: "./dist",
  target: "node",
  format: "esm",
  plugins: [
    {
      name: "react-devtools-core-stub",
      setup(build) {
        build.onResolve({ filter: /^react-devtools-core$/ }, () => {
          return {
            path: import.meta.resolveSync("./src/stubs/react-devtools-core.js"),
          };
        });
      },
    },
  ],
});

if (!result.success) {
  console.error("Build failed:");
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}
