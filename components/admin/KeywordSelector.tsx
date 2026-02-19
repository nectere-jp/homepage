"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import {
  LuSearch,
  LuStar,
  LuX,
  LuChevronDown,
  LuMessageSquare,
  LuFlag,
} from "react-icons/lu";
import { Chip } from "@/components/admin/Chip";
import type { BusinessType } from "@/lib/blog";

/** API のバリアント単位の1行 */
interface MasterKeywordRow {
  groupId: string;
  parentId: string | null;
  keyword: string;
  keywordTier: "big" | "middle" | "longtail";
  relatedBusiness: BusinessType[];
  relatedTags: string[];
  assignedArticles: string[];
  priority: number;
  status: string;
  workflowFlag?: string;
  businessImpact: number;
  intentGroupId?: string | null;
}

/** グループ単位の表示用（1グループ1行） */
interface KeywordGroupOption {
  groupId: string;
  representativeKeyword: string;
  tier: "big" | "middle" | "longtail";
  parentId: string | null;
  /** 問い合わせ見込み（バリアント合計） */
  totalInquiryEstimate: number;
  workflowFlag: string;
  priority: number;
  assignedArticles: string[];
  relatedBusiness: BusinessType[];
  relatedTags: string[];
  status: string;
  /** ツリー表示用: ロングテールならインデントする */
  indent: boolean;
}

interface KeywordSelectorProps {
  onSelect: (primary: string, secondary: string[]) => void;
  initialKeyword?: string;
}

interface GroupDropdownProps {
  groups: KeywordGroupOption[];
  selectedGroupId: string | null;
  onSelect?: (groupId: string) => void;
  placeholder: string;
  multiSelect?: boolean;
  selectedGroupIds?: string[];
  onToggleGroup?: (groupId: string) => void;
  businessLabels: Record<BusinessType, string>;
  showSearch?: boolean;
}

const BUSINESS_LABELS: Record<BusinessType, string> = {
  translation: "翻訳",
  "web-design": "Web制作",
  print: "印刷",
  nobilva: "Nobilva",
  teachit: "Teachit",
};

const WORKFLOW_FLAG_LABELS: Record<string, string> = {
  pending: "未着手",
  to_create: "作成予定",
  created: "作成済",
  needs_update: "要更新",
  skip: "スキップ",
};

const TIER_LABELS: Record<string, string> = {
  big: "ビッグ",
  middle: "ミドル",
  longtail: "ロングテール",
};

/** グループ単位のドロップダウン（ミドル/ロングテールをインデントで表示） */
function GroupDropdown({
  groups,
  selectedGroupId,
  onSelect,
  placeholder,
  multiSelect = false,
  selectedGroupIds = [],
  onToggleGroup,
  businessLabels,
  showSearch = true,
}: GroupDropdownProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredGroups = groups.filter((g) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      g.representativeKeyword.toLowerCase().includes(q) ||
      g.relatedTags.some((t) => t.toLowerCase().includes(q))
    );
  });

  const handleSelect = (groupId: string) => {
    if (multiSelect && onToggleGroup) {
      onToggleGroup(groupId);
    } else if (onSelect) {
      onSelect(groupId);
      setShowDropdown(false);
      setSearchQuery("");
    }
  };

  const selectedGroup = selectedGroupId
    ? groups.find((g) => g.groupId === selectedGroupId)
    : null;
  const displayLabel = selectedGroup?.representativeKeyword ?? placeholder;
  const multiDisplayLabel =
    selectedGroupIds.length > 0
      ? selectedGroupIds
          .map(
            (id) =>
              groups.find((g) => g.groupId === id)?.representativeKeyword ?? id,
          )
          .join(", ")
      : placeholder;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-xl text-left flex items-center justify-between hover:border-primary transition-colors"
      >
        <span
          className={
            multiSelect
              ? selectedGroupIds.length > 0
                ? "text-gray-900 font-medium"
                : "text-gray-400"
              : selectedGroupId
                ? "font-medium text-gray-900"
                : "text-gray-400"
          }
        >
          {multiSelect ? multiDisplayLabel : displayLabel}
        </span>
        <LuChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${
            showDropdown ? "transform rotate-180" : ""
          }`}
        />
      </button>

      {showDropdown && (
        <div className="absolute z-10 mt-2 w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto">
          {showSearch && (
            <div className="sticky top-0 bg-white p-3 border-b">
              <div className="relative">
                <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="キーワード・タグで検索..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          )}

          {multiSelect && selectedGroupIds.length > 0 && (
            <div className="p-3 bg-primary/5 border-b">
              <div className="text-xs font-medium text-gray-700 mb-2">
                選択済み ({selectedGroupIds.length}個)
              </div>
              <div className="flex flex-wrap gap-2">
                {selectedGroupIds.map((id) => {
                  const g = groups.find((x) => x.groupId === id);
                  return (
                    <Chip
                      key={id}
                      variant="selected"
                      size="md"
                      className="flex items-center gap-1.5 pr-1"
                    >
                      <span>{g?.representativeKeyword ?? id}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleGroup?.(id);
                        }}
                        className="hover:bg-primary/20 rounded p-0.5 -mr-0.5 ml-0.5"
                      >
                        <LuX className="w-3 h-3" />
                      </button>
                    </Chip>
                  );
                })}
              </div>
            </div>
          )}

          <div className="divide-y divide-gray-100">
            {filteredGroups.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                該当するキーワードがありません
              </div>
            ) : (
              filteredGroups.map((g) => {
                const isSelected = multiSelect
                  ? selectedGroupIds.includes(g.groupId)
                  : selectedGroupId === g.groupId;
                return (
                  <button
                    type="button"
                    key={g.groupId}
                    onClick={() => handleSelect(g.groupId)}
                    className={`w-full p-3 text-left transition-colors ${
                      isSelected ? "bg-primary/5" : "hover:bg-gray-50"
                    } ${g.indent ? "pl-8" : ""}`}
                  >
                    <div className="flex items-center gap-3">
                      {multiSelect ? (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-primary rounded focus:ring-primary shrink-0"
                        />
                      ) : (
                        <input
                          type="radio"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 text-primary shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                          <span className="font-medium text-gray-900">
                            {g.indent && (
                              <span className="text-gray-400 mr-1">└ </span>
                            )}
                            {g.representativeKeyword}
                          </span>
                          <div className="flex gap-0.5 shrink-0">
                            {[...Array(g.priority)].map((_, i) => (
                              <LuStar
                                key={i}
                                className="w-3 h-3 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600 flex-wrap">
                          <span className="flex items-center gap-1">
                            <LuMessageSquare className="w-3 h-3 shrink-0" />
                            問い合わせ見込み:{" "}
                            {g.totalInquiryEstimate.toLocaleString()}/月
                          </span>
                          <span className="flex items-center gap-1">
                            <LuFlag className="w-3 h-3 shrink-0" />
                            {WORKFLOW_FLAG_LABELS[g.workflowFlag] ??
                              g.workflowFlag}
                          </span>
                          {g.assignedArticles.length === 0 ? (
                            <Chip variant="success" size="sm">
                              未使用
                            </Chip>
                          ) : (
                            <span className="text-gray-500">
                              {g.assignedArticles.length}記事で使用中
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function KeywordSelector({
  onSelect,
  initialKeyword,
}: KeywordSelectorProps) {
  const [variantRows, setVariantRows] = useState<MasterKeywordRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<
    BusinessType | "all"
  >("all");
  const [primaryGroupId, setPrimaryGroupId] = useState<string>(
    initialKeyword || "",
  );
  const [secondaryGroupIds, setSecondaryGroupIds] = useState<string[]>([]);

  useEffect(() => {
    fetchKeywords();
  }, []);

  useEffect(() => {
    if (initialKeyword) {
      setPrimaryGroupId(initialKeyword);
    }
  }, [initialKeyword]);

  const fetchKeywords = async () => {
    try {
      const response = await fetch("/api/admin/keywords/master");
      if (response.ok) {
        const data = await response.json();
        setVariantRows(data.keywords || []);
      }
    } catch (error) {
      console.error("Failed to fetch keywords:", error);
    } finally {
      setLoading(false);
    }
  };

  // バリアント行をグループ単位に集約（問い合わせ見込みはバリアント合計）
  const groupsByGroupId = useMemo(() => {
    const map = new Map<
      string,
      {
        groupId: string;
        parentId: string | null;
        tier: "big" | "middle" | "longtail";
        totalInquiryEstimate: number;
        workflowFlag: string;
        priority: number;
        assignedArticles: string[];
        relatedBusiness: BusinessType[];
        relatedTags: string[];
        status: string;
        firstKeyword: string;
      }
    >();
    for (const row of variantRows) {
      const existing = map.get(row.groupId);
      const tier = row.keywordTier;
      const impact =
        typeof row.businessImpact === "number" ? row.businessImpact : 0;
      if (existing) {
        existing.totalInquiryEstimate += impact;
      } else {
        map.set(row.groupId, {
          groupId: row.groupId,
          parentId: row.parentId ?? null,
          tier,
          totalInquiryEstimate: impact,
          workflowFlag: row.workflowFlag ?? "pending",
          priority: row.priority ?? 3,
          assignedArticles: row.assignedArticles ?? [],
          relatedBusiness: row.relatedBusiness ?? [],
          relatedTags: row.relatedTags ?? [],
          status: row.status ?? "active",
          firstKeyword: row.keyword,
        });
      }
    }
    return map;
  }, [variantRows]);

  // ツリー順: ミドル/ビッグを先に、その下にロングテール（親でグループ化してインデント）
  const primaryGroupOptions = useMemo(() => {
    const list: KeywordGroupOption[] = [];
    const byParent = new Map<string | null, string[]>();
    for (const [groupId, g] of groupsByGroupId) {
      if (g.status !== "active") continue;
      if (
        selectedBusiness !== "all" &&
        !g.relatedBusiness.includes(selectedBusiness)
      ) {
        continue;
      }
      const parent = g.parentId || null;
      if (!byParent.has(parent)) byParent.set(parent, []);
      byParent.get(parent)!.push(groupId);
    }
    // 親なし（ミドル/ビッグ）を優先度・問い合わせ見込みでソート
    const rootIds = byParent.get(null) ?? [];
    rootIds.sort((a, b) => {
      const ga = groupsByGroupId.get(a)!;
      const gb = groupsByGroupId.get(b)!;
      if (gb.priority !== ga.priority) return gb.priority - ga.priority;
      return gb.totalInquiryEstimate - ga.totalInquiryEstimate;
    });
    for (const groupId of rootIds) {
      const g = groupsByGroupId.get(groupId)!;
      list.push({
        groupId,
        representativeKeyword: g.firstKeyword,
        tier: g.tier,
        parentId: g.parentId,
        totalInquiryEstimate: g.totalInquiryEstimate,
        workflowFlag: g.workflowFlag,
        priority: g.priority,
        assignedArticles: g.assignedArticles,
        relatedBusiness: g.relatedBusiness,
        relatedTags: g.relatedTags,
        status: g.status,
        indent: false,
      });
      const childIds = byParent.get(groupId) ?? [];
      childIds.sort((a, b) => {
        const ga = groupsByGroupId.get(a)!;
        const gb = groupsByGroupId.get(b)!;
        return gb.totalInquiryEstimate - ga.totalInquiryEstimate;
      });
      for (const cid of childIds) {
        const c = groupsByGroupId.get(cid)!;
        list.push({
          groupId: cid,
          representativeKeyword: c.firstKeyword,
          tier: c.tier,
          parentId: c.parentId,
          totalInquiryEstimate: c.totalInquiryEstimate,
          workflowFlag: c.workflowFlag,
          priority: c.priority,
          assignedArticles: c.assignedArticles,
          relatedBusiness: c.relatedBusiness,
          relatedTags: c.relatedTags,
          status: c.status,
          indent: true,
        });
      }
    }
    return list;
  }, [groupsByGroupId, selectedBusiness]);

  // initialKeyword がバリアント文字列の場合は最初にマッチする groupId に正規化
  const resolvedPrimaryGroupId = useMemo(() => {
    if (!primaryGroupId) return "";
    if (groupsByGroupId.has(primaryGroupId)) return primaryGroupId;
    const row = variantRows.find((r) => r.keyword === primaryGroupId);
    return row?.groupId ?? primaryGroupId;
  }, [primaryGroupId, variantRows, groupsByGroupId]);

  // 選択中グループが事業フィルターで外れていても表示できるようリストに含める
  const primaryGroupOptionsWithSelected = useMemo(() => {
    if (!resolvedPrimaryGroupId) return primaryGroupOptions;
    const inList = primaryGroupOptions.some((g) => g.groupId === resolvedPrimaryGroupId);
    if (inList) return primaryGroupOptions;
    const g = groupsByGroupId.get(resolvedPrimaryGroupId);
    if (!g) return primaryGroupOptions;
    return [
      ...primaryGroupOptions,
      {
        groupId: resolvedPrimaryGroupId,
        representativeKeyword: g.firstKeyword,
        tier: g.tier,
        parentId: g.parentId,
        totalInquiryEstimate: g.totalInquiryEstimate,
        workflowFlag: g.workflowFlag,
        priority: g.priority,
        assignedArticles: g.assignedArticles,
        relatedBusiness: g.relatedBusiness,
        relatedTags: g.relatedTags,
        status: g.status,
        indent: g.parentId != null,
      } as KeywordGroupOption,
    ];
  }, [primaryGroupOptions, resolvedPrimaryGroupId, groupsByGroupId]);

  useEffect(() => {
    onSelect(resolvedPrimaryGroupId || primaryGroupId, secondaryGroupIds);
  }, [resolvedPrimaryGroupId, primaryGroupId, secondaryGroupIds, onSelect]);

  const primaryGroup = primaryGroupOptions.find(
    (g) => g.groupId === resolvedPrimaryGroupId,
  );
  const intentGroupId = primaryGroup
    ? (primaryGroup.parentId ?? primaryGroup.groupId)
    : null;
  const sameIntentGroups = primaryGroup
    ? primaryGroupOptions.filter(
        (g) =>
          g.groupId !== resolvedPrimaryGroupId &&
          (g.parentId === intentGroupId || g.groupId === intentGroupId),
      )
    : [];
  const otherRelatedGroups = primaryGroup
    ? primaryGroupOptions.filter(
        (g) =>
          g.groupId !== resolvedPrimaryGroupId &&
          !sameIntentGroups.some((s) => s.groupId === g.groupId) &&
          (g.relatedBusiness.some((b) =>
            primaryGroup.relatedBusiness.includes(b),
          ) ||
            g.relatedTags.some((t) => primaryGroup.relatedTags.includes(t))),
      )
    : [];
  const suggestedSecondaryGroups = [...sameIntentGroups, ...otherRelatedGroups];

  const handlePrimarySelect = (groupId: string) => {
    setPrimaryGroupId(groupId);
    setSecondaryGroupIds([]);
  };

  const handleSecondaryToggle = (groupId: string) => {
    setSecondaryGroupIds((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId],
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-base font-bold text-gray-900 mb-2">
          事業を選択
        </label>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setSelectedBusiness("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              selectedBusiness === "all"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            すべて
          </button>
          {Object.entries(BUSINESS_LABELS).map(([key, label]) => (
            <button
              type="button"
              key={key}
              onClick={() => setSelectedBusiness(key as BusinessType)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedBusiness === key
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
          主要キーワード
          <Chip variant="required">必須</Chip>
        </label>
        <p className="text-sm text-gray-600 mb-2">
          ミドル／ロングテールのグループを1つ選択
        </p>
        <GroupDropdown
          groups={primaryGroupOptionsWithSelected}
          selectedGroupId={resolvedPrimaryGroupId || null}
          onSelect={handlePrimarySelect}
          placeholder="キーワードを選択してください"
          businessLabels={BUSINESS_LABELS}
          showSearch={true}
        />
      </div>

      {resolvedPrimaryGroupId && suggestedSecondaryGroups.length > 0 && (
        <div>
          <label className="block text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
            関連キーワード
            <Chip variant="optional">任意</Chip>
            {secondaryGroupIds.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-600">
                {secondaryGroupIds.length}個選択中
              </span>
            )}
          </label>
          {sameIntentGroups.length > 0 && (
            <p className="text-sm text-gray-600 mb-2">
              同趣旨のキーワード {sameIntentGroups.length} 件
              {otherRelatedGroups.length > 0 &&
                `、その他関連 ${otherRelatedGroups.length} 件`}
            </p>
          )}
          <GroupDropdown
            groups={suggestedSecondaryGroups}
            selectedGroupId={null}
            selectedGroupIds={secondaryGroupIds}
            onToggleGroup={handleSecondaryToggle}
            placeholder="関連キーワードから選択（同趣旨を優先表示）"
            multiSelect={true}
            businessLabels={BUSINESS_LABELS}
            showSearch={false}
          />
        </div>
      )}
    </div>
  );
}
