"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

export function useAuthGuard(isAuthenticated: boolean) {
  const router = useRouter();
  const inactivityRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const guardActiveRef = useRef(false);

  const logout = useCallback(() => {
    if (inactivityRef.current) {
      clearTimeout(inactivityRef.current);
      inactivityRef.current = null;
    }
    guardActiveRef.current = false;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  }, [router]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityRef.current) {
      clearTimeout(inactivityRef.current);
    }
    inactivityRef.current = setTimeout(() => {
      logout();
    }, INACTIVITY_TIMEOUT);
  }, [logout]);

  useEffect(() => {
    if (!isAuthenticated) return;

    guardActiveRef.current = true;

    window.history.pushState({ guard: true }, "", window.location.href);

    const handlePopState = () => {
      if (!guardActiveRef.current) return;
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      if (token && userData) {
        window.history.pushState({ guard: true }, "", window.location.href);
      }
    };

    window.addEventListener("popstate", handlePopState);

    resetInactivityTimer();

    const activityEvents = ["mousedown", "keydown", "scroll", "touchstart", "mousemove", "click"];
    activityEvents.forEach((ev) => window.addEventListener(ev, resetInactivityTimer));

    return () => {
      guardActiveRef.current = false;
      window.removeEventListener("popstate", handlePopState);
      if (inactivityRef.current) {
        clearTimeout(inactivityRef.current);
        inactivityRef.current = null;
      }
      activityEvents.forEach((ev) => window.removeEventListener(ev, resetInactivityTimer));
    };
  }, [isAuthenticated, resetInactivityTimer]);

  return { logout };
}
