/** The app version, injected at build time from package.json via the
 *  `__APP_VERSION__` define in vite.config.ts. Falls back so tests and any
 *  non-Vite runtime still have a string. */
declare const __APP_VERSION__: string | undefined;

export const APP_VERSION: string =
  typeof __APP_VERSION__ === "string" && __APP_VERSION__
    ? __APP_VERSION__
    : "1.1.0";
