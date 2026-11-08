const path = location.pathname.replace(/\/+$/, "") || "/";
const root = document.querySelector("#app-root");

const routes = [
  { test: (value) => value === "/admin/login", template: "admin-login", title: "Admin sign in — Hassan", admin: true, module: "/assets/admin/login.js" },
  { test: (value) => value === "/admin/editor", template: "admin-editor", title: "Post editor — Hassan", admin: true, module: "/assets/admin/editor.js" },
  { test: (value) => value === "/admin", template: "admin-dashboard", title: "Blog dashboard — Hassan", admin: true, module: "/assets/admin/dashboard.js" },
  { test: (value) => value === "/blog", template: "blog", title: "Notes & Ideas — Hassan", module: "/assets/blog.js" },
  { test: (value) => value.startsWith("/blog/"), template: "post", title: "Post — Hassan", module: "/assets/post.js" },
];
const route = routes.find((item) => item.test(path)) || { template: "home", title: "Hassan — AI Automation & Data" };

document.title = route.title;
document.body.classList.toggle("admin-body", Boolean(route.admin));
document.querySelector('meta[name="robots"]').content = route.admin ? "noindex, nofollow" : "index, follow";
document.querySelector('link[rel="canonical"]').href = location.href.split("?")[0];
if (route.template !== "home") {
  const template = document.querySelector(`#template-${route.template}`);
  if (!template) throw new Error(`Missing page template: ${route.template}`);
  root.replaceChildren(template.content.cloneNode(true));
}

if (route.template === "blog" || (route.template === "home" && location.protocol !== "file:")) {
  const siteScript = document.createElement("script");
  siteScript.src = "/script.js";
  document.body.append(siteScript);
}
if (route.module) await import(route.module);
