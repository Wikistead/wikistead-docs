---
title: セルフホスティング
---

Wikistead の Community Edition は AGPL のオープンソースで、セルフホストはデモ用途ではなく第一級の選択肢です。**セルフホスティングの正典はソースリポジトリ同梱の [`docs/self-hosting.md`](https://github.com/wikistead/wikistead/blob/master/docs/self-hosting.md)**（デプロイするコードと同じ版管理）です。このページは案内で、従うべきはリポジトリ側のガイドです。

## 最短の手順

```bash
git clone https://github.com/wikistead/wikistead
cd wikistead
docker compose up -d
```

compose ファイル 1 つでスタック全体が立ち上がります。本番デプロイ（Kubernetes・TLS・バックアップ・外部 IdP）はリポジトリのガイドに従ってください——単一ホストの評価環境と本番経路の両方をカバーしています。

## 動かしているもの

Wikistead は 3 つのアプリケーションプロセスと、その下のインフラサービス群です：

| コンポーネント | 役割 |
|---|---|
| `web` | シングルページアプリ（エディタとすべての画面） |
| `server` | API——テナント・スペースとページ・検索・共有リンク |
| `collab` | リアルタイム編集サーバ（WebSocket・CRDT） |
| Postgres | アプリケーション DB と認可ストア |
| OpenFGA | 認可——権限の唯一の真実 |
| Meilisearch | 全文検索 |
| Valkey | リアルタイム協調とレート制限 |
| S3 互換ストレージ | 添付ファイル（既定は SeaweedFS・S3/R2 に差し替え可能） |

始める前に知っておくべきデプロイの不変条件が 2 つあります（リポジトリのガイドはどちらも担保します）：

1. **単一オリジン。** web・`/api`・`/collab` はリバースプロキシ越しに同一オリジンで配信すること——API や collab のポートを直接公開しない。
2. **OpenFGA には永続データストアが必要。** インメモリエンジンで動かすと、再起動でシステム全体の権限が静かに消えます。

## Community Edition と Cloud の違い

セルフホストの CE では、すべての機能レバーが**無制限**に解決されます——解錠すべき人工的な上限はありません。[entitlement レバーのリファレンス](/ja/reference/generated/entitlement-levers/)はリリース済みコードから生成されており、各レバーが何を制御し Community 列が何に解決されるかを正確に示します。
