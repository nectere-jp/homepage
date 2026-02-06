'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Select } from '@/components/ui/Select';

interface BlogFiltersProps {
  categories: string[];
  tags: string[];
  currentType?: string;
  currentBusiness?: string;
  currentCategory?: string;
  currentTag?: string;
}

export function BlogFilters({ 
  categories, 
  tags,
  currentType,
  currentBusiness,
  currentCategory,
  currentTag,
}: BlogFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === '' || value === 'all') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    
    // typeが変更された場合、businessをリセット
    if (key === 'type' && value !== 'article') {
      params.delete('business');
    }
    
    const queryString = params.toString();
    router.push(`${pathname}${queryString ? `?${queryString}` : ''}`);
  };

  const typeOptions = [
    { value: 'all', label: 'すべて' },
    { value: 'article', label: 'お役立ち情報' },
    { value: 'press-release', label: 'プレスリリース' },
    { value: 'other', label: 'その他' },
  ];

  const businessOptions = [
    { value: 'all', label: 'すべての事業' },
    { value: 'translation', label: '翻訳' },
    { value: 'web-design', label: 'Web制作' },
    { value: 'print', label: '印刷物制作' },
    { value: 'nobilva', label: 'Nobilva（成績管理）' },
    { value: 'teachit', label: 'Teachit（AIに教えるアプリ）' },
  ];

  const categoryOptions = [
    { value: 'all', label: 'すべてのカテゴリー' },
    ...categories.map(cat => ({ value: cat, label: cat })),
  ];

  const tagOptions = [
    { value: 'all', label: 'すべてのタグ' },
    ...tags.map(tag => ({ value: tag, label: `#${tag}` })),
  ];

  return (
    <div className="space-y-6 mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 記事タイプフィルター */}
        <div>
          <Select
            options={typeOptions}
            value={currentType || 'all'}
            onChange={(e) => updateFilter('type', e.target.value)}
            className="w-full"
            placeholder="記事タイプを選択"
          />
        </div>

        {/* 事業フィルター（お役立ち情報の場合のみ表示） */}
        {(currentType === 'article' || !currentType) && (
          <div>
            <Select
              options={businessOptions}
              value={currentBusiness || 'all'}
              onChange={(e) => updateFilter('business', e.target.value)}
              className="w-full"
              placeholder="関連事業を選択"
            />
          </div>
        )}

        {/* カテゴリーフィルター */}
        <div>
          <Select
            options={categoryOptions}
            value={currentCategory || 'all'}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-full"
            placeholder="カテゴリーを選択"
          />
        </div>

        {/* タグフィルター */}
        <div>
          <Select
            options={tagOptions}
            value={currentTag || 'all'}
            onChange={(e) => updateFilter('tag', e.target.value)}
            className="w-full"
            placeholder="タグを選択"
          />
        </div>
      </div>

      {/* 現在のフィルター表示 */}
      {(currentType || currentBusiness || currentCategory || currentTag) && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">フィルター:</span>
          {currentType && (
            <span className="px-3 py-1 bg-primary text-white text-sm rounded-full">
              {typeOptions.find(o => o.value === currentType)?.label}
            </span>
          )}
          {currentBusiness && (
            <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full">
              {businessOptions.find(o => o.value === currentBusiness)?.label}
            </span>
          )}
          {currentCategory && (
            <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full">
              {currentCategory}
            </span>
          )}
          {currentTag && (
            <span className="px-3 py-1 bg-purple-500 text-white text-sm rounded-full">
              #{currentTag}
            </span>
          )}
          <button
            onClick={() => router.push(pathname)}
            className="text-sm text-gray-600 hover:text-gray-900 underline ml-2"
          >
            すべてクリア
          </button>
        </div>
      )}
    </div>
  );
}
