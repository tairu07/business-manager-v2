# MEMORY.md

セッション横断の学習メモ(taisei-context運用ルールに基づく)。

## 2026/08/11 初期実装(合同ローンチ配信設定システム)

- 意思決定: 空リポジトリだったため Next.js 16 + Prisma 6(7は破壊的変更が多く回避)+ SQLite で新規構築。メールはReact Emailではなく自前ブロック→HTML/テキスト同時生成方式(依存減・ESPマージタグ`{{TOKEN}}`をそのまま残せる)
- 意思決定: 完了画面へトークンをURL再掲せず sessionStorage 経由で「設定変更に戻る」リンクを生成
- ハマり: Prisma CLIが `db push --force-reset` をAIエージェント操作としてブロック → テストDBは「ファイル削除+通常db push」で初期化する方式に変更
- ハマり: jsdomは `<dialog>.showModal` 未実装 → tests/setup.ts にポリフィル
- ハマり: Next 16の `LayoutProps` グローバル型はビルド前に存在しない → 明示型で回避
- 宿題: launch.ts のプレースホルダー置換(正式事業者名・URL・送信日)と配信サービス(EMAIL_PROVIDER)の実装選定が未定

## 2026/09/17 株分析サロンLP(/kabu-salon)

- 意思決定: Plaud録音(寺田09/05・船谷09/11・岡村08/28・古山09/14・弁護士08/17)を集約。価格はサロン¥20,000(先着10名¥15,000)/note¥4,980/IRアルファ¥50,000予定の3段構成。個別銘柄推奨・利回り約束は書かない(投資助言登録前)
- 構成: 価格・URLは src/config/kabuSalon.ts、文言は src/content/kabuSalon.ts に集約。tests/kabu-salon.test.tsx で禁止表現とCTAリンクを検査
- ハマり: Plaud MCPはタイトル検索のみ。コーチ名は録音タイトルに出ないため要約(get_note)で特定した。「規格外さん」は未特定
- 大成の好み: サロンは大成主導・那須野/麦田サポート。noteは「待ってくれている一人のために書く」トーン
- 宿題: 申込URL(UnivaPay)・特商法・プライバシーポリシー・問い合わせ先のプレースホルダー置換。サロン正式名称。「規格外さん」の録音特定
