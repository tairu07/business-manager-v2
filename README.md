# iPhone転売 × アービトラージエキスパートコース 合同プロダクトローンチ

前田さん保有の既存メールリストに対して、今後受け取りたい情報(iPhone転売/アービトラージ)を
選択してもらうための配信設定LP・3日間プレローンチコンテンツ・メールテンプレート一式。

- メールアドレスの再入力は求めない(受信者別トークンでLPを開く)
- 配信設定の確定は必ずLP上のボタンからのPOSTのみ(GETでは何も変更しない)
- 配信停止は確認画面を経てのみ実行
- 配信設定段階でトリック運営へメールアドレスを渡さない構造

## 技術スタック

Next.js (App Router) / TypeScript / Tailwind CSS / React Hook Form / Zod /
Prisma (開発: SQLite、本番: PostgreSQL切替可) / Vitest / ESLint / Prettier

## 起動方法

```bash
npm install
cp .env.example .env        # PREFERENCE_TOKEN_SECRET等を設定
npx prisma migrate dev      # DBマイグレーション
npm run db:seed             # デモデータ投入
npm run dev                 # http://localhost:3000
```

確認コマンド:

```bash
npm run typecheck   # 型チェック
npm run lint        # ESLint
npm test            # Vitest(43テスト)
npm run build       # production build
```

## 環境変数(.env.example参照)

| 変数                      | 説明                                                            |
| ------------------------- | --------------------------------------------------------------- |
| `DATABASE_URL`            | 開発: `file:./dev.db` / 本番: PostgreSQL接続文字列              |
| `PREFERENCE_TOKEN_SECRET` | トークンハッシュ用シークレット(32文字以上推奨・漏洩厳禁)        |
| `APP_BASE_URL`            | メール内リンク生成用ベースURL                                   |
| `CAMPAIGN_ID`             | キャンペーンID                                                  |
| `EMAIL_PROVIDER`          | `mock` または実装済みプロバイダ名                               |
| `EMAIL_PROVIDER_API_KEY`  | 配信サービスAPIキー(サーバーのみ・クライアント非公開)           |
| `SUPPORT_EMAIL`           | サポート窓口                                                    |
| `NEXT_PUBLIC_GTM_ID`      | GTM ID(未設定なら分析タグを読み込まない)                        |
| `DEMO_MODE`               | `false`以外でデモモード(メールプレビュー有効・配信連携Mock固定) |

## DBマイグレーション

- 開発: `npx prisma migrate dev`
- 本番: `npx prisma migrate deploy`

**本番ではSQLiteではなく永続DB(PostgreSQL)を使用すること。**
切替手順:

1. `prisma/schema.prisma` の `provider = "sqlite"` を `"postgresql"` に変更
2. `DATABASE_URL` にPostgreSQL接続文字列を設定
3. マイグレーションを作り直して `npx prisma migrate deploy`

(フィールド型は両DB互換のもののみ使用。categoriesはJSON文字列のString型)

## デモ用URL(`npm run db:seed` 実行後)

トップページ `http://localhost:3000/` にも同じリンク一覧が表示される。

| 確認内容               | URL                                                                            |
| ---------------------- | ------------------------------------------------------------------------------ |
| 未選択ユーザー         | `/preferences?token=demo-token-fresh-user-000000000000000000`                  |
| iPhone事前選択         | `/preferences?token=demo-token-fresh-user-000000000000000000&preset=iphone`    |
| アービトラージ事前選択 | `/preferences?token=demo-token-fresh-user-000000000000000000&preset=arbitrage` |
| 両方事前選択           | `/preferences?token=demo-token-fresh-user-000000000000000000&preset=both`      |
| 選択済み(両方)ユーザー | `/preferences?token=demo-token-both-user-0000000000000000000`                  |
| 配信停止済みユーザー   | `/preferences?token=demo-token-opted-out-user-00000000000000`                  |
| 期限切れトークン       | `/preferences?token=demo-token-expired-user-0000000000000000`                  |
| 無効トークン           | `/preferences?token=demo-token-invalid-not-in-database-00000`                  |
| Day 1〜3コンテンツ     | `/launch/day-1?topic=both`(day-2, day-3、topic=iphone/arbitrage/both)          |
| メールプレビュー       | `/dev/emails`(デモモード時のみ)                                                |

## 正式情報を入力すべき設定ファイル

**`src/config/launch.ts`** に全設定を集約している。
【 】付きプレースホルダーをすべて正式情報へ置換してから公開すること。

外部販売LP URLの変更もこのファイル(`urls.iphoneSalesLp` / `urls.arbitrageSalesLp`)で行う。
コンテンツページの公開・非公開は `contentPages.day1Published` 等で切り替える。

## メール配信システムとの接続箇所

配信サービスは未定のため、抽象インターフェースで実装している。

- 接続箇所: `src/lib/integrations/emailPreferenceProvider.ts`
- `EmailPreferenceProvider` インターフェース(`addTag` / `removeTag` /
  `unsubscribeFromMarketing` / `updatePreferences`)を実装したクラスを追加し、
  `createEmailPreferenceProvider()` の分岐に `EMAIL_PROVIDER` の値を追加する
- 必要な環境変数: `EMAIL_PROVIDER`, `EMAIL_PROVIDER_API_KEY`
- デモモード中は常に `MockEmailPreferenceProvider`(外部送信なし)
- 使用タグ: `interest_iphone` / `interest_arbitrage` / `launch_2026_consent` / `marketing_opted_out`
- 送信時ヘッダー: `listUnsubscribeHeaders()`(`src/emails/urls.ts`)が
  List-Unsubscribe / RFC 8058 ワンクリック解除ヘッダーを生成する。
  ワンクリック解除の受け口は `POST /api/preferences/one-click-unsubscribe`

## トークン発行方法

```bash
npm run issue-token -- user@example.com          # 30日有効
npm run issue-token -- user@example.com --days 14
```

- 32バイトのランダムトークンを発行し、DBにはHMAC-SHA256ハッシュのみ保存
- 既存ユーザーに実行すると再発行(旧トークンは即無効)
- トークン本体は標準出力にのみ表示される。メール差し込み用に配信システムへ登録する

## 同意文言のバージョン更新方法

1. 文言を変更する(`src/content/copy.ts` の `checkboxLabel` / `notice`)
2. `src/config/launch.ts` の `consentVersion` を必ず上げる(例: `2026-09-v2`)
3. ConsentEventに `consentVersion` と文言全文のSHA-256(`consentTextHash`)が記録され、
   「どのバージョンのどの文言に同意したか」を後から追跡できる

## メールプレビュー方法

```bash
npm run dev
# http://localhost:3000/dev/emails を開く
```

Day 0〜3の各メールについて、topic(iphone / arbitrage / both)と
HTML版/プレーンテキスト版を切り替えて確認できる。デモモード時のみ有効。

## API

| エンドポイント                                       | 内容                                                     |
| ---------------------------------------------------- | -------------------------------------------------------- |
| `GET /api/preferences/resolve?token=`                | トークン検証・マスク済みメール・現在の選択状態(更新なし) |
| `POST /api/preferences/confirm`                      | 選択内容の確定(冪等・CSRF対策・レート制限あり)           |
| `POST /api/preferences/opt-out`                      | 全カテゴリー停止(確認画面経由のみ)                       |
| `POST /api/preferences/one-click-unsubscribe?token=` | RFC 8058 ワンクリック解除の受け口                        |

## 本番公開前の確認事項

1. `src/config/launch.ts` の全プレースホルダーを正式情報へ置換した
2. `PREFERENCE_TOKEN_SECRET` を本番用ランダム値へ変更した(.envの開発用値を使わない)
3. `DEMO_MODE=false` を設定した(メールプレビュー画面が無効になる)
4. DBをPostgreSQLへ切り替えた
5. デモシード(`db:seed`)を本番で実行していない
6. `EMAIL_PROVIDER` の実装・接続を完了し、タグ連携をテストした
7. 販売LP URL(iPhone/アービトラージ)が正しい外部URLになっている
8. プライバシーポリシー・特商法表記ページが実在するURLになっている
9. レート制限を本番構成に合わせて見直した(複数インスタンスなら共有ストアへ)
10. 法務確認(下記プレースホルダー一覧・配信文言・過去リストへの初回送信可否)が完了した

## 法務確認が必要なプレースホルダー一覧

`src/config/launch.ts`:

- 【前田さん側の正式事業者名】
- 【トリック運営の正式事業者名】
- 【問い合わせ先】
- 【サポートメールアドレス】(環境変数 `SUPPORT_EMAIL`)
- 【プライバシーポリシーURL】
- 【特商法表記URL】
- 【iPhone販売LP URL】
- 【アービトラージ販売LP URL】
- 【Day0〜Day3送信予定日】

`src/content/launch/day3.ts`:

- 【iPhone転売サービス正式名称】

その他の法務確認事項:

- 過去リストへの最初のメール送信可否は別途リーガル確認済みであることが前提。
  本システムは初回送信の適法性を保証する表示を行っていない
- 同意文言(`src/content/copy.ts`)・メール文面の最終確認
- アービトラージ関連コンテンツは一般的な仕組み・検証・資金管理・リスク管理の解説に
  限定しており、特定の金融商品・通貨・業者・タイミングの個別推奨を含まない方針。
  文言変更時もこの方針を維持すること

## データ設計・セキュリティの要点

- `Subscriber`: トークンはHMAC-SHA256ハッシュのみ保存(本体は保存しない)
- `ConsentEvent`: カテゴリー配列(両方選択時も `iphone` / `arbitrage` を個別保存)、
  action(`consent_confirmed` / `preferences_updated` / `all_marketing_opted_out`)、
  同意バージョン、文言ハッシュ、campaignId、冪等キー(requestId)を記録
- IPアドレスは保存しない(初期実装では不要と判断。保存する場合は目的と保持期間を定めること)
- URL・HTML・ログ・分析イベントに生のメールアドレスを出さない(マスキング済みのみ)
- 分析イベントはホワイトリスト方式で、email / token / subscriberId 等を送信できない
- 無効・期限切れトークンは同一の共通エラー(登録状態を推測させない)
