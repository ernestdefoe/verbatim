/**
 * Has the source moved under this quote?
 *
 * 🚨 The comparison is against when the quoting post was POSTED, not when it
 * was last edited. That makes the claim one we can actually stand behind —
 * "the source was edited after this reply was posted" is a fact about two
 * timestamps. "The quote is wrong" would be a guess: nothing records which
 * words were copied when, and a quoter who fixes a typo in their own reply
 * afterwards has not re-copied the quote.
 *
 * So the marker reports the fact, and the wording says exactly that.
 */
export function editedSinceQuoted(source, quoting) {
  const edited = source?.editedAt?.();
  const posted = quoting?.createdAt?.();

  if (!edited || !posted) return null;

  return edited.getTime() > posted.getTime() ? edited : null;
}
