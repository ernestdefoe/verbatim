import app from 'flarum/forum/app';

/**
 * The posts our quotes came from.
 *
 * A quote carries its source's id — `flarum/mentions` renders every
 * quote-button quote as `<a class="PostMention" data-id="9">` — but not the
 * source's `editedAt`, which is the one fact this extension needs. The source
 * is usually in the same discussion and therefore already in the store; when
 * it is not, it is fetched.
 *
 * 🚨 Through `/api/posts?filter[id]=`, not an endpoint of our own. Core's
 * filter applies the same visibility rules as everything else, so a quote of a
 * post this reader may not see returns nothing rather than leaking its
 * timestamps — and a private-tag post is not accidentally confirmed to exist
 * by an extension that forgot to ask.
 */
const CHUNK = 50;

/** Ids core did not return: deleted, or not visible to this reader. */
const absent = new Set();

/** Ids currently being fetched, so a redraw storm cannot re-request them. */
const loading = new Set();

let queued = new Set();
let scheduled = null;

export function sourceFor(id) {
  return app.store.getById('posts', String(id));
}

export function unavailable(id) {
  return absent.has(String(id));
}

/**
 * Ask for a source. Safe to call on every render: already-known, already-
 * absent and already-loading ids are dropped, and what is left is batched into
 * one request per animation frame rather than one per quote.
 */
export function request(id) {
  const key = String(id);

  if (sourceFor(key) || absent.has(key) || loading.has(key)) return;

  queued.add(key);

  if (scheduled) return;

  scheduled = setTimeout(flush, 0);
}

async function flush() {
  scheduled = null;

  const ids = [...queued].filter((id) => !sourceFor(id) && !absent.has(id) && !loading.has(id));

  queued = new Set();

  if (!ids.length) return;

  ids.forEach((id) => loading.add(id));

  for (let i = 0; i < ids.length; i += CHUNK) {
    const chunk = ids.slice(i, i + CHUNK);

    try {
      await app.store.find('posts', { filter: { id: chunk.join(',') } });
    } catch (e) {
      // A failed lookup must not mark these absent — that would be a permanent
      // "no marker" on a quote whose source is fine. Let the next render ask
      // again.
      console.error('[verbatim] could not load quoted posts:', e);
      chunk.forEach((id) => loading.delete(id));

      continue;
    }

    chunk.forEach((id) => {
      loading.delete(id);

      // Asked for, not returned: deleted, or not this reader's to see. Either
      // way there is nothing to say about it, and it must not be asked for
      // again on every redraw.
      if (!sourceFor(id)) absent.add(id);
    });
  }

  // The markers are drawn from a lifecycle hook, so something has to run the
  // render that calls it.
  m.redraw();
}
