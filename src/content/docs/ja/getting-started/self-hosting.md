---
title: セルフホスト
documented-surfaces: none  # orients to the canonical self-hosting guide in the source repo, not a product surface
---

Wikistead の Community Edition は AGPL のオープンソースで、自分のサーバーで動かせます。**手順の元になる文書は、ソースリポジトリに入っている [`docs/self-hosting.md`](https://github.com/wikistead/wikistead/blob/main/docs/self-hosting.md)** です（デプロイするコードと一緒にバージョン管理されています）。このページは概要です。実際に作業するときはリポジトリ側のガイドに従ってください。

## 最短の手順

```bash
git clone https://github.com/wikistead/wikistead
cd wikistead
cp .env.example .env      # 必須の秘密鍵が 3 つあります。リポジトリのガイドに手順があります
pnpm install && pnpm dev:up
docker compose --profile apps up -d --build
```

ブラウザで **https://dev.localhost** を開きます。

`docker compose up -d` だけではインフラのサービスしか立ち上がりません。製品そのもの（web・server・collab と、それらを 1 つのオリジンにまとめるリバースプロキシ）を足すのが `apps` プロファイルです。ブラウザからはすべてこのプロキシ経由で届きます。

証明書は `.localhost` 向けに Caddy が自前で発行するため、`caddy trust` を実行するまでブラウザが警告を出します。実在するホスト名を使う場合（`SITE_HOST=app.example.com`）は、ACME で正規の証明書が発行されます。

本番環境向けの構成（Kubernetes、TLS、バックアップ、外部の ID プロバイダー）はリポジトリのガイドを参照してください。ガイドには、1 台のホストで試す場合と、本番で運用する場合の両方が書かれています。

## 構成しているサービス

Wikistead は 3 つのアプリケーションと、それを支えるインフラのサービスで構成されています。

| コンポーネント | 役割 |
|---|---|
| `web` | シングルページアプリ（エディタとすべての画面） |
| `server` | API。ワークスペース、スペース、ページ、検索、共有リンクを扱います |
| `collab` | リアルタイム編集のサーバー（WebSocket と CRDT） |
| Postgres | アプリケーションのデータベースと認可のデータ |
| OpenFGA | 認可。権限の判断はすべてここが行います |
| Meilisearch | 全文検索 |
| Valkey | リアルタイム編集の同期とレート制限 |
| S3 互換ストレージ | 添付ファイル（既定は SeaweedFS。S3 や R2 に差し替えられます） |

始める前に知っておきたい構成上の決まりが 2 つあります（リポジトリのガイドはどちらも満たしています）。

1. **同一オリジンで配信すること。** web、`/api`、`/collab` は、リバースプロキシを通して同じオリジンから配信してください。API や collab のポートを直接公開しないでください。
2. **OpenFGA には永続的なデータストアが必要です。** インメモリのまま動かすと、再起動したときにシステム全体の権限が消えます。

## Community Edition と Cloud の違い

セルフホストの Community Edition に資源の上限はありません。席数、容量、スペース数、履歴はすべて無制限です。Cloud の一部の機能（SAML のシングルサインオン、SCIM、監査ログ、Access Transparency、analytics）は、Community Edition のビルドには含まれていません（OIDC のシングルサインオンは含まれます。Cloud 限定なのは SAML 方式だけです）。[プラン別の機能一覧](/ja/reference/plan-contents/)に、機能ごとの Community Edition での扱いがあります。
