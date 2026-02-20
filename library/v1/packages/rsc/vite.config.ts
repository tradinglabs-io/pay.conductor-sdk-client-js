import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { peerDependencies } from "./package.json";

export default defineConfig({
  build: {
    lib: {
      entry: "./src/index.ts",
      name: "PayConductorRSC",
      fileName: (format) => `index.${format}.js`,
      formats: ["cjs", "es"],
    },
    rollupOptions: {
      external: [...Object.keys(peerDependencies), "react/jsx-runtime"],
      output: {
        exports: "named",
        // Preserve "use client" directive required by Next.js RSC
        banner: '"use client";',
      },
    },
    sourcemap: true,
    emptyOutDir: true,
  },
  plugins: [dts()],
});
