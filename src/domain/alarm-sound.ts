const DATABASE_NAME = "minutes-in-leonida-media";
const DATABASE_VERSION = 1;
const STORE_NAME = "sounds";
const CUSTOM_SOUND_KEY = "custom-alarm";
const MAX_SOUND_BYTES = 8 * 1024 * 1024;

type StoredSound = { blob: Blob; name: string };
let activeSoundUrl: string | null = null;

function openDatabase(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") {
    return Promise.reject(new Error("Este navegador não oferece armazenamento local de áudio."));
  }

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Não foi possível abrir os sons salvos."));
    request.onblocked = () =>
      reject(new Error("Feche outra aba do app para acessar os sons salvos."));
  });
}

function waitForTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error ?? new Error("Não foi possível salvar o áudio."));
    transaction.onabort = () =>
      reject(transaction.error ?? new Error("O salvamento do áudio foi cancelado."));
  });
}

export function validateAlarmSound(file: Pick<File, "type" | "size">): void {
  if (!file.type.startsWith("audio/")) throw new Error("Escolha um arquivo de áudio válido.");
  if (file.size === 0) throw new Error("O arquivo de áudio está vazio.");
  if (file.size > MAX_SOUND_BYTES) throw new Error("O áudio deve ter no máximo 8 MB.");
}

export async function saveCustomAlarmSound(file: File): Promise<void> {
  validateAlarmSound(file);
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction
      .objectStore(STORE_NAME)
      .put({ blob: file, name: file.name } satisfies StoredSound, CUSTOM_SOUND_KEY);
    await waitForTransaction(transaction);
  } finally {
    database.close();
  }
}

export async function loadCustomAlarmSound(): Promise<StoredSound | null> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readonly");
    const request = transaction.objectStore(STORE_NAME).get(CUSTOM_SOUND_KEY) as IDBRequest<
      StoredSound | undefined
    >;
    const result = await new Promise<StoredSound | undefined>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(request.error ?? new Error("Não foi possível ler o áudio salvo."));
    });
    await waitForTransaction(transaction);
    return result?.blob instanceof Blob && typeof result.name === "string" ? result : null;
  } finally {
    database.close();
  }
}

export async function deleteCustomAlarmSound(): Promise<void> {
  const database = await openDatabase();
  try {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(CUSTOM_SOUND_KEY);
    await waitForTransaction(transaction);
  } finally {
    database.close();
  }
}

/** Keep only an object URL in memory; the sound bytes live in IndexedDB, not localStorage. */
export function activateCustomAlarmSound(blob: Blob | null): void {
  if (activeSoundUrl) URL.revokeObjectURL(activeSoundUrl);
  activeSoundUrl = blob ? URL.createObjectURL(blob) : null;
}

export function playCustomAlarmSound(volume: number, onError: () => void): boolean {
  if (!activeSoundUrl || typeof Audio === "undefined") return false;
  try {
    const player = new Audio(activeSoundUrl);
    player.volume = Math.min(1, Math.max(0, volume));
    void player.play().catch(onError);
    return true;
  } catch {
    return false;
  }
}
