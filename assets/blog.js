import { listPublished, isConfigured } from "./blog-data.js";
const list = document.querySelector("#posts");
const search = document.querySelector("#search");
const tagFilter = document.querySelector("#tag-filter");
const more = document.querySelector("#load-more");
let allPosts = [], page = 1;
const dateText = (value) => { const date = value?.toDate ? value.toDate() : new Date(value); return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date); };
const escape = (value = "") => { const node = document.createElement("span"); node.textContent = value; return node.innerHTML.replaceAll('"', "&quot;").replaceAll("'", "&#39;"); };
function render(reset = true) {
  if (reset) { page = 1; list.innerHTML = ""; }
  const term = search.value.trim().toLowerCase(), tag = tagFilter.value;
  const matching = allPosts.filter((post) => (!tag || post.tags?.includes(tag)) && (!term || `${post.title} ${post.excerpt} ${(post.tags || []).join(" ")}`.toLowerCase().includes(term)));
  const slice = matching.slice((page - 1) * 9, page * 9);
  if (!slice.length && page === 1) list.innerHTML = `<p class="empty-state">${allPosts.length ? "No notes match that search." : "No notes published yet. Check back soon."}</p>`;
  for (const post of slice) {
    const row = document.createElement("article"); row.className = "blog-row";
    const cover = post.coverImage?.url ? `<img src="${escape(post.coverImage.url)}" alt="${escape(post.coverImage.alt || "")}" loading="lazy">` : `<div class="blog-cover-placeholder" aria-hidden="true"></div>`;
    row.innerHTML = `${cover}<div><time datetime="${escape(post.publishedAt?.toDate?.().toISOString?.() || post.publishedAt || "")}">${escape(dateText(post.publishedAt))} · ${post.readingTime || 1} min</time><h2><a href="/blog/${encodeURIComponent(post.slug)}">${escape(post.title)}</a></h2><p>${escape(post.excerpt || "")}</p><div class="blog-tags">${(post.tags || []).map((item) => `<span>#${escape(item)}</span>`).join("")}</div></div>`;
    list.append(row);
  }
  more.hidden = matching.length <= page * 9;
}
try {
  if (!isConfigured) throw new Error("Firebase setup is incomplete. Add your project values in assets/firebase-config.js.");
  allPosts = await listPublished();
  [...new Set(allPosts.flatMap((post) => post.tags || []))].sort().forEach((tag) => tagFilter.add(new Option(`#${tag}`, tag)));
  render();
} catch (error) { list.innerHTML = `<p class="empty-state">${escape(error.message || "Notes could not be loaded.")}</p>`; }
search.addEventListener("input", () => render()); tagFilter.addEventListener("change", () => render());
more.addEventListener("click", () => { page++; render(false); });
