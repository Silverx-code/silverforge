"use client";

import { useEffect, useState } from "react";

type Store = {
  id: string;
  name: string;
  description: string | null;
  primaryColor: string;
  backgroundColor: string;
  font: string;
  buttonStyle: "ROUNDED" | "SQUARE" | "PILL";
  isPublished: boolean;
  slug: string;
  whatsappNumber: string | null;
};

export default function SettingsPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((me) => {
        const storeSummary = me.stores?.[0];
        if (!storeSummary) return;
        fetch(`/api/stores/${storeSummary.id}`)
          .then((res) => res.json())
          .then(setStore);
      });
  }, []);

  async function save(patch: Partial<Store>) {
    if (!store) return;
    const next = { ...store, ...patch };
    setStore(next);
    setSaved(false);
    await fetch(`/api/stores/${store.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setSaved(true);
  }

  if (!store) return <p className="text-sm text-ink/50">Loading…</p>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold tracking-tight">Store Appearance</h1>
      <p className="mt-1 text-sm text-ink/60">silverforge.com/store/{store.slug}</p>

      <div className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/70">WhatsApp business number</span>
          <input
            className="input"
            type="tel"
            inputMode="tel"
            value={store.whatsappNumber ?? ""}
            onChange={(e) => save({ whatsappNumber: e.target.value })}
            placeholder="2348012345678"
          />
          <span className="text-xs text-ink/50">Include the country code; this powers the customer Buy on WhatsApp button.</span>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/70">Primary color</span>
          <input
            type="color"
            value={store.primaryColor}
            onChange={(e) => save({ primaryColor: e.target.value })}
            className="h-10 w-20"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/70">Background</span>
          <input
            type="color"
            value={store.backgroundColor}
            onChange={(e) => save({ backgroundColor: e.target.value })}
            className="h-10 w-20"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/70">Font</span>
          <select
            className="input"
            value={store.font}
            onChange={(e) => save({ font: e.target.value })}
          >
            <option>Inter</option>
            <option>Georgia</option>
            <option>Poppins</option>
            <option>Playfair Display</option>
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-ink/70">Button style</span>
          <select
            className="input"
            value={store.buttonStyle}
            onChange={(e) => save({ buttonStyle: e.target.value as Store["buttonStyle"] })}
          >
            <option value="ROUNDED">Rounded</option>
            <option value="SQUARE">Square</option>
            <option value="PILL">Pill</option>
          </select>
        </label>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-ink/10 p-4">
          <div>
            <p className="font-medium">Publish store</p>
            <p className="text-sm text-ink/50">
              {store.isPublished ? "Your store is live." : "Your store is a draft."}
            </p>
          </div>
          <button
            onClick={() => save({ isPublished: !store.isPublished })}
            className="rounded-full bg-ink px-4 py-2 text-sm text-paper hover:bg-ink/90"
          >
            {store.isPublished ? "Unpublish" : "Publish"}
          </button>
        </div>

        {saved && <p className="text-sm text-green-700">Saved.</p>}
      </div>
    </div>
  );
}
