// Durable hand-off for a document uploaded from the landing page before the
// visitor has an account. They upload, watch the analysis preview, go through
// onboarding and sign up — and only then does the real analysis run. The file
// has to survive all of that, including OAuth full-page redirects and the email
// confirmation round trip, so it lives in IndexedDB (Web Storage is both too
// small for a 20 MB file and wiped by some of those hops). Everything is
// guarded: a browser that blocks storage must degrade to "no pending file",
// never throw.

const DB_NAME = "forma";
const STORE = "pending-upload";
const KEY = "file";

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof indexedDB === "undefined") {
      resolve(null);
      return;
    }
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(STORE)) {
          req.result.createObjectStore(STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/** Stash the uploaded file for the post-sign-up analysis. */
export async function putPendingFile(file: File): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(file, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
  db.close();
}

/** Read the stashed file without removing it (used by the preview screen). */
export async function getPendingFile(): Promise<File | null> {
  const db = await openDb();
  if (!db) return null;
  const file = await new Promise<File | null>((resolve) => {
    try {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve((req.result as File | undefined) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  db.close();
  return file;
}

/** Drop the stashed file once it has been consumed. */
export async function clearPendingFile(): Promise<void> {
  const db = await openDb();
  if (!db) return;
  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    } catch {
      resolve();
    }
  });
  db.close();
}
