# CMS Admin Guide

This starter keeps the reusable CMS surface: Dashboard, Content, Design, and System.

## First Run

1. Open `/setup`.
2. Create the first admin account.
3. Log in at `/auth/login`.
4. Use Content to create pages, forms, media, sections, menus, sidebars, SEO settings, and redirects.

## Roles

- `admin`: full CMS and system access.
- `editor`: access to assigned Content and Design areas.

## Public Runtime

- `/` renders the published CMS page with slug `home`.
- `/:slug` renders published CMS pages.
- `/preview/cms/:id` renders authenticated draft previews.
