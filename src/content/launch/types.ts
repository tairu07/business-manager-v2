/** Dayコンテンツページの構造化コンテンツ型 */

export interface DaySection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
}

export interface DayChecklist {
  title: string;
  items: string[];
}

export interface DayContent {
  day: 1 | 2 | 3;
  title: string;
  lead: string;
  /** 全topic共通の導入セクション */
  commonSections: DaySection[];
  /** topicにiphoneが含まれる場合に表示 */
  iphoneSections: DaySection[];
  /** topicにarbitrageが含まれる場合に表示 */
  arbitrageSections: DaySection[];
  /** 全topic共通の締めセクション */
  closingSections: DaySection[];
  /** 表示のみのチェックリスト(Day1) */
  checklist?: DayChecklist;
  /** ブラウザ内だけで完結する入力可能チェックリスト(Day2) */
  interactiveChecklist?: DayChecklist;
  /** 次のDayへのCTA */
  nextCta?: { label: string; day: 2 | 3 };
}
