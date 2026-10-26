# AnnLeTravel AI Marketing Agent — MVP plan

## Goals
Build an approval-first marketing workspace alongside the existing AnnLeTravel static HTML/CSS/JavaScript site and Supabase backend. The MVP creates drafts and rendered video assets; it never publishes without an explicit approval action.

## Repository findings (2026-10-27)
- Default branch: `main`; site is a static HTML/CSS/vanilla JavaScript application.
- Existing Supabase client is initialized in `js/supabase.js`; Admin pages use Supabase Auth and check `admin_users`.
- Existing blog management is in `admin/blog.html` and `admin/blog-admin.js`.
- Existing blog table is `public.blog_posts` in `supabase/blog.sql`; do not replace it.
- Existing domain areas include tours, destinations, hotels, tickets, vessels and campaigns.
- New work is isolated on `feature/ai-marketing-mvp`; do not modify production files until the new module is reviewed.

## Proposed architecture
1. **Admin UI:** add a standalone `admin/marketing.html` and `admin/marketing.js` using the current CSS conventions and existing Supabase Auth/admin_users pattern. Add a link to the Admin navigation only after the module is tested.
2. **Cloud control plane:** Supabase Postgres stores briefs, generated content, approval state and job queue. Supabase Storage stores rendered media. Supabase Edge Functions keep provider API keys server-side and validate every privileged operation.
3. **Windows worker:** Python 3.11+ service/polling worker, Ollama API for local text generation when available, and FFmpeg for deterministic video assembly. The worker must authenticate to a narrow server endpoint; never put the Supabase service-role key or AI provider keys in browser code or an untrusted config.
4. **Provider abstraction:** local Ollama first for inexpensive drafts; optional server-side AI API provider can be added via environment variables. Video MVP assembles licensed/approved existing tour media, subtitles, narration and branding with FFmpeg; AI-generated video is a later integration.
5. **Publishing adapters:** separate platform adapters, only after the user explicitly approves a content item. Platform API permissions and account eligibility must be verified individually.

## MVP scope
- Create a brief for a tour/campaign.
- Generate content variants for social posts and blog drafts; keep source facts and output editable.
- Create a video script/storyboard, then render a short vertical MP4 from approved assets.
- Save content and asset metadata; show status queue: Draft → Pending approval → Approved → Scheduled/Published (publishing integration is a later phase).
- Admin can edit, approve or reject. No automatic publish from generation or rendering.
- Reuse existing blog workflow by offering an explicit "copy to blog draft" / reviewed integration later; do not write to `blog_posts` automatically in the first migration.

## Data model
- `marketing_content`: draft text, platform variants, asset references, lifecycle and approval metadata.
- `marketing_jobs`: queued generation/rendering tasks with retry metadata.
- RLS allows authenticated users present in `admin_users`; no public policies. Privileged worker operations must go through server-side functions.
- Migration file: `supabase/ai_marketing_mvp.sql`. Review and run it manually in Supabase SQL Editor; repository changes do not automatically change the live database.

## Delivery sequence
1. Add this plan and additive SQL schema; no existing files changed.
2. Build a standalone Admin Marketing Studio page with login/session checks, queue list, brief form and manual approval controls.
3. Add secure Supabase Edge Functions for enqueueing jobs and worker claim/result endpoints; keep secrets in Supabase secrets.
4. Build the Windows worker and local video renderer; store finished media in Supabase Storage.
5. Test on a feature branch with draft-only test records, responsive layout, RLS and failure/retry paths.
6. Add social publishing adapters only after per-platform API setup; preserve the mandatory approval gate.
7. Merge to `main` only after review and explicit deployment confirmation.

## Acceptance criteria
- Existing public pages and current Admin features are unchanged.
- Non-admin users cannot read or mutate marketing data.
- Content generation and rendering never change an item to published.
- A user must explicitly approve before a publishing job can be created.
- AI/API keys and service-role credentials never appear in client-side JS.
- Every job has a visible status and safe retry/error details.
