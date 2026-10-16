"use client";

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          <div className="relative w-20 h-20 mb-6">
            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <div
              className="absolute inset-2 border-4 border-primary/30 border-t-transparent rounded-full animate-spin"
              style={{ animationDirection: "reverse", animationDuration: "1s" }}
            ></div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {message || "処理中..."}
          </h3>
          <p className="text-gray-600 text-center text-sm">
            AIが最高の記事を作成しています。
            <br />
            少々お待ちください...
          </p>
        </div>
      </div>
    </div>
  );
}
