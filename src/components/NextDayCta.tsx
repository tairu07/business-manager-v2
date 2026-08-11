import Link from "next/link";
import type { LaunchTopic } from "@/config/launch";

/** 次のDayコンテンツページへのCTA(topicを引き継ぐ) */
export function NextDayCta({
  label,
  day,
  topic,
}: {
  label: string;
  day: 2 | 3;
  topic: LaunchTopic;
}) {
  return (
    <div className="mt-10">
      <Link
        href={`/launch/day-${day}?topic=${topic}`}
        className="flex min-h-14 w-full items-center justify-center rounded-xl border-2
          border-accent px-6 text-center font-bold text-accent hover:bg-accent-soft"
      >
        {label}
      </Link>
    </div>
  );
}
