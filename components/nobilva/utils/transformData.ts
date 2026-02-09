/**
 * Nobilvaページ用のデータ変換関数
 * 
 * next-intlのメッセージデータをコンポーネントで使用する形式に変換する
 */

import { getArray, getString, getValue } from "./dataHelpers";

/**
 * フィーチャーアイテムのデータを変換する
 * 
 * @param messages - next-intlのメッセージオブジェクト
 * @returns フィーチャーアイテムの配列
 */
export function transformFeatureItems(messages: any) {
  return getArray(messages, "features.items").map(
    (item: any, index: number) => ({
      title: item?.title ?? getString(messages, `features.items.${index}.title`),
      description:
        item?.description ?? getString(messages, `features.items.${index}.description`),
      image: `/images/nobilva/features-point${index + 1}.svg`,
    }),
  );
}

/**
 * 問題アイテムのデータを変換する
 * 
 * @param messages - next-intlのメッセージオブジェクト
 * @returns 問題アイテムの配列
 */
export function transformProblemItems(messages: any) {
  return getArray(messages, "problems.items").map(
    (item: any, index: number) => ({
      problem: item?.problem ?? getString(messages, `problems.items.${index}.problem`),
      description:
        item?.description ?? getString(messages, `problems.items.${index}.description`),
      solution: item?.solution ?? getString(messages, `problems.items.${index}.solution`),
      solutionDescription:
        item?.solutionDescription ??
        getString(messages, `problems.items.${index}.solutionDescription`),
      image: `/images/nobilva/problems-${index + 1}.svg`,
    }),
  );
}

/**
 * Heroタイトルのデータを変換する
 * 
 * @param messages - next-intlのメッセージオブジェクト
 * @returns Heroタイトルオブジェクト
 */
export function transformHeroTitle(messages: any) {
  return {
    prefix: getString(messages, "hero.title.prefix"),
    suffix: getString(messages, "hero.title.suffix"),
    service: getString(messages, "hero.title.service"),
  };
}

/**
 * Hero価格のデータを変換する
 * 
 * @param messages - next-intlのメッセージオブジェクト
 * @returns Hero価格オブジェクト
 */
export function transformHeroPrice(messages: any) {
  return {
    label: getString(messages, "hero.price.label"),
    amount: getString(messages, "hero.price.amount"),
    currency: getString(messages, "hero.price.currency"),
    from: getString(messages, "hero.price.from"),
    note: getString(messages, "hero.price.note"),
  };
}

/**
 * Heroベネフィットのデータを変換する
 * 
 * @param messages - next-intlのメッセージオブジェクト
 * @returns Heroベネフィットオブジェクト
 */
export function transformHeroBenefits(messages: any) {
  return {
    weekly: getString(messages, "hero.benefits.weekly"),
    chat: getString(messages, "hero.benefits.chat"),
    tutoring: getString(messages, "hero.benefits.tutoring"),
  };
}
