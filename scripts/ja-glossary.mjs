// #718: the Japanese docs' terminology contract, in one file.
//
// Two rules produced the entries below, and both come from rulings rather than taste:
//   1. #671 (one feature, one name): a term the PRODUCT shows in Japanese must appear in the docs
//      with the product's own wording. A reader who signs up after reading must not meet a second
//      vocabulary — so `backlinks` goes by the label `ja.json` puts on screen (its entry below).
//   2. #585 (the em-dash ruling, re-applied to this surface): English words left untranslated read
//      as machine output. Where a plain Japanese phrase exists, it wins; where the term IS the
//      product's identifier (a directive name, a fence tag), it stays in English on purpose.
//
// `banned` entries are checked by scripts/check-ja-prose.mjs against `src/content/docs/ja/**`
// OUTSIDE code fences — a `:::tagged` directive in a code block is the notation, not prose.
export const JA_TERMS = [
  // ── product UI wording (rule 1) — the right column is what the app itself displays
  { banned: 'バックリンク', use: 'リンク元', why: 'ja.json related.backlinks' },
  { banned: '版履歴', use: '版の履歴', why: 'the app labels the tab 履歴' },
  { banned: '木構造', use: 'ツリー', why: 'ja.json has no 木構造; the sidebar says ツリー' },
  { banned: '第 2 要素', use: '2 要素認証', why: '#671 settled one name for this feature' },
  { banned: 'トランスクルージョン', use: 'ページ埋め込み', why: 'ja.json macro.name.pageEmbed' },
  { banned: 'テナント', use: 'ワークスペース', why: 'tenant is an internal word; the UI says ワークスペース' },

  // ── English left in Japanese prose (rule 2)
  { banned: 'degrade', use: '素の形に戻る / リンクになる', why: 'untranslated verb' },
  { banned: 'entitlement', use: 'プラン（の機能）', why: 'internal noun; readers see plans' },
  { banned: 'capability URL', use: '推測できない URL', why: 'jargon with a plain equivalent' },
  { banned: 'break-glass', use: '緊急アクセス', why: 'untranslated idiom' },
  { banned: 'firehose', use: 'すべてを追う', why: 'untranslated metaphor' },
  { banned: 'emit', use: '出す / 送る', why: 'untranslated verb' },
  { banned: 'アップセル', use: '有料機能', why: 'sales jargon' },
  { banned: 'プリミティブ', use: '基本的な道具', why: 'untranslated noun' },

  // ── calques: English metaphors carried over word-for-word (P2)
  { banned: '扉', use: '入り口', why: 'calque of "door"' },
  { banned: '名簿にされる', use: '一覧になる', why: 'calque of "roster"' },
  { banned: '鋳造', use: '発行', why: 'calque of "mint"' },
  { banned: 'シートベルト', use: '（比喩を使わず説明する）', why: 'calque' },
  { banned: '鼓動', use: '（比喩を使わず説明する）', why: 'calque of "heartbeat"' },
  { banned: '儀式', use: '習慣 / 使い方', why: 'calque of "ritual"' },
  { banned: '側道', use: '抜け道', why: 'calque of "side channel"' },
  { banned: '焼き込まれた', use: '公開した時点の内容', why: 'calque of "baked in"' },
  { banned: '刈り取る', use: '消す', why: 'calque of "trim"' },
  { banned: '統べる', use: '決める / 扱う', why: 'calque of "govern"' },
  { banned: '形づくる', use: '決める', why: 'calque of "shape"' },
  { banned: '積んでいます', use: '備えています', why: 'calque of "ships with"' },

  // ── P9: never-constructions carried from English
  { banned: '決して', use: '（「〜ません」で足りる）', why: 'mechanical reflection of "never"' },

  // ── P12 (#718, the second read-through): the same thing called by two names. None of these were
  //    banned words, so the first sweep passed them — but to a reader it is the same wobble.
  { banned: '入口', use: '入り口', why: 'same word, two spellings across pages' },
  { banned: '本人確認', use: 'サインイン / 認証', why: 'authenticate; 本人確認 is identity verification (KYC) in Japanese' },
  { banned: '挙動', use: '扱い / 動き', why: 'developer word in a guide written for admins' },

  // Words that disagreed with the product UI's actual labels (rule-1 additions, checked against
  // ja.json). Exactly the state #671 forbids: a reader signs up and meets a different name.
  { banned: '最近の更新', use: '最近の変更', why: 'ja.json recentChanges.title' },
  { banned: 'キャレット', use: 'カーソル', why: 'ja.json account.avatarHint says カーソル' },
  { banned: '言及', use: 'メンション', why: 'ja.json calls the feature メンション' },
  { banned: 'レンダリング', use: '描画', why: 'the rest of the site says 描画' },
  { banned: 'Community 版', use: 'Community Edition', why: 'one name for the edition' },
  // The Vim compound is allowed (the regex carves it out); only the bare word, aimed at a
  // reader-facing screen, is stopped.
  { re: /モーダル(?!編集)/, banned: 'モーダル', use: '（画面に重なる編集ウィンドウ、と説明する）', why: 'developer word for a reader-facing screen' },

  // ── P19 / N3: evaluative adjectives and meta-sentences. In English they close a paragraph; in
  //    Japanese they read as the writer's own impression.
  { banned: '本物の', use: '（何が本物なのかを具体的に書く）', why: 'calque of "a real X"' },
  { banned: '正直な', use: '（何がどう正直なのかを具体的に書く）', why: 'calque of "honest"' },
]

// The dash family (#585 applied to docs). Kept separate from JA_TERMS because the fix is
// structural (split the sentence) rather than a word swap, and because the check reports it that way.
export const BANNED_PUNCTUATION = [
  { re: /—/g, name: 'em dash', fix: '読点・句点・括弧で書き直す（別の記号への置換は同じ族）' },
  { re: /–/g, name: 'en dash', fix: '同上' },
]
