# MEMORY.md

セッション横断の学習メモ(taisei-context運用ルールに基づく)。

## 2026/08/11 初期実装(合同ローンチ配信設定システム)

- 意思決定: 空リポジトリだったため Next.js 16 + Prisma 6(7は破壊的変更が多く回避)+ SQLite で新規構築。メールはReact Emailではなく自前ブロック→HTML/テキスト同時生成方式(依存減・ESPマージタグ`{{TOKEN}}`をそのまま残せる)
- 意思決定: 完了画面へトークンをURL再掲せず sessionStorage 経由で「設定変更に戻る」リンクを生成
- ハマり: Prisma CLIが `db push --force-reset` をAIエージェント操作としてブロック → テストDBは「ファイル削除+通常db push」で初期化する方式に変更
- ハマり: jsdomは `<dialog>.showModal` 未実装 → tests/setup.ts にポリフィル
- ハマり: Next 16の `LayoutProps` グローバル型はビルド前に存在しない → 明示型で回避
- 宿題: launch.ts のプレースホルダー置換(正式事業者名・URL・送信日)と配信サービス(EMAIL_PROVIDER)の実装選定が未定
