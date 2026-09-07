---
title: レシピ
documented-surfaces: none  # worked examples composing surfaces already ledgered elsewhere
---

いまある機能だけで組める連携を 3 つ紹介します。それぞれ、どの連携方法がどの役目を担うのかを書いています。この分担には理由があります。**出来事の通知は Webhook、データの取得は REST API、ページ本文の書き込みは [MCP](/ja/integrations/mcp/) が担当します。**

## Slack に公開を知らせる

通知は Webhook で受け取り、本文の取得は REST API で行います。

**1. キーを発行する。** [管理 → API キー](/ja/admin/api-keys/)で「ページの読み取り」だけを許可します。この連携では書き込みを行わないためです。

**2. Webhook を登録する。** [管理 → Webhook](/ja/admin/webhooks/)で受け取る URL を登録し、`page.published` を購読します。表示される署名用の秘密の文字列は控えておきます。

**3. 署名を確かめてから処理する。** 配信には `x-wikistead-timestamp` と `x-wikistead-signature` が付きます。署名は `sha256=` に続けて、`<タイムスタンプ>.<本文そのまま>` を秘密の文字列で HMAC-SHA256 した値です。署名の計算には**受け取った本文をそのまま**使うので、JSON として解析する前に検証してください。

```js
import { createHmac, timingSafeEqual } from 'node:crypto'

function verify(rawBody, headers, secret) {
  const ts = headers['x-wikistead-timestamp']
  const sent = headers['x-wikistead-signature'] ?? ''
  // 古い配信の使い回しは、本文に手をつける前に落とします。
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false
  const mine = 'sha256=' + createHmac('sha256', secret).update(`${ts}.${rawBody}`).digest('hex')
  const a = Buffer.from(mine), b = Buffer.from(sent)
  return a.length === b.length && timingSafeEqual(a, b)
}
```

**4. 更新後の本文を取得する。** イベントに含まれるのはページの ID だけで、本文は含まれません。これは意図的で、Webhook が中身を持ち出す抜け道にならないようにしています。1 で作ったキーでページを取得します。

```bash
curl -H "Authorization: Bearer wks_..." \
  https://team.example.com/api/pages/$PAGE_ID/published
```

あとは、タイトルとリンクを Slack に送信するだけです。署名を確かめたら、できるだけ早く `2xx` を返してください。それ以外は配信の失敗として扱われ、再送されます。

**届かないもの。** 下書きと非公開のページについては、イベントを送信しません。そのため「誰かが何かを公開した」を知らせる bot が、作りかけの内容を漏らすことはありません。通知が届かないときは、多くの場合は不具合ではなく、通知すべき出来事が起きていないだけです。

## 週次のまとめをアシスタントに下書きさせる

ページの**本文**は REST API ではなく MCP 接続から書きます。そのためこの連携は、特定のメンバー本人として、その人の権限の範囲で動きます。公開するかどうかを決めるのも人です。

一度アシスタントをつないだら（[MCP 接続](/ja/integrations/mcp/)）、まとめを頼むだけです。このとき、内部では次の処理が行われます。

1. `search` でその週に更新されたページを探し、`list_pages` でページの構成を確認します。どちらも見える範囲だけを返すので、まとめに載るのは、あなたがもともと閲覧できるページだけです。
2. `create_page` で「週次のまとめ 第 34 週」を作ります。作られるのは**下書き**で、あなたとそのスペースの編集者に見えます。
3. `edit_body` の `append` で節を 1 つずつ書いていきます。見出しを指定した `replace_section` もあるので、書き直しを頼んだときに同じ内容が二重に並ぶこともありません。
4. 公開するのは**あなた**です。下書きも通常のページと同じように開けるので、アシスタントが書いている途中でも直接編集できます。

この順番には意味があります。下書きまでを任せるのと、公開まで任せるのとでは、結果に対する責任の重さが変わるからです。`publish_page` を使えば公開まで任せることもできますが、それは意識して選ぶ運用であり、既定の動作ではありません。

## 外部の索引を最新に保つ

Webhook と REST API を組み合わせる例です。それぞれの守備範囲がはっきり分かります。

- **きっかけ**：`page.published`、`page.trashed`、`page.deleted` を購読します。外部から読めるページが増えたり減ったりするのは、この 3 つのタイミングだけです。
- **取得**：本文は `GET /api/pages/{pageId}/published`、添付ごと欲しいときは `GET /api/pages/{pageId}/export` です。最初の一括取り込みには `GET /api/spaces/{spaceId}/export` があるので、ページを 1 つずつ取得する必要はありません。
- **権限**：「ページの読み取り」を持つキーを 1 つ用意し、実際に索引するスペースに絞ります。キーの適用範囲は管理コンソールに表示されるので、しばらく経ってから確認するときも、記憶に頼らずに済みます。
- **やらないこと**：REST から本文は書き戻せません。本文を書き込むエンドポイントが無いためです。本文は単なるデータ項目ではなく、複数人が同時に編集している文書だからです。書き戻しは MCP の `edit_body` の役目で、人が編集するときと同じ経路を通ります。

リクエストの回数にはキーごと・ワークスペースごとの上限があります（[プラン別の機能一覧](/ja/reference/plan-contents/)）。大きなスペースを取り直すときは、一度に大量のリクエストを送らず、間隔を空けて取得してください。
