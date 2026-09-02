"use client";
import { useEffect } from "react";
export default function VisitTracker({ slug }: { slug: string }) { useEffect(() => { const key = "silverforge:visitor"; let id = localStorage.getItem(key); if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); } fetch(`/api/public/store/${slug}/visit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visitorId: id }) }); }, [slug]); return null; }
