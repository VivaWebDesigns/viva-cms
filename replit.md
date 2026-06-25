# Reusable Viva CMS

This workspace contains a reusable CMS starter with authentication, setup, admin dashboard, content tools, design controls, system settings, docs, backups, and generic public page rendering.

## Admin Areas

- Dashboard
- Content: pages, page editor, media, sections, forms, SEO, redirects, menus, sidebars
- Design: branding, colors, typography
- System: users, settings, docs, backups

## Public Runtime

- `/` renders the published CMS `home` page.
- `/:slug` renders published CMS pages.
- `/preview/cms/:id` renders authenticated draft previews.

Domain-specific features from the source project were intentionally removed so this can be reused as a clean starter.
