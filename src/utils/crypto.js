// ── CRYPTO UTILITIES ────────────────────────────────────────────────────
// AES-GCM-256 encrypted backup with PBKDF2 key derivation.

import { APP_NAME } from "../theme.config.js";

const bytesToBase64 = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes)));
const base64ToBytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

const getWebCrypto = () => {
  const wc = window.crypto || window.msCrypto;
  if (!wc?.subtle)
    throw new Error("Criptografia indisponível. Abra o app em HTTPS, localhost ou 127.0.0.1 em um navegador moderno.");
  return wc;
};

const deriveBackupKey = async (password, salt) => {
  const wc = getWebCrypto();
  const material = await wc.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveKey"]);
  return wc.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: 210000, hash: "SHA-256" },
    material,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

export const encryptBackupPayload = async (payload, password) => {
  const wc = getWebCrypto();
  const salt = wc.getRandomValues(new Uint8Array(16));
  const iv = wc.getRandomValues(new Uint8Array(12));
  const key = await deriveBackupKey(password, salt);
  const data = await wc.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(JSON.stringify(payload)));
  return {
    _dnzEncryptedBackup: true,
    version: 1,
    app: APP_NAME,
    alg: "AES-GCM-256",
    kdf: "PBKDF2-SHA256",
    iterations: 210000,
    exportedAt: new Date().toISOString(),
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    data: bytesToBase64(data),
  };
};

export const decryptBackupPayload = async (backup, password) => {
  if (!backup?._dnzEncryptedBackup) throw new Error("not-encrypted");
  const salt = base64ToBytes(backup.salt);
  const iv = base64ToBytes(backup.iv);
  const data = base64ToBytes(backup.data);
  const key = await deriveBackupKey(password, salt);
  const plain = await getWebCrypto().subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return JSON.parse(new TextDecoder().decode(plain));
};

export const softNotifySound = () => {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12);
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.24);
  } catch {}
};
