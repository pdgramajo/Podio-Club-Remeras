import { useEffect } from "react";

/**
 * Route-scoped document head manager (site-seo spec). Site-wide defaults
 * live statically in index.html; this hook owns only the tags each route
 * needs. Ownership is explicit: every tag it manages carries the
 * `data-head-route` marker, all owned tags are removed on every sync and on
 * unmount, so stale metadata between routes is impossible by construction
 * ("No stale metadata between routes").
 *
 * Static default tags (description, og:title/og:description/og:image,
 * twitter:*) are claimed once — removed from the initial document and
 * remembered — so the head never holds two tags for the same field, and the
 * defaults return when the hook is finished (null data or unmount), leaving
 * the document exactly as the shell shipped it.
 */
export interface HeadData {
  title: string;
  description: string;
  /** Absolute or relative URL — emitted as og:image / twitter:image. */
  image?: string;
  /** Route URL — emitted as og:url / twitter:url. */
  url?: string;
}

/** Mirrors the site defaults in index.html (site-seo "Initial document metadata"). */
const DEFAULT_TITLE = "Podio Club — Remeras de fútbol";
const DEFAULT_DESCRIPTION =
  "Remeras de fútbol réplica para jugar y para alentar. Camisetas de selección y clubes argentinos, con envío por WhatsApp.";
const DEFAULT_OG_IMAGE = "/og-cover.svg";

interface ManagedMeta {
  name?: string;
  property?: string;
  /** Static default content to fall back to when the route provides none. */
  defaultContent?: string;
}

const MANAGED_META: readonly ManagedMeta[] = [
  { name: "description", defaultContent: DEFAULT_DESCRIPTION },
  { property: "og:title", defaultContent: DEFAULT_TITLE },
  { property: "og:description", defaultContent: DEFAULT_DESCRIPTION },
  { property: "og:image", defaultContent: DEFAULT_OG_IMAGE },
  { name: "twitter:title", defaultContent: DEFAULT_TITLE },
  { name: "twitter:description", defaultContent: DEFAULT_DESCRIPTION },
  { name: "twitter:image", defaultContent: DEFAULT_OG_IMAGE },
];

/** Static default tags claimed (removed) from the initial document, once. */
let claimedDefaults: HTMLMetaElement[] | null = null;

function selectorOf(meta: ManagedMeta): string {
  return meta.name ? `meta[name="${meta.name}"]` : `meta[property="${meta.property}"]`;
}

function claimStaticDefaults(): void {
  if (claimedDefaults !== null) {
    return;
  }
  claimedDefaults = [];
  for (const meta of MANAGED_META) {
    const element = document.head.querySelector<HTMLMetaElement>(
      `${selectorOf(meta)}:not([data-head-route])`,
    );
    if (element) {
      element.remove();
      claimedDefaults.push(element);
    }
  }
}

function restoreStaticDefaults(): void {
  if (claimedDefaults === null) {
    return;
  }
  for (const element of claimedDefaults) {
    document.head.appendChild(element);
  }
  claimedDefaults = null;
}

function clearOwnedTags(): void {
  document.head.querySelectorAll("[data-head-route]").forEach((element) => element.remove());
}

function upsertMeta(meta: ManagedMeta, content: string): void {
  const element = document.createElement("meta");
  if (meta.name) {
    element.name = meta.name;
  } else if (meta.property) {
    element.setAttribute("property", meta.property);
  }
  element.setAttribute("content", content);
  element.setAttribute("data-head-route", "true");
  document.head.appendChild(element);
}

/** Route value for a managed field, falling back to its static default. */
function routeContent(meta: ManagedMeta, data: HeadData): string {
  switch (meta.name ?? meta.property) {
    case "description":
      return data.description;
    case "og:title":
    case "twitter:title":
      return data.title;
    case "og:description":
    case "twitter:description":
      return data.description;
    case "og:image":
    case "twitter:image":
      return data.image ?? meta.defaultContent ?? "";
    default:
      return meta.defaultContent ?? "";
  }
}

export function useDocumentHead(data: HeadData | null): void {
  // Primitives only, so the sync effect below satisfies exhaustive-deps while
  // re-running solely on actual head-value changes (never on object identity
  // churn from page re-renders).
  const title = data?.title;
  const description = data?.description;
  const image = data?.image;
  const url = data?.url;

  // Route sync: runs on every route change (direct load and SPA navigation).
  // A missing title means null data: clear route tags and restore defaults.
  useEffect(() => {
    if (title === undefined) {
      clearOwnedTags();
      restoreStaticDefaults();
      document.title = DEFAULT_TITLE;
      return;
    }

    claimStaticDefaults();
    clearOwnedTags();
    document.title = title;

    for (const meta of MANAGED_META) {
      upsertMeta(meta, routeContent(meta, { title, description: description ?? "", image, url }));
    }
    // The url family has no static default — emit it only when provided.
    if (url) {
      upsertMeta({ property: "og:url" }, url);
      upsertMeta({ name: "twitter:url" }, url);
    }
    // No cleanup here: the next sync clears owned tags before reinstalling,
    // and unmount is handled by the dedicated effect below.
  }, [title, description, image, url]);

  // Unmount cleanup: leave the document back at its static, route-free state.
  useEffect(() => {
    return () => {
      clearOwnedTags();
      restoreStaticDefaults();
    };
  }, []);
}
