declare global {
  namespace NodeJS {
    interface ProcessEnv {
      CF_ACCESS_KEY_ID: string;
      CF_SECRET_ACCESS_KEY: string;
      CF_REGION: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
