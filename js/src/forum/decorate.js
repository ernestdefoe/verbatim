import app from 'flarum/forum/app';
import humanTime from 'flarum/common/utils/humanTime';
import extractText from 'flarum/common/utils/extractText';

import { sourceFor, unavailable, request } from './sources';
import { editedSinceQuoted } from './staleness';

const MARKER = 'Verbatim-marker';

/**
 * Mark the quotes in one rendered post.
 *
 * 🚨 This is DOM work, not a view. A post's body is `m.trust(contentHtml)` —
 * server-rendered HTML with no vnodes to extend — so the only way to put
 * anything inside a quote is to reach into the element after Mithril has
 * written it. Which means every pass must be idempotent: `onupdate` runs on
 * every redraw, and a pass that appended blindly would stack a marker per
 * redraw until the quote was a wall of them.
 */
export function decorate(element, post) {
  if (!element || !post) return;

  const body = element.querySelector('.Post-body') || element;

  // Each quote-button quote renders as a PostMention inside a blockquote. A
  // blockquote somebody typed by hand carries no source, and there is nothing
  // to say about it.
  body.querySelectorAll('a.PostMention[data-id]').forEach((mention) => {
    const quote = mention.closest('blockquote');

    if (!quote) return; // an inline post mention, not a quote

    const id = mention.getAttribute('data-id');

    if (!id) return;

    const source = sourceFor(id);

    if (!source) {
      // Unavailable is a real answer, and a quiet one: a quote of a post this
      // reader cannot see looks exactly as it does today.
      if (!unavailable(id)) request(id);

      clear(quote);

      return;
    }

    const edited = editedSinceQuoted(source, post);

    if (!edited) {
      clear(quote);

      return;
    }

    mark(quote, mention, edited);
  });
}

function mark(quote, mention, edited) {
  const when = humanTime(edited);

  const label = extractText(app.translator.trans('ernestdefoe-verbatim.forum.quote.stale'));
  const help = extractText(app.translator.trans('ernestdefoe-verbatim.forum.quote.stale_help', { time: when }));

  let marker = quote.querySelector(':scope > .' + MARKER);

  if (!marker) {
    marker = document.createElement('a');
    marker.className = MARKER;
    marker.appendChild(document.createElement('i')).className = 'icon fas fa-pen-to-square';
    marker.appendChild(document.createElement('span')).className = MARKER + '-label';
    quote.appendChild(marker);
  }

  // Rewritten rather than rebuilt, so a redraw does not flicker the marker or
  // lose a hover.
  const href = mention.getAttribute('href');

  if (href) marker.setAttribute('href', href);

  marker.setAttribute('title', help);
  marker.querySelector('.' + MARKER + '-label').textContent = label;
  quote.classList.add('Verbatim-stale');
}

function clear(quote) {
  const marker = quote.querySelector(':scope > .' + MARKER);

  if (marker) marker.remove();

  quote.classList.remove('Verbatim-stale');
}
