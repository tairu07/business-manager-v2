"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { copy } from "@/content/copy";
import { launchConfig, type Category } from "@/config/launch";
import { track } from "@/lib/analytics/track";
import { PreferenceCard } from "@/components/PreferenceCard";
import { PreferenceSummary } from "@/components/PreferenceSummary";
import { ConsentNotice } from "@/components/ConsentNotice";
import { StickySubmitBar } from "@/components/StickySubmitBar";
import { OptOutDialog } from "@/components/OptOutDialog";

/**
 * 配信設定LPのフォーム本体。
 *
 * - GET(表示)では何も確定しない。確定は「この内容で登録する」ボタンのPOSTのみ
 * - preset はチェック状態の事前選択にのみ使用
 * - requestId により二重クリックでも重複記録されない(サーバー側で冪等)
 */

const formSchema = z.object({
  categories: z.array(z.enum(["iphone", "arbitrage"])),
});

type FormValues = z.infer<typeof formSchema>;

export interface PreferenceFormProps {
  token: string;
  maskedEmail: string;
  initialCategories: Category[];
  /** メールの配信停止リンク経由(intent=opt-out)なら確認ダイアログを開いた状態で始める */
  startWithOptOutDialog?: boolean;
}

export function PreferenceForm({
  token,
  maskedEmail,
  initialCategories,
  startWithOptOutDialog = false,
}: PreferenceFormProps) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // メールの配信停止リンク経由なら、最初から確認ダイアログを開く
  const [optOutOpen, setOptOutOpen] = useState(startWithOptOutDialog);
  const [optOutBusy, setOptOutBusy] = useState(false);
  // 冪等キー: 送信リトライでは同じIDを使い回し、サーバー側で重複記録を防ぐ
  const [confirmRequestId] = useState(() => crypto.randomUUID());
  const [optOutRequestId] = useState(() => crypto.randomUUID());

  const {
    handleSubmit,
    setValue,
    control,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { categories: initialCategories },
  });

  const categories = useWatch({
    control,
    name: "categories",
    defaultValue: initialCategories,
  });

  useEffect(() => {
    // 完了画面の「配信設定を変更する」リンク用にトークンを保持する
    // (URLへ再掲しないため sessionStorage を使う。分析には送信しない)
    try {
      sessionStorage.setItem("pref_token", token);
    } catch {
      // プライベートモード等で失敗しても機能は継続する
    }
    track("preference_page_view", { campaign_id: launchConfig.campaignId });
    if (startWithOptOutDialog) {
      track("opt_out_started", { campaign_id: launchConfig.campaignId });
    }
    // 初回マウント時のみ実行する
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleCategory = (category: Category, checked: boolean) => {
    const next = checked
      ? [...new Set([...categories, category])]
      : categories.filter((c) => c !== category);
    setValue("categories", next, { shouldValidate: true });
    if (checked) {
      track("category_selected", {
        campaign_id: launchConfig.campaignId,
        category,
        selected_category_count: next.length,
      });
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    if (values.categories.length === 0) return;
    setErrorMessage(null);
    try {
      const res = await fetch("/api/preferences/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          categories: values.categories,
          consentVersion: launchConfig.consentVersion,
          campaignId: launchConfig.campaignId,
          requestId: confirmRequestId,
        }),
      });
      if (!res.ok) {
        setErrorMessage(copy.networkError);
        return;
      }
      track("consent_confirmed", {
        campaign_id: launchConfig.campaignId,
        selected_category_count: values.categories.length,
      });
      router.push(`/preferences/complete?c=${values.categories.join(",")}`);
    } catch {
      setErrorMessage(copy.networkError);
    }
  });

  const openOptOut = () => {
    setOptOutOpen(true);
    track("opt_out_started", { campaign_id: launchConfig.campaignId });
  };

  const confirmOptOut = async () => {
    setOptOutBusy(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/preferences/opt-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          consentVersion: launchConfig.consentVersion,
          campaignId: launchConfig.campaignId,
          requestId: optOutRequestId,
        }),
      });
      if (!res.ok) {
        setOptOutBusy(false);
        setOptOutOpen(false);
        setErrorMessage(copy.networkError);
        return;
      }
      track("opt_out_confirmed", { campaign_id: launchConfig.campaignId });
      router.push("/preferences/opt-out-complete");
    } catch {
      setOptOutBusy(false);
      setOptOutOpen(false);
      setErrorMessage(copy.networkError);
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <p className="rounded-lg bg-surface-muted border border-line px-4 py-3 text-sm text-body">
        {copy.preferences.recipientLabel}:
        <span className="font-medium text-ink">{maskedEmail}</span>
      </p>

      <div className="mt-6 space-y-4">
        <PreferenceCard
          id="category-iphone"
          {...copy.preferences.cards.iphone}
          checked={categories.includes("iphone")}
          onChange={(checked) => toggleCategory("iphone", checked)}
        />
        <PreferenceCard
          id="category-arbitrage"
          {...copy.preferences.cards.arbitrage}
          checked={categories.includes("arbitrage")}
          onChange={(checked) => toggleCategory("arbitrage", checked)}
        />
      </div>

      <div className="mt-6">
        <ConsentNotice />
      </div>

      {errorMessage ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-danger/40 bg-danger/5 px-4 py-3 text-sm text-danger"
        >
          {errorMessage}
        </p>
      ) : null}

      <div className="mt-8">
        <StickySubmitBar>
          <PreferenceSummary categories={categories} />
          <button
            type="submit"
            disabled={categories.length === 0 || isSubmitting}
            className="w-full min-h-14 rounded-xl bg-accent px-6 text-lg font-bold text-white
              hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? "登録中…" : copy.preferences.submitButton}
          </button>
        </StickySubmitBar>
      </div>

      <div className="mt-10 border-t border-line pt-6 text-center">
        <button
          type="button"
          onClick={openOptOut}
          className="min-h-11 px-4 text-sm text-muted underline underline-offset-4 hover:text-ink"
        >
          {copy.preferences.optOutButton}
        </button>
      </div>

      <OptOutDialog
        open={optOutOpen}
        busy={optOutBusy}
        onConfirm={confirmOptOut}
        onCancel={() => {
          if (!optOutBusy) setOptOutOpen(false);
        }}
      />
    </form>
  );
}
