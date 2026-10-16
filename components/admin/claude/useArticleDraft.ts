"use client";

import { useCallback } from "react";
import type { ClusterAxis, ArticleRole, TargetReader } from "@/lib/blog";
import type { ArticleStep, DraftData, Volume } from "./constants";
import { STORAGE_KEY } from "./constants";

export interface DraftSetters {
  setStep: (v: ArticleStep) => void;
  setPrimaryKeyword: (v: string) => void;
  setSecondaryKeywords: (v: string) => void;
  setCoOccurrenceWords: (v: string) => void;
  setClusterAxis: (v: ClusterAxis) => void;
  setArticleRole: (v: ArticleRole) => void;
  setTargetReader: (v: TargetReader) => void;
  setVolume: (v: Volume) => void;
  setHubSlug: (v: string) => void;
  setDeepDiveText: (v: string) => void;
  setUserFeedbackOnDeepDive: (v: string) => void;
  setOutline: (v: any) => void;
  setContent: (v: string) => void;
}

function applyDraftToState(data: DraftData, setters: DraftSetters) {
  const stepToRestore: ArticleStep =
    data.step && ["keywords", "deepDive", "outline", "content"].includes(data.step)
      ? data.step
      : data.content && data.outline ? "outline"
      : data.outline ? "outline"
      : data.deepDiveText ? "deepDive"
      : "keywords";
  setters.setStep(stepToRestore);
  setters.setPrimaryKeyword(data.primaryKeyword || "");
  setters.setSecondaryKeywords(
    Array.isArray(data.secondaryKeywords)
      ? (data.secondaryKeywords as string[]).join(", ")
      : data.secondaryKeywords || "",
  );
  setters.setCoOccurrenceWords(data.coOccurrenceWords ?? "");
  setters.setClusterAxis(data.clusterAxis ?? "other");
  setters.setArticleRole(data.articleRole ?? "child");
  setters.setTargetReader(data.targetReader ?? "both");
  setters.setVolume(data.volume ?? "standard");
  setters.setHubSlug(data.hubSlug ?? "");
  setters.setDeepDiveText(data.deepDiveText ?? "");
  setters.setUserFeedbackOnDeepDive(data.userFeedbackOnDeepDive ?? "");
  setters.setOutline(data.outline);
  setters.setContent(data.content);
}

export function readDraft(): DraftData | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;
    return JSON.parse(saved) as DraftData;
  } catch {
    return null;
  }
}

export function writeDraft(data: DraftData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save draft:", error);
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear draft:", error);
  }
}

export function hasSavedProgress(): boolean {
  const data = readDraft();
  if (!data) return false;
  return !!(data.primaryKeyword || data.deepDiveText || data.outline || data.content);
}

export function hasMeaningfulProgress(data: DraftData): boolean {
  return !!(data.outline || data.content || data.primaryKeyword || data.deepDiveText);
}

/**
 * Hook: returns helpers for loading / applying / clearing article drafts.
 * Caller is still responsible for calling these inside useEffect blocks so the
 * precise dependencies and timing match the original behavior.
 */
export function useArticleDraft(setters: DraftSetters) {
  const applyDraft = useCallback(
    (data: DraftData) => {
      applyDraftToState(data, setters);
    },
    [setters],
  );

  return {
    readDraft,
    writeDraft,
    clearDraft,
    hasSavedProgress,
    hasMeaningfulProgress,
    applyDraft,
  };
}
