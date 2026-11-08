# Blog CMS setup

The portfolio, public blog, post view, and admin views are served through one HTML entry point, `index.htm`. The blog uses Firebase Authentication and Cloud Firestore for login and post data, and Cloudinary for images. Admin access is restricted by both the browser guard and Firestore rules.

Opening `index.htm` directly from File Explorer shows the portfolio. Its Blog link opens the hosted blog so Firebase modules and authentication work on the secure Vercel origin. The blog page includes an admin sign-in link and a password reset action.

## 1. Firebase

1. Hassan's Firebase project is `hassan-portfoli`; its web app is already registered and configured in `assets/firebase-config.js`. Do not use the reference author's Firebase project.
2. Enable Email/Password under Authentication → Sign-in method. Create the single admin account there.
3. Firebase web app configuration is saved in `assets/firebase-config.js`. These browser config values are public; Firestore rules protect the data.
4. Hassan's admin UID is configured in both `assets/firebase-config.js` and `firestore.rules`.
5. The Firestore database is provisioned as Standard edition in `asia-south1` (Mumbai), starting in production mode. `firestore.rules` has been published: public reads are limited to published posts, and writes are limited to Hassan's configured admin UID.
6. Firebase Authentication → Settings → Authorized domains includes `hassan-portfolio-blog.vercel.app` for the deployed site.

Post documents live in `posts/{postId}` and use `title`, `slug`, `excerpt`, `contentJson`, `contentHtml`, optional `coverImage: {url, alt}`, lowercase `tags`, `status`, timestamps, `readingTime`, and SEO metadata. `slugs/{slug}` maps a URL slug to a post ID.

The portfolio home page shows the newest published post. It is labeled “Today's blog” for its first 24 hours, then “Latest blog”; publishing a newer post replaces the home-page feature while older posts remain in the public archive.

## 2. Cloudinary

Hassan's Cloudinary cloud name is configured in `assets/cloudinary-config.js`. The `hassan_blog` unsigned upload preset is saved. It uses the `blog` asset folder, permits JPG, PNG, WebP, GIF, and AVIF, generates random public IDs, and disallows caller-supplied public IDs. The editor enforces an 8 MB file limit. The preset name and cloud name are public identifiers; do not add an API secret to this site.

## 3. Vercel hosting

Deploy this folder as a Vercel static site with the included `vercel.json`. Firebase handles sign-in and post data; Cloudinary stores images. Vercel serves the static assets and rewrites the portfolio, blog, and admin routes to `index.htm`. No other application service or serverless function is used. The source repository is `https://github.com/hassannrizwann/hassan-portfolio-blog`.

## 4. First run checklist

- Sign in at `/admin/login` and confirm a non-admin account is rejected.
- Create and save a draft, reload the editor, and verify it was restored.
- Add an image with alt text and a YouTube link, then publish.
- Open `/blog` and the post route on desktop and mobile.
- Unpublish and verify it disappears from the public list. Delete the disposable test post afterward.

Deleting a post also removes its Firestore slug reservation. Cloudinary images are retained and must be removed from the Cloudinary dashboard when no longer needed.

## Walkthrough video outline

1. Show the existing portfolio and the new Blog navigation link.
2. Open `/admin/login`, sign in, and show the private dashboard and draft/published filters.
3. Create a post: enter title/excerpt/tags, format text, upload a cover and inline image with alt text, and embed a YouTube video.
4. Save a draft, reload to show persistence, then publish and open its public URL.
5. Demonstrate search, tag filter, sharing, unpublishing, and the public 404 for an unknown slug.
6. Close with the Firebase UID rule and explain that Cloudinary handles image storage while Firestore stores the image URL.
