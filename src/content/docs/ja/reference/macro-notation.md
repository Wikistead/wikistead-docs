---
title: マクロ記法
---

組み込みマクロ全種の正典記法を 1 ページに。ここにあるものはすべて標準 Markdown の形をしています：データブロックは**言語タグ付きコードフェンス**、Markdown 本文のブロックは **`:::` ディレクティブ**——独自記法はありません。

詳しいガイド：[コールアウト](/ja/editor/callouts/) · [テーブル](/ja/editor/tables/) · [図](/ja/editor/diagrams/) · [ドローイング](/ja/editor/drawings/) · [レイアウト](/ja/editor/layout-macros/) · [埋め込み](/ja/editor/embeds/) · [タグ](/ja/editor/tags/) · [ページリスト](/ja/editor/page-lists/) · [タスク](/ja/editor/tasks/)

## コールアウト

```md
:::note
本文の Markdown。
:::
```

型：`note`・`info`・`tip`・`warning`・`danger`。任意のラベル：`:::warning[移行の前に]`。

## 折りたたみとレイアウト

- 折りたたみ：`:::details[要約]` … `:::`
- カラム：`:::columns` の中に `:::column` 項目 … `:::`
- タブ：`:::tabs` の中に `:::tab[ラベル]` 項目 … `:::`

## 進捗リング付きタスクリスト

```md
:::todo[やること]
- [ ] タスク
- [x] 完了
:::
```

素の GFM `- [ ]` タスクリストはラッパー無しでも動きます。

## 図（コードフェンス）

- Mermaid：` ```mermaid ` … 図のテキスト … 閉じフェンス。
- PlantUML：` ```plantuml ` … `@startuml` … `@enduml` … 閉じフェンス（デプロイにレンダーサービスが無ければソース表示）。
- Excalidraw：` ```excalidraw `（エディタ内で描く。本文はシーン JSON）。

## 動的リスト（読み取り専用）

- タグを持つページ：`:::tagged` … `<タグ名>` … `:::`
- このページの子ページ：`:::children` … `:::`（本文は空）

## 埋め込みとトランスクルージョン

- 別ページの内容を埋め込む：`:::embed-page` … `<pageId>` … `:::`
- 許可リスト済み外部 URL を埋め込む：`:::embed-external` … `<url>` … `:::`

## テーブル（リッチ）

標準の GFM パイプテーブルはどこでも使えます。セル結合と配置には：`:::table` … HTML の `<table>` … `:::`。

## コードフェンス

info 文字列は業界慣習に従い、未知の属性もそのまま round-trip します：

````md
```ts title="app.ts" showLineNumbers {1,3-5}
const x = 1
```
````

## AI アシスタント向け

このリファレンスの機械可読版は、ワークスペースの [MCP コネクタ](https://modelcontextprotocol.io/)（`get_syntax_reference`）で提供されます。エディタが動かしているのと同じレジストリから生成されるため、ワークスペースに書き込む AI アシスタントは、このページと同じ記法契約を読みます。
