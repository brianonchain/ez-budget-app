"use client";
import { useEffect } from "react";

export default function InitSWAndNotifications() {
  useEffect(() => {
    async function init() {
      if (!("serviceWorker" in navigator)) return;
      // if (process.env.NODE_ENV !== "production") return;
      try {
        // register SW
        await navigator.serviceWorker.register("/sw.js");
        // set up notifications
        await setupNotifications();
      } catch (error) {
        console.error("init() failed:", error);
      }
    }
    init();
  }, []);

  return null;
}

export async function setupNotifications() {
  if (!("serviceWorker" in navigator)) return;
  if (!("PushManager" in window)) return;
  if (!("Notification" in window)) return;

  // prompt user for permission if none yet
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return;

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
    });
  }

  await fetch("/api/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription),
  });
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}
