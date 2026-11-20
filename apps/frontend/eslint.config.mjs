import next from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const config = [
  ...next,
  ...nextTs,
  { ignores: ['.next/**', 'src/shared/api/generated/**', 'src/shared/api/model/**', 'next-env.d.ts'] },
];

export default config;
