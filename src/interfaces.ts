interface Env {
  DB: D1Database;
  AES_ENCRYPTION_KEY_SECRET: KVNamespace;
  MYBROWSER: Fetcher;
}

export { Env };
