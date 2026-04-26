export function VideoSection() {
  return (
    <section className="bg-white py-24 px-6">
      <div className="max-w-3xl mx-auto">
        {/* 動画プレースホルダー */}
        <div className="aspect-video bg-okitegami-haze/40 rounded-3xl flex items-center justify-center border-2 border-dashed border-okitegami-haze">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-okitegami-sun/20 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-okitegami-sun" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
            <p className="text-okitegami-dusk/50 text-sm font-medium">紹介動画（準備中）</p>
          </div>
        </div>
      </div>
    </section>
  );
}
