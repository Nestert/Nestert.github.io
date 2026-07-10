import { cp, mkdir, writeFile } from 'node:fs/promises';

await mkdir('dist/client', { recursive: true });
await mkdir('dist/server', { recursive: true });
await cp('_site', 'dist/client', { recursive: true });

const worker = `export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
`;

await writeFile('dist/server/index.js', worker);
