declare global {
  var env: {
    getUserVariables?: () => Record<string, string>;
    os: string;
    appVersion: string;
    debug: boolean;
  };
}

export {};
