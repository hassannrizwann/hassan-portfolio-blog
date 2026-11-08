import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore, collection, doc, getDoc, getDocs, query, where, setDoc,
  deleteDoc, serverTimestamp, Timestamp, runTransaction,
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { firebaseConfig, ADMIN_UID } from "./firebase-config.js";

const configured = firebaseConfig.apiKey !== "REPLACE_WITH_FIREBASE_API_KEY" && firebaseConfig.projectId !== "REPLACE_WITH_PROJECT_ID";
const app = configured ? initializeApp(firebaseConfig) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const isConfigured = configured;
export const isAdmin = (user) => Boolean(user && ADMIN_UID !== "REPLACE_WITH_HASSAN_ADMIN_UID" && user.uid === ADMIN_UID);
const slugRef = (slug) => doc(db, "slugs", slug);
const postRef = (id) => doc(db, "posts", id);
const postsRef = () => collection(db, "posts");

export function slugify(value) {
  return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 80);
}

export function readingTime(html = "") {
  const text = html.replace(/<[^>]*>/g, " ").replace(/&\w+;/g, " ");
  return Math.max(1, Math.ceil(text.trim().split(/\s+/).filter(Boolean).length / 220));
}

export async function listPublished() {
  const snapshot = await getDocs(query(postsRef(), where("status", "==", "published")));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => dateValue(b.publishedAt) - dateValue(a.publishedAt));
}
export async function getPublishedBySlug(slug) {
  try {
    const slugDoc = await getDoc(slugRef(slug));
    if (!slugDoc.exists()) return null;
    const post = await getDoc(postRef(slugDoc.data().postId));
    return post.exists() && post.data().status === "published" ? { id: post.id, ...post.data() } : null;
  } catch { return null; }
}
export async function listAllPosts() {
  const snapshot = await getDocs(postsRef());
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => dateValue(b.updatedAt) - dateValue(a.updatedAt));
}
function dateValue(date) { return date?.toDate ? date.toDate().getTime() : new Date(date || 0).getTime(); }

export async function savePost(id, data, publish = false) {
  if (!isAdmin(auth.currentUser)) throw new Error("Admin access required.");
  const cleanSlug = slugify(data.slug || data.title || "");
  if (!cleanSlug) throw new Error("Add a title to create a URL.");
  const newId = id || crypto.randomUUID();
  await runTransaction(db, async (transaction) => {
    const previous = await transaction.get(postRef(newId));
    const previousData = previous.exists() ? previous.data() : null;
    const occupied = await transaction.get(slugRef(cleanSlug));
    if (occupied.exists() && occupied.data().postId !== newId) throw new Error("That URL is already used by another post.");
    const now = serverTimestamp();
    const publishedAt = data.publishedAt ? Timestamp.fromDate(new Date(data.publishedAt)) : (previousData?.publishedAt || now);
    const post = {
      title: data.title.trim(), slug: cleanSlug, excerpt: data.excerpt.trim(),
      contentJson: data.contentJson || "{}", contentHtml: data.contentHtml || "",
      coverImage: data.coverImage || null, tags: (data.tags || []).map((tag) => tag.trim().toLowerCase()).filter(Boolean),
      status: publish ? "published" : "draft", publishedAt,
      createdAt: previousData?.createdAt || now, updatedAt: now,
      readingTime: readingTime(data.contentHtml), seo: { metaTitle: data.metaTitle || data.title, metaDescription: data.metaDescription || data.excerpt },
    };
    transaction.set(slugRef(cleanSlug), { postId: newId });
    if (previousData?.slug && previousData.slug !== cleanSlug) transaction.delete(slugRef(previousData.slug));
    transaction.set(postRef(newId), post);
  });
  return newId;
}
export async function removePost(id, slug) {
  if (!isAdmin(auth.currentUser)) throw new Error("Admin access required.");
  if (slug) await deleteDoc(slugRef(slug));
  await deleteDoc(postRef(id));
}
