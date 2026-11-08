import { listAllPosts, removePost, isConfigured } from "../blog-data.js";
import { requireAdmin, wireLogout } from "./guard.js";
const rows = document.querySelector("#rows"), filter = document.querySelector("#filter"), status = document.querySelector("#status");
wireLogout(); let posts = [];
const escape = (value = "") => { const node = document.createElement("span"); node.textContent = value; return node.innerHTML.replaceAll('"', "&quot;").replaceAll("'", "&#39;"); };
const dateText = (value) => { const date = value?.toDate ? value.toDate() : new Date(value || 0); return Number.isNaN(date.getTime()) ? "" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date); };
function render() {
  const term = filter.value.trim().toLowerCase();
  const found = posts.filter((post) => (!status.value || post.status === status.value) && (!term || `${post.title} ${post.slug} ${(post.tags || []).join(" ")}`.toLowerCase().includes(term)));
  document.querySelector("#counts").textContent = `${posts.filter((p) => p.status === "published").length} published · ${posts.filter((p) => p.status === "draft").length} drafts`;
  rows.innerHTML = found.length ? "" : "<p class='empty-state'>No posts found. Start with a new note.</p>";
  for (const post of found) {
    const row = document.createElement("article"); row.className = "admin-row";
    row.innerHTML = `<div><h2>${escape(post.title || "Untitled")}</h2><p>/${escape(post.slug || "")} · Updated ${escape(dateText(post.updatedAt))}</p></div><span class="status-pill">${escape(post.status)}</span><span>${escape((post.tags || []).map((t) => `#${t}`).join(" "))}</span><div class="row-actions"><a href="/admin/editor?id=${encodeURIComponent(post.id)}">Edit</a>${post.status === "published" ? `<a href="/blog/${encodeURIComponent(post.slug)}" target="_blank">View</a>` : ""}<button data-toggle="${escape(post.id)}">${post.status === "published" ? "Unpublish" : "Publish"}</button><button data-delete="${escape(post.id)}">Delete</button></div>`;
    rows.append(row);
  }
  rows.querySelectorAll("[data-toggle]").forEach((button) => button.addEventListener("click", async () => { const post = posts.find((item) => item.id === button.dataset.toggle); location.href = `/admin/editor?id=${encodeURIComponent(post.id)}&action=${post.status === "published" ? "unpublish" : "publish"}`; }));
  rows.querySelectorAll("[data-delete]").forEach((button) => button.addEventListener("click", async () => {
    const post = posts.find((item) => item.id === button.dataset.delete); if (!confirm(`Delete “${post.title}”? This cannot be undone.`)) return;
    button.disabled = true; try { await removePost(post.id, post.slug); posts = await listAllPosts(); render(); } catch (error) { alert(error.message || "Delete failed."); button.disabled = false; }
  }));
}
filter.addEventListener("input", render); status.addEventListener("change", render);
requireAdmin(async () => { wireLogout(); try { if (!isConfigured) throw new Error("Firebase setup is incomplete."); posts = await listAllPosts(); render(); } catch (error) { rows.textContent = error.message; } });
