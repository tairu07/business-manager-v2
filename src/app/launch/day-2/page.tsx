import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { launchConfig } from "@/config/launch";
import { day2Content } from "@/content/launch/day2";
import { parseTopic } from "@/lib/launchTopic";
import { LaunchContentLayout } from "@/components/LaunchContentLayout";
import { Day2Checklist } from "@/components/Day2Checklist";
import { NextDayCta } from "@/components/NextDayCta";

export const metadata: Metadata = {
  title: day2Content.title,
};

export default async function Day2Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!launchConfig.contentPages.day2Published) notFound();
  const topic = parseTopic((await searchParams).topic);

  return (
    <LaunchContentLayout content={day2Content} topic={topic}>
      {day2Content.interactiveChecklist ? (
        <Day2Checklist checklist={day2Content.interactiveChecklist} />
      ) : null}
      {day2Content.nextCta ? (
        <NextDayCta
          label={day2Content.nextCta.label}
          day={day2Content.nextCta.day}
          topic={topic}
        />
      ) : null}
    </LaunchContentLayout>
  );
}
