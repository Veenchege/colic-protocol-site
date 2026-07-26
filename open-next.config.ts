import { defineCloudflareConfig } from '@opennextjs/cloudflare'

/**
 * open-next.config.ts
 *
 * Required at the project root by @opennextjs/cloudflare from roughly the
 * 0.5 line onward. The build log that surfaced this whole issue was caused
 * by an old, pinned version (^0.3.0) that predates both this file's
 * requirement and the current `opennextjs-cloudflare build` CLI syntax.
 *
 * Left at defaults deliberately. The main lever most projects reach for
 * here eventually is a KV or R2-backed incremental cache override (see
 * https://opennext.js.org/cloudflare/caching for when that's worth adding),
 * not needed for a mostly-static marketing site plus a couple of API routes.
 */
export default defineCloudflareConfig()
