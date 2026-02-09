/**
 * LineQRCode - LINE QRコード表示コンポーネント
 * 
 * LINE友だち追加用のQRコードを表示する
 */

import Image from "next/image";

interface LineQRCodeProps {
  size?: "small" | "medium" | "large";
}

export function LineQRCode({ size = "medium" }: LineQRCodeProps) {
  // サイズに応じたクラスを設定
  const sizeClasses = {
    small: "w-32 h-32",
    medium: "w-32 h-32 md:w-40 md:h-40",
    large: "w-40 h-40 md:w-48 md:h-48",
  };

  return (
    <div className="flex-shrink-0">
      <div
        className={`bg-white p-2 rounded-lg ${sizeClasses[size]} flex items-center justify-center border-2 border-green-500`}
      >
        <Image
          src="/images/nobilva/line-qr.png"
          alt="LINE QR Code"
          width={160}
          height={160}
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
