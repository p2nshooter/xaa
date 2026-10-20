/**
 * Runs in <head> before React: Chrome/Edge fire `beforeinstallprompt` as soon
 * as the page qualifies, often before hydration, so it is caught here and kept
 * on window for components/InstallBar.tsx. `appinstalled` marks the app as
 * installed; a later prompt means it was removed, so the mark is cleared.
 */
export const PWA_KEY = 'xaa_pwa_installed';

export const PWA_EARLY = `(function(){var w=window,k="${PWA_KEY}";w.__xaaPwa=w.__xaaPwa||{bip:null};function ping(){try{w.dispatchEvent(new Event("xaa-pwa"))}catch(e){}}w.addEventListener("beforeinstallprompt",function(e){e.preventDefault();w.__xaaPwa.bip=e;try{localStorage.removeItem(k)}catch(x){}ping()});w.addEventListener("appinstalled",function(){w.__xaaPwa.bip=null;try{localStorage.setItem(k,"1")}catch(x){}ping()})})();`;
