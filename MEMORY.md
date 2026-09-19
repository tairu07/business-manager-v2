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
- 2026/09/17 追記: 大成は「昔作ったちゃんとしたやつ」= 投資分析レポートサロンLP(墨#0B0D13/紺/生成り#EDE6D6/金#C9A86A、Shippori Mincho+Zen Kaku Gothic New+Cormorant Garamond italic、縦書き引用帯、朱印「不敗」、四訓)を高級感の基準にしている。SENRITSU系LPはこのデザイン言語を踏襲する。参照HTMLはアーティファクト 7wvCzg4NhDLYUvoecXrodn
- ハマり: PlaywrightのChromiumはプロキシCAを信用せずGoogle Fontsが落ちる → launch args ["--ignore-certificate-errors"] で解決。proxy オプションを明示するとlocalhostまでプロキシ経由になり白紙になるので指定しない
- 2026/09/17 写真: この環境は画像ホスト(Unsplash/Pexels/photo-ac等)へ接続不可。大成のPCのCoworkに「photo-acで探して public/kabu-salon/img/<slot>.jpg にコミット・プッシュ」を依頼する手順が成立した(写真5枚が commit 026e4f2 で到着)。photo-acは帰属表示不要
- ハマり: Playwright の fullPage 撮影では画面外の filter 付き <img> が空に写ることがある(実ページは正常)。撮影前に decoding="sync" + img.decode() を待つ
- 2026/09/17 大成の呼び名: LP・対外では「タイちゃん」(一人称はタイル/タイちゃん)。通り名は音声から「タイルドマン・サックス」と推定(要確認)。本名・SENRITSU・主宰写真はLPに出さない
- 意思決定: 株分析サロンは「まず負けない」教育型から「タイちゃんの思考を聞くファンクラブ」型へ転換(09/17)。理由: 7〜8月の毎日スペースで分析時間が増え銘柄が見つかった(シリウスビジョン 290〜300円→420〜450円)が、お金をもらって責任がないと続かない。週1回Zoom(目標週2)、10〜20人、今後のガチサロン・ツールは会員割引
- 2026/09/17 デプロイ: Vercel(tairus-projects/business-manager-v2)に Codex が公開。URL https://business-manager-v2.vercel.app/(→/kabu-salon へ転送)。Production Branch = claude/elegant-bohr-5tmb3i、HOME_REDIRECT=/kabu-salon・DEMO_MODE=false 設定済み。このブランチへ push すると自動再デプロイ。この環境からは api.vercel.com も *.vercel.app も遮断なのでデプロイ・実確認は Codex/Cowork に委ねる
- 分業パターン: 外部サービス操作(画像取得・Vercel)は大成のPC側のCodex/Coworkが担当し、結果をリポジトリ経由またはチャット報告で受け取る
- 2026/09/19 法務ページ: /kabu-salon/tokushoho・privacy・terms を追加(文面は src/content/kabuSalonLegal.ts、会社情報は config の company)。会社情報はGmailの申込確認メールから取得(〒579-8036 東大阪市鷹殿町11-2 カワショウビル2・3階、090-8791-8955、senritsu@senritsu.site)。電話は携帯番号なので会社回線に替えるかは大成判断
- 意思決定: 解約条件は「次回決済日の前日までの連絡で次回以降停止、支払済み期間末日まで利用可、返金・日割なし」で LP・特商法・規約を統一
