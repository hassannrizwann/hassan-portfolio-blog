import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { db, isConfigured, savePost, slugify } from "../blog-data.js";
import { requireAdmin, wireLogout } from "./guard.js";
import { sanitizeHtml, youtubeEmbed } from "../sanitize.js";
import { createBlogEditor } from "./editor-bundle.js";
import { CLOUDINARY_CLOUD, CLOUDINARY_PRESET } from "../cloudinary-config.js";
const $ = (selector) => document.querySelector(selector);
const content = $("#content"), state = $("#save-state"), progress = $("#upload-progress");
let postId = new URLSearchParams(location.search).get("id"), changed = false, titleEdited = false, saving = false, applying = false, editor;
wireLogout();
const fields = { title: $("#title"), slug: $("#slug"), excerpt: $("#excerpt"), tags: $("#tags"), coverUrl: $("#cover-url"), coverAlt: $("#cover-alt"), seoTitle: $("#seo-title"), seoDescription: $("#seo-description"), publishDate: $("#publish-date") };
const markChanged = () => { if (!applying) { changed = true; state.textContent = "Unsaved changes"; } };
function updateCount(instance = editor) { const words = (instance?.getText().trim().match(/\S+/g) || []).length; $("#word-count").textContent = `${words} words · ${Math.max(1, Math.ceil(words / 220))} min read`; }
function startEditor(html = "<p></p>") { editor?.destroy(); editor = createBlogEditor(content, html, (instance) => { if (!applying) markChanged(); updateCount(instance); }); updateCount(); }
Object.entries(fields).forEach(([name, el]) => el.addEventListener("input", () => {
  markChanged();
  if (name === "title" && !titleEdited && !postId) fields.slug.value = slugify(el.value);
  if (name === "title" && !fields.seoTitle.dataset.touched) fields.seoTitle.value = el.value;
  if (name === "excerpt" && !fields.seoDescription.dataset.touched) fields.seoDescription.value = el.value;
}));
fields.slug.addEventListener("input", () => { titleEdited = true; fields.slug.value = slugify(fields.slug.value); });
fields.seoTitle.addEventListener("input", () => { fields.seoTitle.dataset.touched = "1"; }); fields.seoDescription.addEventListener("input", () => { fields.seoDescription.dataset.touched = "1"; });
function collect() {
  const html = sanitizeHtml(editor?.getHTML() || "");
  return { title: fields.title.value.trim(), slug: fields.slug.value.trim(), excerpt: fields.excerpt.value.trim(), tags: fields.tags.value.split(",").map((v) => v.trim().toLowerCase()).filter(Boolean), coverImage: fields.coverUrl.value.trim() ? { url: fields.coverUrl.value.trim(), alt: fields.coverAlt.value.trim() } : null, contentHtml: html, contentJson: JSON.stringify(editor?.getJSON() || {}), metaTitle: fields.seoTitle.value.trim(), metaDescription: fields.seoDescription.value.trim(), publishedAt: fields.publishDate.value || "" };
}
async function save(publish) {
  if (saving) return; const data = collect();
  if (!data.title) { fields.title.focus(); alert("Add a title before saving."); return; }
  if (publish && (!data.excerpt || (data.coverImage && !data.coverImage.alt))) { alert("Add an excerpt and cover image alt text before publishing."); return; }
  saving = true; state.textContent = publish ? "Publishing…" : "Saving…";
  try {
    postId = await savePost(postId, data, publish); changed = false; state.textContent = publish ? "Published" : "Draft saved"; history.replaceState({}, "", `/admin/editor?id=${encodeURIComponent(postId)}`);
    if (publish) { const openPost = confirm("Published. Open the public post?"); if (openPost) window.open(`/blog/${encodeURIComponent(slugify(data.slug))}`, "_blank", "noopener,noreferrer"); }
  } catch (error) { state.textContent = "Save failed"; alert(error.message || "The post could not be saved."); }
  finally { saving = false; }
}
$("#save-draft").addEventListener("click", () => save(false)); $("#publish").addEventListener("click", () => save(true));
$("#preview").addEventListener("click", () => {
  const data = collect(), preview = window.open("", "_blank"); if (!preview) return alert("Allow the preview window to open.");
  preview.document.write(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(data.title)}</title><link rel="stylesheet" href="${location.origin}/style.css"><link rel="stylesheet" href="${location.origin}/assets/blog.css"><main class="wrap post-shell"><a href="/blog">Preview · back</a><h1>${escapeHtml(data.title)}</h1><p>${escapeHtml(data.excerpt)}</p>${data.coverImage ? `<img class="post-cover" src="${escapeHtml(data.coverImage.url)}" alt="${escapeHtml(data.coverImage.alt)}">` : ""}<article class="prose">${data.contentHtml}</article></main>`); preview.document.close();
});
function escapeHtml(value = "") { const node = document.createElement("span"); node.textContent = value; return node.innerHTML.replaceAll('"', "&quot;").replaceAll("'", "&#39;"); }
const commands = {
  bold: () => editor.chain().focus().toggleBold().run(), italic: () => editor.chain().focus().toggleItalic().run(), underline: () => editor.chain().focus().toggleUnderline().run(), strikeThrough: () => editor.chain().focus().toggleStrike().run(),
  insertUnorderedList: () => editor.chain().focus().toggleBulletList().run(), insertOrderedList: () => editor.chain().focus().toggleOrderedList().run(), undo: () => editor.chain().focus().undo().run(), redo: () => editor.chain().focus().redo().run(),
  code: () => editor.chain().focus().toggleCode().run(), highlight: () => editor.chain().focus().toggleHighlight().run(),
};
document.querySelectorAll("[data-cmd]").forEach((button) => button.addEventListener("click", () => {
  const cmd = button.dataset.cmd; editor?.chain().focus();
  if (cmd === "formatBlock") { if (button.dataset.value === "blockquote") editor.chain().focus().toggleBlockquote().run(); else editor.chain().focus().toggleHeading({ level: Number(button.dataset.value.slice(1)) }).run(); }
  else commands[cmd]?.(); markChanged();
}));
$("#block-type").addEventListener("change", (event) => { const type = event.target.value; if (type === "p") editor.chain().focus().setParagraph().run(); else editor.chain().focus().toggleHeading({ level: Number(type.slice(1)) }).run(); markChanged(); });
$("#add-link").addEventListener("click", () => { const href = prompt("Paste an https:// link"); if (!href) return; try { if (new URL(href).protocol !== "https:") throw Error(); editor.chain().focus().extendMarkRange("link").setLink({ href }).run(); markChanged(); } catch { alert("Use a valid https:// address."); } });
$("#add-video").addEventListener("click", () => { const src = youtubeEmbed(prompt("Paste a YouTube watch, short, live, or embed link") || ""); if (!src) return alert("That does not look like a valid YouTube video link."); editor.commands.setYoutubeVideo({ src }); markChanged(); });
$("#add-table").addEventListener("click", () => { editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); markChanged(); });
$("#add-divider").addEventListener("click", () => { editor.chain().focus().setHorizontalRule().run(); markChanged(); });
document.querySelectorAll("[data-align]").forEach((button) => button.addEventListener("click", () => { editor.chain().focus().setTextAlign(button.dataset.align).run(); markChanged(); }));
function upload(file, onProgress) { return new Promise((resolve, reject) => {
  if (!file || !/^image\/(jpeg|png|webp|gif|avif)$/.test(file.type) || file.size > 8 * 1024 * 1024) return reject(new Error("Choose a JPG, PNG, WebP, GIF, or AVIF image under 8 MB."));
  const request = new XMLHttpRequest(); request.open("POST", `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`); request.upload.onprogress = (event) => event.lengthComputable && onProgress(Math.round(event.loaded / event.total * 100));
  request.onload = () => { try { const result = JSON.parse(request.responseText); request.status >= 200 && request.status < 300 ? resolve(result) : reject(new Error(result.error?.message || "Image upload failed.")); } catch { reject(new Error("Image upload failed.")); } };
  request.onerror = () => reject(new Error("Could not reach Cloudinary.")); const form = new FormData(); form.append("file", file); form.append("upload_preset", CLOUDINARY_PRESET); request.send(form);
}); }
$("#cover-file").addEventListener("change", async (event) => { const file = event.target.files[0]; if (!file) return; progress.hidden = false; progress.value = 0; try { const result = await upload(file, (value) => progress.value = value); fields.coverUrl.value = result.secure_url; fields.coverAlt.value ||= file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "); markChanged(); $("#upload-status").textContent = "Cover uploaded."; } catch (error) { $("#upload-status").textContent = error.message; } finally { progress.hidden = true; event.target.value = ""; } });
$("#add-image").addEventListener("click", () => $("#image-file").click());
$("#image-file").addEventListener("change", async (event) => { const file = event.target.files[0]; if (!file) return; $("#upload-status").textContent = "Uploading image…"; try { const result = await upload(file, (value) => $("#upload-status").textContent = `Uploading image: ${value}%`); const alt = prompt("Describe this image for readers who use a screen reader") || ""; if (!alt.trim()) throw new Error("Add alt text before inserting this image."); editor.chain().focus().setImage({ src: result.secure_url, alt: alt.trim() }).run(); markChanged(); $("#upload-status").textContent = "Image added."; } catch (error) { $("#upload-status").textContent = error.message; } finally { event.target.value = ""; } });
async function insertDroppedImage(file) {
  try { const result = await upload(file, (value) => $("#upload-status").textContent = `Uploading image: ${value}%`); const alt = prompt("Describe this image for readers who use a screen reader") || ""; if (!alt.trim()) throw new Error("Add alt text before inserting this image."); editor.chain().focus().setImage({ src: result.secure_url, alt: alt.trim() }).run(); markChanged(); $("#upload-status").textContent = "Image added."; }
  catch (error) { $("#upload-status").textContent = error.message; }
}
content.addEventListener("dragover", (event) => { if (event.dataTransfer?.types.includes("Files")) event.preventDefault(); });
content.addEventListener("drop", (event) => { const file = [...(event.dataTransfer?.files || [])].find((item) => item.type.startsWith("image/")); if (file) { event.preventDefault(); insertDroppedImage(file); } });
content.addEventListener("paste", (event) => { const file = [...(event.clipboardData?.items || [])].map((item) => item.getAsFile()).find((item) => item?.type.startsWith("image/")); if (file) { event.preventDefault(); insertDroppedImage(file); } });
const coverDrop = $(".cover-fields");
coverDrop.addEventListener("dragover", (event) => { if (event.dataTransfer?.types.includes("Files")) event.preventDefault(); });
coverDrop.addEventListener("drop", async (event) => { const file = [...(event.dataTransfer?.files || [])].find((item) => item.type.startsWith("image/")); if (!file) return; event.preventDefault(); try { const result = await upload(file, (value) => progress.value = value); fields.coverUrl.value = result.secure_url; fields.coverAlt.value ||= file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "); markChanged(); $("#upload-status").textContent = "Cover uploaded."; } catch (error) { $("#upload-status").textContent = error.message; } });
$("#block-type").insertAdjacentHTML("afterend", '<button data-align="left" aria-label="Align left">⇤</button><button data-align="center" aria-label="Align center">↔</button><button data-align="right" aria-label="Align right">⇥</button><button data-cmd="code">Code</button><button data-cmd="highlight">Highlight</button>');
document.querySelectorAll("[data-align]").forEach((button) => button.addEventListener("click", () => { editor.chain().focus().setTextAlign(button.dataset.align).run(); markChanged(); }));
document.querySelectorAll("[data-cmd='code'],[data-cmd='highlight']").forEach((button) => button.addEventListener("click", () => { commands[button.dataset.cmd]?.(); markChanged(); }));
$("#add-table").addEventListener("click", () => { editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); markChanged(); });
$("#add-divider").addEventListener("click", () => { editor.chain().focus().setHorizontalRule().run(); markChanged(); });
const slashMenu = $("#slash-menu");
content.addEventListener("keydown", (event) => {
  if (event.key === "/" && editor.state.selection.$from.parentOffset === 0) { event.preventDefault(); slashMenu.hidden = false; slashMenu.querySelector("button")?.focus(); }
  if (event.key === "Escape") slashMenu.hidden = true;
});
slashMenu.querySelectorAll("[data-slash]").forEach((button) => button.addEventListener("click", () => {
  const commands = { heading: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), bullet: () => editor.chain().focus().toggleBulletList().run(), quote: () => editor.chain().focus().toggleBlockquote().run(), code: () => editor.chain().focus().toggleCodeBlock().run(), table: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(), divider: () => editor.chain().focus().setHorizontalRule().run() };
  commands[button.dataset.slash]?.(); slashMenu.hidden = true; markChanged(); editor?.commands.focus();
}));
content.addEventListener("keydown", (event) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") { event.preventDefault(); save(false); } });
window.addEventListener("beforeunload", (event) => { if (changed) { event.preventDefault(); event.returnValue = ""; } });
setInterval(() => { if (changed) save(false); }, 20000);
requireAdmin(async () => {
  wireLogout();
  try {
    if (!isConfigured) throw new Error("Firebase setup is incomplete.");
    let saved = null;
    if (postId) { const snapshot = await getDoc(doc(db, "posts", postId)); if (!snapshot.exists()) throw new Error("Post not found."); saved = snapshot.data(); }
    if (saved) {
      applying = true; fields.title.value = saved.title || ""; fields.slug.value = saved.slug || ""; fields.excerpt.value = saved.excerpt || ""; fields.tags.value = (saved.tags || []).join(", "); fields.coverUrl.value = saved.coverImage?.url || ""; fields.coverAlt.value = saved.coverImage?.alt || ""; fields.seoTitle.value = saved.seo?.metaTitle || ""; fields.seoDescription.value = saved.seo?.metaDescription || "";
      if (saved.publishedAt?.toDate) { const d = saved.publishedAt.toDate(); fields.publishDate.value = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16); }
      startEditor(sanitizeHtml(saved.contentHtml || "<p></p>")); applying = false;
      const action = new URLSearchParams(location.search).get("action"); if (action === "unpublish") { await savePost(postId, collect(), false); location.replace("/admin"); return; } if (action === "publish") { await save(true); return; }
    } else startEditor();
    updateCount();
  } catch (error) { alert(error.message || "Could not load this post."); location.replace("/admin"); }
});
