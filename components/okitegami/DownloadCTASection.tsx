export function DownloadCTASection() {
  return (
    <section className="bg-okitegami-sun py-24 px-6 text-center">
      <div className="max-w-xl mx-auto space-y-8">
        <p className="text-2xl md:text-3xl font-black text-white leading-relaxed">
          あなたの言葉を、街に置いていこう。
        </p>

        <a
          href="https://apps.apple.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-white text-okitegami-dusk rounded-full px-8 py-4 text-lg font-semibold hover:bg-okitegami-paper transition-all hover:scale-105 shadow-lg"
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.278.8-3.157.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          App Storeでダウンロード
        </a>

        <p className="text-white/70 text-sm">無料 · iPhone対応</p>
      </div>
    </section>
  );
}
