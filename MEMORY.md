# MEMORY.md

セッション横断の学習メモ(taisei-context運用ルールに基づく)。

## 2026/08/11 初期実装(合同ローンチ配信設定システム)

- 意思決定: 空リポジトリだったため Next.js 16 + Prisma 6(7は破壊的変更が多く回避)+ SQLite で新規構築。メールはReact Emailではなく自前ブロック→HTML/テキスト同時生成方式(依存減・ESPマージタグ`{{TOKEN}}`をそのまま残せる)
- 意思決定: 完了画面へトークンをURL再掲せず sessionStorage 経由で「設定変更に戻る」リンクを生成
- ハマり: Prisma CLIが `db push --force-reset` をAIエージェント操作としてブロック → テストDBは「ファイル削除+通常db push」で初期化する方式に変更
- ハマり: jsdomは `<dialog>.showModal` 未実装 → tests/setup.ts にポリフィル
- ハマり: Next 16の `LayoutProps` グローバル型はビルド前に存在しない → 明示型で回避
- 宿題: launch.ts のプレースホルダー置換(正式事業者名・URL・送信日)と配信サービス(EMAIL_PROVIDER)の実装選定が未定

## 2026/10/10 TradingView 陽線/陰線 出来高差インジケーター

- 意思決定: `tradingview/updown-volume-range.pine`(Pine v6)として本リポジトリ直下に独立配置。Next.jsアプリとは無関係。期間指定は `input.time(confirm=true)` の縦線ドラッグ方式
- 意思決定: 縦線が乗っている足を含める判定(`time_close > 開始 and time <= 終了`)。十字線は初期設定で差引から除外し別集計
- ハマり: TradingView本体のコンパイラはこの環境で使えない → PineTS(npm `pinets`、Pine v6をNodeで実行)で実スクリプトを走らせ、Python独立計算と12ケース突合で検証
- 大成の好み: 音声入力の依頼(「大内」=大口、「印銭/陽銭」=陰線/陽線)。用語は文脈で読み替える
- 宿題: TradingView実機での貼り付け・縦線ドラッグ動作は未確認。精度改善案は下位足(5分足)で陽陰判定するモード
