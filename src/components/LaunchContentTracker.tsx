"use client";

import { useEffect } from "react";
import { launchConfig, type LaunchTopic } from "@/config/launch";
import { track } from "@/lib/analytics/track";

/** コンテンツページ閲覧イベント(個人情報・トークンは送信しない) */
export function LaunchContentTracker({
  dayNumber,
  topic,
}: {
  dayNumber: number;
  topic: LaunchTopic;
}) {
  useEffect(() => {
    track("launch_content_view", {
      campaign_id: launchConfig.campaignId,
      day_number: dayNumber,
      topic,
    });
  }, [dayNumber, topic]);

  return null;
}
