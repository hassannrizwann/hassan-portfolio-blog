import { getPublishedBySlug, isConfigured } from "./blog-data.js";
import { sanitizeHtml } from "./sanitize.js";
const root = document.querySelector("#post");
const escape = (value = "") => { const node = document.createElement("span"); node.textContent = value; return node.innerHTML.replaceAll('"', "&quot;").replaceAll("'", "&#39;"); };
const dateText = (value) => { const date = value?.toDate ? value.toDate() : new Date(value); return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { dateStyle: "long" }).format(date); };
const slug = decodeURIComponent(location.pathname.split("/").filter(Boolean).at(-1) || "");
try {
  if (!isConfigured) throw new Error("Firebase setup is incomplete. Add your project values in assets/firebase-config.js.");
  const post = await getPublishedBySlug(slug);
  if (!post) { document.title = "Post not found — Hassan"; document.querySelector('meta[name="robots"]').content = "noindex, nofollow"; root.innerHTML = '<a class="post-back" href="/blog">← Back to notes</a><h1>Post not found</h1><p>This note may have been unpublished or moved.</p>'; }
  else {
    document.title = `${post.seo?.metaTitle || post.title} — Hassan`;
    document.querySelector('meta[name="description"]').content = post.seo?.metaDescription || post.excerpt || "";
    document.querySelector('meta[name="robots"]').content = "index, follow";
    document.querySelector('link[rel="canonical"]').href = location.href;
    document.querySelector('meta[property="og:title"]').content = post.title;
    document.querySelector('meta[property="og:description"]').content = post.seo?.metaDescription || post.excerpt || "";
    if (post.coverImage?.url) { const image = document.createElement("meta"); image.setAttribute("property", "og:image"); image.content = post.coverImage.url; document.head.append(image); }
    const shareUrl = location.href;
    root.innerHTML = `<a class="post-back" href="/blog">← All notes</a><div class="blog-tags">${(post.tags || []).map((tag) => `<span>#${escape(tag)}</span>`).join("")}</div><h1>${escape(post.title)}</h1><div class="post-meta">${escape(dateText(post.publishedAt))} · ${post.readingTime || 1} min read</div>${post.coverImage?.url ? `<img class="post-cover" src="${escape(post.coverImage.url)}" alt="${escape(post.coverImage.alt || "")}">` : ""}<article class="prose">${sanitizeHtml(post.contentHtml)}</article><div class="share-row"><button data-share="x">Share on X</button><button data-share="linkedin">LinkedIn</button><button data-share="whatsapp">WhatsApp</button><button data-share="copy">Copy link</button></div>`;
    root.querySelectorAll("[data-share]").forEach((button) => button.addEventListener("click", async () => {
      const target = button.dataset.share, encodedUrl = encodeURIComponent(shareUrl), title = encodeURIComponent(post.title);
      const urls = { x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${title}`, linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, whatsapp: `https://wa.me/?text=${title}%20${encodedUrl}` };
      if (target === "copy") { try { await navigator.clipboard.writeText(shareUrl); button.textContent = "Copied"; } catch { button.textContent = "Copy unavailable"; } }
      else window.open(urls[target], "_blank", "noopener,noreferrer,width=680,height=580");
    }));
  }
} catch (error) { root.innerHTML = `<p class="empty-state">${escape(error.message || "This note could not be loaded.")}</p><a href="/blog">Back to notes</a>`; }
