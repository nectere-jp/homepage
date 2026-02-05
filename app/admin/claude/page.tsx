'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClaudePage() {
  const router = useRouter();
  const [step, setStep] = useState<'topic' | 'keywords' | 'outline' | 'content'>('topic');
  const [loading, setLoading] = useState(false);
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [keywords, setKeywords] = useState<{
    primaryKeyword: string;
    secondaryKeywords: string[];
    reason: string;
  } | null>(null);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [outline, setOutline] = useState<any>(null);
  const [content, setContent] = useState('');

  const handleSuggestKeywords = async () => {
    if (!topic.trim()) {
      alert('トピックを入力してください');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/admin/claude/suggest-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, context }),
      });

      if (response.ok) {
        const data = await response.json();
        setKeywords(data.suggestion);
        setConflicts(data.conflicts);
        setStep('keywords');
      } else {
        alert('キーワード提案に失敗しました');
      }
    } catch (error) {
      console.error('Failed to suggest keywords:', error);
      alert('キーワード提案に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOutline = async () => {
    if (!keywords) return;

    setLoading(true);
    try {
      const allKeywords = [keywords.primaryKeyword, ...keywords.secondaryKeywords];
      const response = await fetch('/api/admin/claude/generate-outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, keywords: allKeywords, targetLength: 2000 }),
      });

      if (response.ok) {
        const data = await response.json();
        setOutline(data.outline);
        setStep('outline');
      } else {
        alert('アウトライン生成に失敗しました');
      }
    } catch (error) {
      console.error('Failed to generate outline:', error);
      alert('アウトライン生成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!keywords || !outline) return;

    setLoading(true);
    try {
      const allKeywords = [keywords.primaryKeyword, ...keywords.secondaryKeywords];
      const response = await fetch('/api/admin/claude/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, keywords: allKeywords, outline }),
      });

      if (response.ok) {
        const data = await response.json();
        setContent(data.content);
        setStep('content');
      } else {
        alert('本文生成に失敗しました');
      }
    } catch (error) {
      console.error('Failed to generate content:', error);
      alert('本文生成に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    if (!outline || !content || !keywords) return;

    // 記事作成ページに遷移（データを渡す）
    const postData = {
      title: outline.title,
      description: outline.introduction,
      category: '学習のコツ',
      primaryKeyword: keywords.primaryKeyword,
      secondaryKeywords: keywords.secondaryKeywords.join(', '),
      content,
    };

    // localStorageに保存して新規作成ページに遷移
    localStorage.setItem('claude_generated_post', JSON.stringify(postData));
    router.push('/admin/posts/new');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Claude AI 記事作成支援</h1>
        <p className="mt-2 text-gray-600">AIが記事のアウトラインと下書きを生成</p>
      </div>

      {/* プログレスバー */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {['トピック', 'キーワード', 'アウトライン', '本文'].map((label, index) => {
            const steps = ['topic', 'keywords', 'outline', 'content'];
            const currentIndex = steps.indexOf(step);
            const isActive = index <= currentIndex;

            return (
              <div key={label} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    isActive ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                <span className={`ml-2 font-medium ${isActive ? 'text-primary' : 'text-gray-600'}`}>
                  {label}
                </span>
                {index < 3 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      index < currentIndex ? 'bg-primary' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: トピック入力 */}
      {step === 'topic' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">ステップ 1: トピックを入力</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                記事のトピック *
              </label>
              <input
                type="text"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="例: 野球と勉強の両立、春から始める5つのコツ"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <div>
              <label htmlFor="context" className="block text-sm font-medium text-gray-700 mb-2">
                追加コンテキスト（任意）
              </label>
              <textarea
                id="context"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                rows={3}
                placeholder="例: 新学期が始まる時期に向けて、中高生アスリート向けの実践的なアドバイス"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            <button
              onClick={handleSuggestKeywords}
              disabled={loading}
              className="w-full px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'AIが分析中...' : '🤖 AIにキーワードを提案してもらう'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: キーワード確認 */}
      {step === 'keywords' && keywords && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">ステップ 2: キーワードを確認</h2>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-bold text-blue-900 mb-2">主要キーワード</h3>
              <p className="text-lg text-blue-800">{keywords.primaryKeyword}</p>
            </div>

            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-bold text-green-900 mb-2">関連キーワード</h3>
              <div className="flex flex-wrap gap-2">
                {keywords.secondaryKeywords.map((kw) => (
                  <span key={kw} className="px-3 py-1 bg-green-100 text-green-800 rounded-full">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h3 className="font-bold text-gray-900 mb-2">AIの説明</h3>
              <p className="text-gray-700">{keywords.reason}</p>
            </div>

            {conflicts.length > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h3 className="font-bold text-yellow-800 mb-2">⚠️ キーワード競合</h3>
                <ul className="space-y-1">
                  {conflicts.map((conflict) => (
                    <li key={conflict.keyword} className="text-sm text-yellow-700">
                      「{conflict.keyword}」は {conflict.articles.length} 件の記事で使用されています
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep('topic')}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                戻る
              </button>
              <button
                onClick={handleGenerateOutline}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'AI生成中...' : '🤖 アウトラインを生成'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: アウトライン確認 */}
      {step === 'outline' && outline && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">ステップ 3: アウトラインを確認</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-2">タイトル</h3>
              <p className="text-lg">{outline.title}</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">導入文</h3>
              <p className="text-gray-700">{outline.introduction}</p>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">セクション構成</h3>
              <div className="space-y-3">
                {outline.sections.map((section: any, index: number) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-2">{section.heading}</h4>
                    <ul className="space-y-1 ml-4">
                      {section.subheadings.map((sub: string, subIndex: number) => (
                        <li key={subIndex} className="text-sm text-gray-700">
                          • {sub}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-2">まとめ</h3>
              <p className="text-gray-700">{outline.conclusion}</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep('keywords')}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                戻る
              </button>
              <button
                onClick={handleGenerateContent}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'AI執筆中...' : '🤖 本文を生成'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: 本文確認 */}
      {step === 'content' && content && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">ステップ 4: 本文を確認</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-700 max-h-96 overflow-y-auto">
                {content}
              </pre>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ✅ 本文が生成されました！記事作成ページで最終調整してください。
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep('outline')}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                戻る
              </button>
              <button
                onClick={handleCreatePost}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                ✏️ 記事作成ページで編集
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
