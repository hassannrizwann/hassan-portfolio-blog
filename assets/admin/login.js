import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { auth, isConfigured, isAdmin } from "../blog-data.js";
const form = document.querySelector("#login-form"), message = document.querySelector("#message");
if (!isConfigured) message.textContent = "Setup needed: add Firebase values and the admin UID first.";
else {
  onAuthStateChanged(auth, async (user) => { if (user && isAdmin(user)) location.replace("/admin"); else if (user) await signOut(auth); });
  form.addEventListener("submit", async (event) => {
    event.preventDefault(); const button = form.querySelector("button"); button.disabled = true; message.textContent = "Signing in…";
    try { const { user } = await signInWithEmailAndPassword(auth, form.email.value.trim(), form.password.value); if (!isAdmin(user)) { await signOut(auth); throw new Error("Invalid email or password."); } location.replace("/admin"); }
    catch { message.textContent = "Invalid email or password."; button.disabled = false; }
  });
}
