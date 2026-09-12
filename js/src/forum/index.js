import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';

import { decorate } from './decorate';

/*
 * 🚨 Both extends name a module PATH rather than an imported component.
 * CommentPost is code-split, so an import compiles to a registry lookup that
 * runs at boot, before the chunk exists — and `extend(undefined.prototype, …)`
 * does not fail quietly, it takes the whole forum bundle down with it.
 */
app.initializers.add('ernestdefoe-verbatim', () => {
  ['oncreate', 'onupdate'].forEach((hook) => {
    extend('flarum/forum/components/CommentPost', hook, function (_, vnode) {
      /*
       * 🚨 Wrapped. This runs inside a lifecycle hook, and an exception thrown
       * here does not cost a marker — it stops Mithril, and the reader gets a
       * discussion with no posts in it.
       */
      try {
        decorate(vnode.dom, this.attrs.post);
      } catch (e) {
        console.error('[verbatim] leaving this post alone:', e);
      }
    });
  });
});
