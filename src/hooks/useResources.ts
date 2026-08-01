import { useSyncExternalStore } from "react";
import { listResources, subscribeToResources, type Resource } from "@/lib/resources";

/** The resources the tutor has made, in sync everywhere they are shown. */
export function useResources(): Resource[] {
  return useSyncExternalStore(subscribeToResources, listResources, EMPTY);
}

const EMPTY_LIST: Resource[] = [];
const EMPTY = () => EMPTY_LIST;
