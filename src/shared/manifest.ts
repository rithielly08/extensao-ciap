import { browser } from "./browser";

export const VERSION: string = (() => {
  try {
    return browser.runtime.getManifest().version;
  } catch {
    return "";
  }
})();
