import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { useTranslation } from "react-i18next";
import { reportPost } from "@/configs/client-services";
import { buildPostShareUrl } from "@/src/postShare";

export type ReportModalProps = {
  postId?: string;
  postLink?: string;
  onSubmitted?: () => void;
};

export default function ReportModal({
  postId,
  postLink = "",
  onSubmitted,
}: ReportModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const shareUrl = buildPostShareUrl(postLink);
  const canSubmit = Boolean(postId?.trim()) && reason.trim().length > 0 && !busy;

  const handleSubmit = async () => {
    const id = postId?.trim();
    if (!id || reason.trim() === "" || busy) {
      return;
    }

    setBusy(true);
    try {
      await reportPost(id, {
        reason: reason.trim(),
        postUrl: shareUrl,
      });
      notifications.show({
        title: t("Report"),
        message: t("reportSent"),
        color: "teal",
      });
      setReason("");
      onSubmitted?.();
    } catch (error: unknown) {
      const message =
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data
          ?.message === "string"
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : t("reportFailed");

      notifications.show({
        title: t("Report"),
        message: message ?? t("reportFailed"),
        color: "red",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mr-0">
      <div className="flex flex-col">
        <label className="text-sm">{t("reportPostLink")}</label>
        <input
          type="text"
          readOnly
          value={shareUrl || "—"}
          className="border-b text-sm p-2 bg-gray-50 text-gray-700"
        />
      </div>
      <div className="flex flex-col mt-2">
        <label className="text-sm" htmlFor="report-reason">
          {t("whyReport")}
        </label>
        <textarea
          id="report-reason"
          className="border p-2 text-sm mt-2 rounded border-gray-300"
          placeholder={t("reportPlaceholder")}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={4}
          maxLength={2000}
          disabled={busy}
        />
      </div>
      <button
        type="button"
        disabled={!canSubmit}
        onClick={() => void handleSubmit()}
        className={`w-full h-full flex text-center justify-center items-center rounded font-bold text-white text-sm lg:text-base max-w-[200px] mx-auto min-h-[40px] mt-4 ${
          canSubmit ? "bg-003049" : "bg-f5f3f4 text-gray-400 pointer-events-none"
        }`}
      >
        {busy ? "..." : t("sendForReview")}
      </button>
    </div>
  );
}

