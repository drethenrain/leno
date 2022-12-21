import { readdirSync } from 'node:fs';
import { join } from 'node:path';

export default <T = unknown>(path: string): T[] => readdirSync(join(__dirname, path))
  .map((module) => require(join(__dirname, path, module)).default);
