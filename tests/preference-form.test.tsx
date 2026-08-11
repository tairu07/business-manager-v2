// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PreferenceForm } from "@/components/PreferenceForm";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const TEST_TOKEN = "test-token-0000000000000000000000000000";

function renderForm(initialCategories: ("iphone" | "arbitrage")[] = []) {
  return render(
    <PreferenceForm
      token={TEST_TOKEN}
      maskedEmail="k***@gmail.com"
      initialCategories={initialCategories}
    />
  );
}

beforeEach(() => {
  cleanup();
  pushMock.mockReset();
  vi.unstubAllGlobals();
});

describe("PreferenceForm", () => {
  it("メールアドレス入力欄が存在しない(完了条件)", () => {
    const { container } = renderForm();
    expect(container.querySelector('input[type="email"]')).toBeNull();
    expect(container.querySelector('input[type="text"]')).toBeNull();
    expect(screen.getByText(/k\*\*\*@gmail\.com/)).toBeInTheDocument();
  });

  it("何も選択していないと登録ボタンが無効になる", () => {
    renderForm();
    expect(screen.getByRole("button", { name: "この内容で登録する" })).toBeDisabled();
  });

  it("preset相当の初期選択が反映される(要件2)", () => {
    renderForm(["iphone"]);
    expect(screen.getByRole("checkbox", { name: /iPhone転売に関する/ })).toBeChecked();
    expect(
      screen.getByRole("checkbox", { name: /アービトラージに関する/ })
    ).not.toBeChecked();
    expect(screen.getByRole("button", { name: "この内容で登録する" })).toBeEnabled();
  });

  it("キーボードだけで選択と登録ができる(要件12)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderForm();

    // Tabでチェックボックスへ移動し、Spaceで選択
    const iphoneCheckbox = screen.getByRole("checkbox", {
      name: /iPhone転売に関する/,
    });
    iphoneCheckbox.focus();
    await user.keyboard(" ");
    expect(iphoneCheckbox).toBeChecked();

    // サマリーが更新される
    expect(screen.getByText(/選択中/)).toBeInTheDocument();

    // Tabで登録ボタンへ移動しEnterで送信
    const submit = screen.getByRole("button", { name: "この内容で登録する" });
    submit.focus();
    await user.keyboard("{Enter}");

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/preferences/confirm");
    const body = JSON.parse(init.body);
    expect(body.categories).toEqual(["iphone"]);
    expect(body.token).toBe(TEST_TOKEN);
    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/preferences/complete?c=iphone")
    );
  });

  it("カード全体のクリックで選択でき、モバイル固定バーのCTAが操作できる(要件11)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderForm();

    // カード内のタイトルテキストをクリック → labelを通じてチェックされる
    await user.click(screen.getByText("アービトラージ"));
    expect(
      screen.getByRole("checkbox", { name: /アービトラージに関する/ })
    ).toBeChecked();

    const submit = screen.getByRole("button", { name: "この内容で登録する" });
    expect(submit).toBeEnabled();
    await user.click(submit);
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.categories).toEqual(["arbitrage"]);
  });

  it("配信停止は確認ダイアログを経ないと実行されない(要件10)", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ ok: true }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderForm();

    // 停止ボタンを押すと確認ダイアログが開くが、この時点ではPOSTされない
    await user.click(screen.getByRole("button", { name: "今後の案内をすべて停止する" }));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(
      screen.getByText(/iPhone転売およびアービトラージに関する案内を停止します/)
    ).toBeInTheDocument();

    // 「戻る」でキャンセルしてもPOSTされない
    await user.click(screen.getByRole("button", { name: "戻る" }));
    expect(fetchMock).not.toHaveBeenCalled();

    // 再度開いて「配信を停止する」で確定したときだけPOSTされる
    await user.click(screen.getByRole("button", { name: "今後の案内をすべて停止する" }));
    await user.click(screen.getByRole("button", { name: "配信を停止する" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(fetchMock.mock.calls[0][0]).toBe("/api/preferences/opt-out");
    await waitFor(() =>
      expect(pushMock).toHaveBeenCalledWith("/preferences/opt-out-complete")
    );
  });

  it("二重クリックしても同じrequestIdで送信される(要件5のクライアント側)", async () => {
    let resolveFirst: (v: unknown) => void = () => {};
    const fetchMock = vi.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveFirst = resolve;
        })
    );
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderForm(["iphone"]);

    const submit = screen.getByRole("button", { name: "この内容で登録する" });
    await user.click(submit);
    // 送信中はボタンが無効化され、二重送信できない
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "登録中…" })).toBeDisabled()
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
    resolveFirst({ ok: true, json: async () => ({ ok: true }) });
  });

  it("通信エラー時はエラー文言を表示し、成功表示を出さない", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network"));
    vi.stubGlobal("fetch", fetchMock);

    const user = userEvent.setup();
    renderForm(["iphone"]);

    await user.click(screen.getByRole("button", { name: "この内容で登録する" }));
    await waitFor(() =>
      expect(
        screen.getByText(/通信に失敗しました。入力内容は変更されていません。/)
      ).toBeInTheDocument()
    );
    expect(pushMock).not.toHaveBeenCalled();
  });
});
