import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env.local' });

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: 'ep-gentle-morning-a2ku3vce-pooler.eu-central-1.aws.neon.tech',
    user: 'neondb_owner',
    password: 'npg_gvZWGx7H2Ohn',
    database: 'neondb',
    ssl: 'require',
  },
});
