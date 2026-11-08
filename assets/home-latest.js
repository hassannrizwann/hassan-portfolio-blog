import { isConfigured, watchPublished } from "./blog-data.js";

const card = document.querySelector("#latest-blog-card");
if (card) {
  const freshness = document.querySelector("#latest-blog-freshness");
  let freshnessTimer;
  const oneDay = 24 * 60 * 60 * 1000;
  const asDate = (value) => value?.toDate ? value.toDate() : new Date(value || 0);
  const setMessage = (message) => {
    card.replaceChildren();
    const text = document.createElement("p");
    text.className = "latest-blog-empty";
    text.textContent = message;
    card.append(text);
  };

  if (!isConfigured) {
    setMessage("The latest post will appear here after Firebase is configured.");
  } else {
    watchPublished((posts) => {
      clearTimeout(freshnessTimer);
      card.replaceChildren();
      const post = posts[0];
      if (!post) {
        freshness.textContent = "LATEST BLOG";
        setMessage("No posts are published yet. New posts will appear here and in the blog archive.");
        return;
      }

      const publishedAt = asDate(post.publishedAt);
      const age = Date.now() - publishedAt.getTime();
      const isFresh = Number.isFinite(age) && age >= 0 && age < oneDay;
      freshness.textContent = isFresh ? "TODAY'S BLOG" : "LATEST BLOG";
      if (isFresh) freshnessTimer = setTimeout(() => { freshness.textContent = "LATEST BLOG"; }, oneDay - age + 1000);

      const time = document.createElement("time");
      if (Number.isFinite(publishedAt.getTime())) {
        time.dateTime = publishedAt.toISOString();
        time.textContent = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(publishedAt);
      }
      const heading = document.createElement("h3");
      heading.textContent = post.title || "Untitled post";
      const excerpt = document.createElement("p");
      excerpt.className = "latest-blog-excerpt";
      excerpt.textContent = post.excerpt || "Open the post to read the latest note.";
      const link = document.createElement("a");
      link.className = "latest-blog-link";
      link.href = `/blog/${encodeURIComponent(post.slug || "")}`;
      link.textContent = "Read the post ↗";
      card.append(time, heading, excerpt, link);

      if (post.coverImage?.url) {
        const image = document.createElement("img");
        image.className = "latest-blog-cover";
        image.src = post.coverImage.url;
        image.alt = post.coverImage.alt || "";
        image.loading = "lazy";
        card.prepend(image);
      }
    }, () => {
      freshness.textContent = "LATEST BLOG";
      setMessage("The latest post could not be loaded right now.");
    });
  }
}
