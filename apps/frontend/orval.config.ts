import { defineConfig } from 'orval';

export default defineConfig({
  main: {
    input: { target: '../backend/openapi.json' },
    output: {
      mode: 'tags-split',
      target: './src/shared/api/generated',
      schemas: './src/shared/api/model',
      client: 'axios',
      clean: true,
      override: {
        mutator: { path: './src/shared/api/http/index.ts', name: 'customInstance' },
      },
    },
  },
});
