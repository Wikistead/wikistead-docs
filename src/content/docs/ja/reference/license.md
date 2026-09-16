---
title: ライセンスとエディション
documented-surfaces: none  # licensing and editions summary, not a product surface
---

## 要点

**Community Edition は [wikistead/wikistead](https://github.com/wikistead/wikistead) で公開されているソースで、ライセンスは AGPL-3.0 です。** 実行も、改変も、自分の組織のためのホスティングもできます。Enterprise の機能はプロプライエタリで、そのソースには入っていません。

同梱している依存はすべて permissive なライセンス（MIT・Apache-2.0・BSD・ISC）です。AGPL の義務は**このコード**についてのもので、依存パッケージには及びません。

## Community Edition でできること

製品のほぼ全体です。同時編集、スペースとページ、公開、共有リンク、検索、他ツールからの取り込み、API と AI 連携、管理コンソール。組織の IdP によるシングルサインオン（OIDC）も含まれ、ワークスペースごとに設定できます。

## Cloud 限定の機能

次の 5 つは Cloud のプランでのみ使えます。最新の一覧は[プラン別の機能一覧](/ja/reference/plan-contents/)にあります。

| 機能 | 内容 |
|---|---|
| **SCIM プロビジョニング** | メンバーの作成・更新・停止をディレクトリ側から行う |
| **SAML シングルサインオン** | ID プロバイダが OIDC ではなく SAML の場合 |
| **監査ログ** | 管理操作とセキュリティに関わる操作の、改ざんが分かる連鎖した記録 |
| **アクセスの開示** | 運用者による緊急アクセスをワークスペースに開示する |
| **アナリティクス** | 閲覧者ごとのページ統計（ゲストは個別に出さず合算） |

Community Edition では、これらの画面は**そもそも出ません**。

## Cloud

Wikistead Cloud は同じ製品で、上の機能はプランに応じて使えます。

## AGPL が求めること

Wikistead を改変してネットワーク越しに他人へ提供する場合、改変後のソースをその人たちに提供することを求められます。改変せずに自組織で動かすだけであれば、表示を残すこと以外に求められることはありません。全文は [LICENSE](https://github.com/wikistead/wikistead/blob/main/LICENSE) にあり、拘束力を持つのはそちらの本文です。この節は要約です。
