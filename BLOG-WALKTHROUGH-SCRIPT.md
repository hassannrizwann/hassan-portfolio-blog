# Blog CMS walkthrough video

Record this after Firebase is configured and the Vercel site is live. Keep the admin email/password out of the recording.

## 90-second screen recording

**0:00–0:08 — Portfolio and blog**  
Show the existing homepage and click Blog.  
Narration: “I added a writing section to the existing static portfolio. The homepage stays lightweight, and published notes live on their own readable URLs.”

**0:08–0:20 — Admin sign-in and dashboard**  
Open `/admin/login`, sign in privately, and show the dashboard list and status filter.  
Narration: “Publishing is limited to one Firebase Authentication user. Firestore rules enforce that same UID, so the page guard is not the security boundary by itself.”

**0:20–0:42 — Editor**  
Create a draft. Show the title, excerpt, tags, formatting toolbar, slash menu, code block, and table. Upload a cover and inline image with alt text, then insert a YouTube link.  
Narration: “The editor supports rich text, tables, highlighted code, images, and privacy-enhanced YouTube embeds. Images upload straight to Cloudinary; only their URL and alt text are saved in Firestore.”

**0:42–0:56 — Save and publish**  
Save the draft, reload to show it persisted, then publish.  
Narration: “Drafts autosave while I write. Before publishing, the editor checks the excerpt and cover alt text. The public routes only read published posts.”

**0:56–1:13 — Public post**  
Show `/blog`, search/filter, open the post, scroll through the embed, and use a share control.  
Narration: “Readers can search and filter notes, open the full post, watch the embedded video, and share or copy its URL.”

**1:13–1:25 — Unpublish and security**  
Return to the dashboard, unpublish, and refresh the public blog.  
Narration: “Unpublishing removes the post from public reads. Firebase protects the content; Cloudinary stores media; Vercel serves the static site and route rewrites.”

**1:25–1:30 — Close**  
Show the public blog address and repository address.  
Narration: “That’s the portfolio blog CMS, built around Firebase and Cloudinary.”
