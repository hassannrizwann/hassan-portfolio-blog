import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { auth, isConfigured, isAdmin } from "../blog-data.js";
export function requireAdmin(callback) {
  if (!isConfigured) { location.replace("/admin/login?setup=1"); return; }
  return onAuthStateChanged(auth, async (user) => {
    if (!user || !isAdmin(user)) { if (user) await signOut(auth); location.replace("/admin/login"); return; }
    callback(user);
  });
}
export function wireLogout() { document.querySelector("#logout")?.addEventListener("click", async () => { await signOut(auth); location.replace("/admin/login"); }); }
