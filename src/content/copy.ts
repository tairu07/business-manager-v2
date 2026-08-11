/**
 * 配信設定LP・完了画面・エラー画面の全文言。
 *
 * 非エンジニアでも編集できるよう、コンポーネントにハードコードせず
 * このファイルに集約している。
 * 同意に関わる文言(checkboxLabel / notice)を変更した場合は、
 * src/config/launch.ts の consentVersion を必ず上げること。
 */

export const copy = {
  preferences: {
    headerLabel: "前田からの配信設定",
    heading: "これから受け取りたい情報を選んでください",
    subheading:
      "必要な情報だけを、前田からお送りします。メールアドレスの再入力は不要です。",
    recipientLabel: "現在の送信先",
    cards: {
      iphone: {
        title: "iPhone転売",
        description:
          "利益計算、在庫回転、資金繰り、仕入れ判断など、iPhone転売を事業として管理するための情報をお送りします。",
        note: "関連する有料サービスの販売者:トリック運営",
        checkboxLabel:
          "iPhone転売に関する無料コンテンツ、およびトリック運営が販売する関連サービスの案内を、前田から受け取る",
      },
      arbitrage: {
        title: "アービトラージ",
        description:
          "価格差が生まれる仕組み、コスト計算、バックテスト、資金管理、運用リスクなどの情報をお送りします。",
        note: "アービトラージエキスパートコースの販売者:前田",
        checkboxLabel:
          "アービトラージに関する無料コンテンツ、および前田が販売するエキスパートコースの案内を、前田から受け取る",
      },
    },
    notice: [
      "メール配信と配信設定の管理は前田が行います。",
      "iPhone転売に関する有料サービスはトリック運営が販売しますが、この設定画面でトリック運営へメールアドレスを提供することはありません。",
      "購入を希望する場合は、各販売者の申込みページで購入者本人が情報を入力します。",
      "登録後も、いつでも配信内容の変更または停止ができます。",
    ],
    summaryLabel: "選択中",
    summaryEmpty: "受け取る情報が選択されていません",
    submitButton: "この内容で登録する",
    optOutButton: "今後の案内をすべて停止する",
    optOutDialog: {
      title: "配信停止の確認",
      message:
        "今後、前田からのiPhone転売およびアービトラージに関する案内を停止します。よろしいですか?",
      confirmButton: "配信を停止する",
      cancelButton: "戻る",
    },
  },

  complete: {
    heading: "配信設定を登録しました",
    body: "選択いただいた内容に応じて、今後は前田から必要な情報だけをお送りします。",
    note: "配信内容は、メール下部の設定変更リンクからいつでも変更できます。",
    changeButton: "配信設定を変更する",
    changeFallback:
      "配信設定を変更する場合は、お送りしたメール内の設定変更リンクを開いてください。",
  },

  optOutComplete: {
    heading: "配信を停止しました",
    body: "今後、今回の企画に関する案内は送信されません。",
    note: "行き違いにより、すでに配信処理済みのメールが届く場合があります。",
    resubscribeButton: "配信設定を再登録する",
    resubscribeFallback:
      "配信設定を再登録する場合は、お送りしたメール内の設定変更リンクを開いてください。",
  },

  invalidToken: {
    heading: "このリンクは利用できません",
    body: "リンクの有効期限が切れているか、すでに無効になっている可能性があります。新しい配信設定リンクについては、サポートまでお問い合わせください。",
  },

  networkError:
    "通信に失敗しました。入力内容は変更されていません。時間をおいてもう一度お試しください。",

  footer: {
    privacyPolicy: "プライバシーポリシー",
    tokushoho: "特定商取引法に基づく表記",
    contact: "お問い合わせ",
  },

  categoryLabels: {
    iphone: "iPhone転売",
    arbitrage: "アービトラージ",
  },
} as const;
