---
title: Webhook
documented-surfaces: [admin-surface:webhooks, doc-code-map:webhook-delivery-and-signing]
screens:
  admin-surface:webhooks: ["disabled", "create:none:the page describes registering an endpoint not the Add button by name", "delete:none:the page does not describe removing a webhook"]
---

**管理 → Webhook**では、ワークスペースで起きたことを外部のシステムに通知できます。受け取る URL を登録してイベントを選ぶと、選んだイベントが起きるたびに Wikistead が署名付きの HTTP リクエストを送ります。Wikistead から他のツールへ通知するためのしくみです。

## イベント

購読できるのは、ページの公開やメンバーの参加といった、ワークスペース内の出来事です。すべての一覧は[Webhook のイベント](/ja/reference/webhook-events/)にあります。新しい機能を追加するときは対応するイベントも同時に追加します。

## 送られないもの

Webhook でも、ページの公開範囲の扱いは通常と同じです。**下書きと非公開のコンテンツについては、イベントを送信しません。** 公開範囲の規則はそのまま適用されるので、Webhook を使って、本来見えない内容を取り出すことはできません。

## 運用

登録したそれぞれの Webhook には、配信の状況が表示されます。**無効**にすると配信は止まりますが、設定は残ります。Webhook の作成数がプランで制限されている場合、新しく作ることはできなくなりますが、すでにある Webhook は配信を続けます（[プラン別の機能一覧](/ja/reference/plan-contents/)を参照してください）。
