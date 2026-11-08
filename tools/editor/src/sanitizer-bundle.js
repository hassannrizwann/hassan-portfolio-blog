import DOMPurify from "dompurify";

DOMPurify.addHook("uponSanitizeElement", (node, data) => {
  if (data.tagName === "iframe") {
    try { if (new URL(node.getAttribute("src") || "").hostname !== "www.youtube-nocookie.com") node.remove(); }
    catch { node.remove(); }
  }
});
DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
  if (data.attrName !== "src" && data.attrName !== "href") return;
  try {
    const url = new URL(data.attrValue, location.origin);
    if (url.protocol !== "https:") { data.keepAttr = false; return; }
    if (node.nodeName === "IMG" && !(url.hostname === "res.cloudinary.com" || url.hostname.endsWith(".cloudinary.com"))) data.keepAttr = false;
    if (node.nodeName === "IFRAME" && url.hostname !== "www.youtube-nocookie.com") data.keepAttr = false;
  } catch { data.keepAttr = false; }
});
export function sanitizeBlogHtml(html) {
  return DOMPurify.sanitize(html || "", {
    ALLOWED_TAGS: ["p", "br", "h1", "h2", "h3", "h4", "strong", "b", "em", "i", "u", "s", "del", "mark", "code", "pre", "blockquote", "ul", "ol", "li", "hr", "a", "img", "iframe", "table", "thead", "tbody", "tr", "th", "td", "div", "span"],
    ALLOWED_ATTR: ["href", "target", "rel", "src", "alt", "width", "height", "title", "allow", "allowfullscreen", "loading", "referrerpolicy", "colspan", "rowspan", "class", "data-youtube-video", "data-language"],
    ALLOW_DATA_ATTR: false, ADD_ATTR: ["allowfullscreen"],
    FORBID_TAGS: ["script", "style", "object", "embed", "form", "input", "button", "svg", "math"],
    FORBID_ATTR: ["style", "onerror", "onclick", "onload"],
  });
}
