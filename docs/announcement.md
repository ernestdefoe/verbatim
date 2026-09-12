# Verbatim — a quote that says when it has gone stale (Built using AI)

A quote is a photograph. It keeps the words that were written, and it keeps them after the post they came from has been rewritten.

That is the right behaviour. A quote that silently followed its source would let anyone change what they had already been quoted saying, which is a worse problem than the one it solves.

But nobody is told. The reply underneath still reads as an answer to what is written up there **today** — and on a forum where threads decide things, that is how a discussion ends up arguing with a sentence that no longer exists.

Verbatim adds the missing half sentence.

![A quote marked as edited since it was quoted](https://raw.githubusercontent.com/ernestdefoe/verbatim/main/screenshots/verbatim-stale-quote.png)

The quoted words are untouched. The line under them says the post they came from has been edited since this reply was posted, and links to it as it stands now. Hovering gives the whole story: *"These are the words that were written. The post they came from was edited 3 minutes ago, after this reply was posted."*

## What it claims, exactly

Only what two timestamps prove: the source post's `editedAt` is after the quoting post's `createdAt`.

Never "this quote is wrong". Nothing records which words were copied when, and somebody who fixes a typo in their own reply afterwards has not re-copied the quote. A quote of a post that was edited *before* the reply carries no marker at all — the quoter saw that edit.

## How it works

Every quote made with the quote button already carries its source's id: `flarum/mentions` renders it as `<a class="PostMention" data-id="9">`. Verbatim reads that, looks the source up, and compares two dates. No new table, no settings, no migration — the PHP in this extension registers a stylesheet, a bundle and a locale, and nothing else.

Sources are fetched through core's own posts endpoint, batched once per render, so a quote of a post you are not allowed to see is left alone rather than an endpoint of mine quietly confirming that it exists.

It works with the Markdown composer and with a WYSIWYG editor: both end up with the same mention in the rendered quote, which is the only thing this reads.

## What it does not do

- **It does not show what changed.** Flarum core keeps no revision history — only that a post was edited, and when.
- **It does not touch the quote.** The words never move. That is the whole point.

## Install

```
composer require ernestdefoe/verbatim
```

Enable it; there is nothing to configure.

- **GitHub:** https://github.com/ernestdefoe/verbatim
- **Packagist:** https://packagist.org/packages/ernestdefoe/verbatim
- **Support:** https://ernestdefoe.online/d/93
- **Licence:** MIT

Bug reports and ideas welcome — particularly from anyone whose theme restyles blockquotes, since that is where the marker lives.
