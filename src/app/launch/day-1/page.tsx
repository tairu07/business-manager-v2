import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { launchConfig } from "@/config/launch";
import { day1Content } from "@/content/launch/day1";
import { parseTopic } from "@/lib/launchTopic";
import { LaunchContentLayout } from "@/components/LaunchContentLayout";
import { NextDayCta } from "@/components/NextDayCta";

export const metadata: Metadata = {
  title: day1Content.title,
};

export default async function Day1Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (!launchConfig.contentPages.day1Published) notFound();
  const topic = parseTopic((await searchParams).topic);

  return (
    <LaunchContentLayout content={day1Content} topic={topic}>
      {day1Content.nextCta ? (
        <NextDayCta
          label={day1Content.nextCta.label}
          day={day1Content.nextCta.day}
          topic={topic}
        />
      ) : null}
    </LaunchContentLayout>
  );
}
