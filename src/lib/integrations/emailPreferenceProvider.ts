import type { Category } from "@/config/launch";
import { launchConfig } from "@/config/launch";

/**
 * メール配信システム連携の抽象インターフェース。
 *
 * 特定ベンダーに依存しないよう、タグ操作をこのインターフェースに限定する。
 * 実サービス(ConvertKit / MailChimp / 配配メール等)へ接続する場合は、
 * このインターフェースを実装したクラスを追加し、createEmailPreferenceProvider の
 * 分岐に EMAIL_PROVIDER の値を追加する。接続先はこのファイルだけで完結する。
 */

export const TAGS = {
  interestIphone: "interest_iphone",
  interestArbitrage: "interest_arbitrage",
  launchConsent: "launch_2026_consent",
  optedOut: "marketing_opted_out",
} as const;

export interface EmailPreferenceProvider {
  addTag(subscriberId: string, tag: string): Promise<void>;
  removeTag(subscriberId: string, tag: string): Promise<void>;
  unsubscribeFromMarketing(subscriberId: string): Promise<void>;
  updatePreferences(subscriberId: string, categories: Category[]): Promise<void>;
}

/**
 * デモ・開発用のMockプロバイダ。外部送信は一切行わない。
 * 呼び出し履歴をメモリに記録し、テストから検証できるようにする。
 */
export class MockEmailPreferenceProvider implements EmailPreferenceProvider {
  public readonly calls: Array<{ method: string; subscriberId: string; args: unknown }> =
    [];

  async addTag(subscriberId: string, tag: string): Promise<void> {
    this.calls.push({ method: "addTag", subscriberId, args: tag });
  }

  async removeTag(subscriberId: string, tag: string): Promise<void> {
    this.calls.push({ method: "removeTag", subscriberId, args: tag });
  }

  async unsubscribeFromMarketing(subscriberId: string): Promise<void> {
    this.calls.push({ method: "unsubscribeFromMarketing", subscriberId, args: null });
  }

  async updatePreferences(subscriberId: string, categories: Category[]): Promise<void> {
    this.calls.push({ method: "updatePreferences", subscriberId, args: categories });
    // タグ操作へ展開する(実プロバイダ実装の参考挙動)
    if (categories.includes("iphone")) {
      await this.addTag(subscriberId, TAGS.interestIphone);
    } else {
      await this.removeTag(subscriberId, TAGS.interestIphone);
    }
    if (categories.includes("arbitrage")) {
      await this.addTag(subscriberId, TAGS.interestArbitrage);
    } else {
      await this.removeTag(subscriberId, TAGS.interestArbitrage);
    }
    if (categories.length > 0) {
      await this.addTag(subscriberId, TAGS.launchConsent);
    }
  }
}

let providerInstance: EmailPreferenceProvider | null = null;

/**
 * 環境変数 EMAIL_PROVIDER に応じたプロバイダを返す。
 * デモモード中および未設定時は常にMock(外部送信なし)。
 */
export function createEmailPreferenceProvider(): EmailPreferenceProvider {
  if (providerInstance) return providerInstance;

  const provider = process.env.EMAIL_PROVIDER ?? "mock";

  if (launchConfig.demoMode || provider === "mock") {
    providerInstance = new MockEmailPreferenceProvider();
    return providerInstance;
  }

  // 実サービス接続時はここに分岐を追加する。例:
  // if (provider === "convertkit") {
  //   providerInstance = new ConvertKitProvider(process.env.EMAIL_PROVIDER_API_KEY!);
  //   return providerInstance;
  // }
  throw new Error(
    `EMAIL_PROVIDER "${provider}" の実装がありません。src/lib/integrations/emailPreferenceProvider.ts に実装を追加してください。`
  );
}

/** テスト用: シングルトンをリセットする */
export function resetEmailPreferenceProvider(): void {
  providerInstance = null;
}
