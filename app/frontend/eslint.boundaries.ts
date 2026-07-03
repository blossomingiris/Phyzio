import boundaries from "eslint-plugin-boundaries";

export const eslintBoundariesConfig = {
  plugins: {
    boundaries,
  },
  settings: {
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
      },
    },
    "boundaries/elements": [
      { type: "app", pattern: "src/app", mode: "folder" },
      {
        type: "features",
        pattern: "src/features/*",
        mode: "folder",
        capture: ["feature"],
      },
      { type: "shared", pattern: "src/shared", mode: "folder" },
    ],
  },
  rules: {
    "boundaries/dependencies": [
      2,
      {
        default: "disallow",
        message:
          "Layer (${file.type}) is not allowed to import ${dependency.type} (${dependency.source})",
        rules: [
          { from: { type: "app" }, allow: { to: { type: ["app", "shared"] } } },
          {
            from: { type: "app" },
            allow: {
              to: {
                type: "features",
                internalPath: ["index.ts", "index.tsx", "*.page.tsx"],
              },
            },
            message:
              "A feature may only be imported through its public API (index / *.page.tsx). Direct import from ${dependency.source} is not allowed",
          },
          { from: { type: "features" }, allow: { to: { type: "shared" } } },
          {
            from: { type: "features" },
            allow: {
              to: {
                type: "features",
                captured: { feature: "{{from.feature}}" },
              },
            },
          },
          { from: { type: "shared" }, allow: { to: { type: "shared" } } },
        ],
      },
    ],
    "boundaries/no-unknown-files": 2,
  },
};
