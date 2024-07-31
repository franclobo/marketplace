import { useState, useEffect, useCallback } from "react";
import * as SecureStore from "expo-secure-store";
import * as pako from "pako";

const CHUNK_SIZE = 2000; // Define un tamaño seguro para cada fragmento

function uint8ArrayToString(array: Uint8Array) {
  return new TextDecoder().decode(array);
}

function stringToUint8Array(str: string) {
  return new TextEncoder().encode(str);
}

async function storeLargeData(key: string, data: string) {
  const compressedData = pako.deflate(data);
  const compressedString = uint8ArrayToString(compressedData);
  for (let i = 0; i < compressedString.length; i += CHUNK_SIZE) {
    const chunkKey = `${key}_${i / CHUNK_SIZE}`;
    const chunk = compressedString.substring(i, i + CHUNK_SIZE);
    await SecureStore.setItemAsync(chunkKey, chunk);
  }
}

async function getLargeData(key: string) {
  let compressedString = "";
  let index = 0;
  while (true) {
    const chunkKey = `${key}_${index}`;
    const chunk = await SecureStore.getItemAsync(chunkKey);
    if (!chunk) break;
    compressedString += chunk;
    index++;
  }
  if (compressedString) {
    const compressedData = stringToUint8Array(compressedString);
    return pako.inflate(compressedData, { to: "string" });
  }
  return null;
}

async function clearLargeData(key: string) {
  let index = 0;
  while (true) {
    const chunkKey = `${key}_${index}`;
    const chunk = await SecureStore.getItemAsync(chunkKey);
    if (!chunk) break;
    await SecureStore.deleteItemAsync(chunkKey);
    index++;
  }
}

export function useStorageState(key: string, initialValue: string) {
  const [state, setState] = useState<string | null>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedData = await getLargeData(key);
      if (storedData !== null) {
        setState(storedData);
      }
      setLoading(false);
    })();
  }, [key]);

  const setStorageState = useCallback(
    async (newState: string) => {
      setLoading(true);
      await clearLargeData(key);
      await storeLargeData(key, newState);
      setState(newState);
      setLoading(false);
    },
    [key]
  );

  const clearStorageState = useCallback(async () => {
    setLoading(true);
    await clearLargeData(key);
    setState(null);
    setLoading(false);
  }, [key]);

  return [state, setStorageState, clearStorageState, loading] as const;
}
