import { defineConfig } from "cypress";

export default defineConfig({
  component: {
    specPattern: "src/**/*.spec.tsx",
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
