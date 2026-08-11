import { copy } from "@/content/copy";

/**
 * 無効・期限切れ・失効済みトークン共通のエラー表示。
 * 登録状態や個人情報の有無を推測できる情報は一切出さない。
 */
export function InvalidLinkNotice({ supportEmail }: { supportEmail: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 sm:p-8">
      <h1 className="text-xl font-bold text-ink sm:text-2xl">
        {copy.invalidToken.heading}
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-body">
        {copy.invalidToken.body}
      </p>
      <p className="mt-4 text-sm text-muted">サポート:{supportEmail}</p>
    </div>
  );
}
