import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    // Bundle isolation: confine Three.js / R3F / drei to allow-listed feature folders.
    // Anywhere else, importing these would leak a ~500KB payload into shared chunks.
    files: ["**/*.{ts,tsx}"],
    ignores: [
      "src/features/foc-twin/**",
      "src/pages/semiconductor/**",
      "src/pages/prod-twin/**",
      "src/pages/sead/EquipmentHealthIntelligence.tsx",
      "src/pages/data-orchestration-twin/**",
      "src/features/meridian/**",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "three", message: "Three.js is restricted to 3D feature folders (foc-twin, semiconductor, prod-twin, sead/EquipmentHealthIntelligence, data-orchestration-twin, meridian). Lazy-load through a route module in one of those folders instead." },
            { name: "@react-three/fiber", message: "Restricted to 3D feature folders. Lazy-load through a route module." },
            { name: "@react-three/drei", message: "Restricted to 3D feature folders. Lazy-load through a route module." },
          ],
          patterns: ["three/*", "@react-three/fiber/*", "@react-three/drei/*"],
        },
      ],
    },
  },
);
