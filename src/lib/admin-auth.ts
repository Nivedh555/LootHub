"use client";

import { useSyncExternalStore } from "react";
import { adminPasscode } from "@/config/admin";

let unlocked = false;
let currentPasscode: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}
function set(value: boolean, pass?: string) {
  if (unlocked !== value) {
    unlocked = value;
    currentPasscode = value ? (pass ?? null) : null;
    emit();
  }
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}
function getSnapshot() {
  return unlocked;
}

export function useAdminUnlocked() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export function getAdminPasscode(): string | null {
  return currentPasscode;
}

export function tryUnlock(passcode: string): boolean {
  if (passcode === adminPasscode) {
    set(true, passcode);
    return true;
  }
  return false;
}

export function lockAdmin() {
  set(false);
}