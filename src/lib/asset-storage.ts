/**
 * Asset Storage — IndexedDB-backed blob storage for custom skin assets.
 * Stores extracted files from zip packages so PixelOffice can load them.
 */

const DB_NAME = "claworld_assets";
const DB_VERSION = 1;
const STORE = "files";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function putAssetFile(key: string, blob: Blob): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ key, blob, updatedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAssetFile(key: string): Promise<Blob | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve(req.result?.blob ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function getAssetUrl(key: string): Promise<string | null> {
  const blob = await getAssetFile(key);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

export async function deleteAssetFiles(prefix: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const req = store.openCursor();
    req.onsuccess = () => {
      const cursor = req.result;
      if (cursor && cursor.value.key.startsWith(prefix)) {
        cursor.delete();
        cursor.continue();
      } else if (!cursor) {
        resolve();
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function clearAllAssets(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
