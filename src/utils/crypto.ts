// src/utils/crypto.ts
// Simple Base64 encode/decode for contact info obfuscation
export const btoa = (str: string): string => {
  try { return window.btoa(unescape(encodeURIComponent(str))); }
  catch { return str; }
};

export const atob_ = (str: string): string => {
  try { return decodeURIComponent(escape(window.atob(str))); }
  catch { return str; }
};
