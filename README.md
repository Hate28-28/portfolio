[README.md](https://github.com/user-attachments/files/35270267/README.md)
# Mohamad Yassine: portfolio

A static site with no build step. Vercel serves it as it is.

## Updating it
Everything you'd want to change is in `content.js`: projects, experience, education, toolkit and contact details.

- New project: copy one `{ ... }` block in `projects`, paste it, and edit it. Use `"YYYY-MM"` for dates. The site sorts projects and groups them by year on its own.
- New job: add a block to `experience`. Leave `end: ""` while you're still there.
- CV: put your PDF next to `index.html`, named `Mohamad-Yassine-CV.pdf`. To use another name, change `cv` in `content.js`.

Commit the change on GitHub and Vercel redeploys within about a minute.
