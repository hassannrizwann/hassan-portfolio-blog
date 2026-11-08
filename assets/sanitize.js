import { sanitizeBlogHtml } from "./sanitize-bundle.js";
export function sanitizeHtml(html) {
  const clean = sanitizeBlogHtml(html);
  const documentView = new DOMParser().parseFromString(`<div>${clean}</div>`, "text/html");
  const root = documentView.body.firstElementChild;
  for (const image of root.querySelectorAll("img")) {
    try {
      const url = new URL(image.getAttribute("src") || "");
      if (url.protocol !== "https:" || !(url.hostname === "res.cloudinary.com" || url.hostname.endsWith(".cloudinary.com"))) { image.remove(); continue; }
      image.alt ||= ""; image.loading = "lazy";
    } catch { image.remove(); }
  }
  for (const frame of root.querySelectorAll("iframe")) {
    try {
      const url = new URL(frame.getAttribute("src") || "");
      if (url.protocol !== "https:" || url.hostname !== "www.youtube-nocookie.com") { frame.remove(); continue; }
      frame.loading = "lazy"; frame.referrerPolicy = "strict-origin-when-cross-origin";
    } catch { frame.remove(); }
  }
  for (const link of root.querySelectorAll("a[href]")) {
    try { const url = new URL(link.href); if (url.protocol !== "https:") link.removeAttribute("href"); else { link.target = "_blank"; link.rel = "noopener noreferrer"; } }
    catch { link.removeAttribute("href"); }
  }
  return root.innerHTML;
}

export function youtubeEmbed(value) {
  try {
    const url = new URL(value.trim());
    let id = url.hostname === "youtu.be" ? url.pathname.slice(1) : url.searchParams.get("v");
    if (!id && ["youtube.com", "www.youtube.com", "m.youtube.com"].includes(url.hostname)) id = url.pathname.match(/^\/(?:embed|shorts|live)\/([\w-]+)/)?.[1];
    return id && /^[\w-]{11}$/.test(id) ? `https://www.youtube-nocookie.com/embed/${id}` : "";
  } catch { return ""; }
}
