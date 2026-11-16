import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import type CommentPost from 'flarum/forum/components/CommentPost';

import { decorate } from './decorate';

export { default as extend } from './extend';

/*
 * 🚨 Both extends name a module PATH rather than an imported component.
 * CommentPost is code-split, so an import compiles to a registry lookup that
 * runs at boot, before the chunk exists — and `extend(undefined.prototype, …)`
 * does not fail quietly, it takes the whole forum bundle down with it. The
 * `import type` above is erased at compile time, so it only names the type.
 */
app.initializers.add('ernestdefoe-verbatim', () => {
  extend<CommentPost, 'oncreate' | 'onupdate'>('flarum/forum/components/CommentPost', ['oncreate', 'onupdate'], function (_, vnode) {
    /*
     * 🚨 Wrapped. This runs inside a lifecycle hook, and an exception thrown
     * here does not cost a marker — it stops Mithril, and the reader gets a
     * discussion with no posts in it.
     */
    try {
      decorate(vnode.dom, this.attrs.post);
    } catch {
      // Silent on purpose: a post we cannot decorate is simply left as core
      // rendered it, with no marker. Nothing here is worth stopping the page.
    }
  });
});
