import { useSyncExternalStore } from "react";
import { listCollections, subscribe, type Collection } from "@/lib/collections";

/**
 * The saved collections, kept in sync across every component that shows them —
 * saving a card in the reader has to light up the button in the deck behind it.
 *
 * The server has no device storage, so it renders an empty list and the client
 * fills it in on hydration.
 */
export function useCollections(): Collection[] {
  return useSyncExternalStore(subscribe, listCollections, EMPTY);
}

const EMPTY_LIST: Collection[] = [];
const EMPTY = () => EMPTY_LIST;
