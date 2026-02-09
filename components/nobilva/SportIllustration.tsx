interface SportIllustrationProps {
  currentSport: string;
  sportFileName: string | undefined;
  imageError: Record<string, boolean>;
  handleImageError: (sport: string) => void;
  heroImageAlt: string;
  size?: "small" | "large";
}

export function SportIllustration({
  currentSport,
  sportFileName,
  imageError,
  handleImageError,
  heroImageAlt,
  size = "large",
}: SportIllustrationProps) {
  const sizeClasses =
    size === "large"
      ? "hidden lg:flex flex-shrink-0 w-[280px] xl:w-[400px] 2xl:w-[500px]"
      : "flex md:flex lg:hidden flex-shrink-0 w-[200px] md:w-[240px]";
  const maxWidthClasses =
    size === "large"
      ? "max-w-[280px] xl:max-w-[400px] 2xl:max-w-[500px]"
      : "max-w-[200px] md:max-w-[240px]";
  const backgroundClasses =
    size === "large"
      ? "bg-white/50"
      : "bg-white/50 md:bg-white";

  return (
    <div className={`${sizeClasses} items-center justify-center`}>
      <div className={`relative w-full ${maxWidthClasses} aspect-square`}>
        <div
          key={currentSport}
          className="absolute inset-0 w-full h-full flex items-center justify-center sport-image-enter"
        >
          {/* 円形の半透明の白い背景 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`w-[80%] h-[80%] ${backgroundClasses} rounded-full`}></div>
          </div>
          {/* 画像 */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            {!sportFileName || imageError[currentSport] ? (
              <div className="w-full h-full bg-nobilva-main/10 rounded-lg flex items-center justify-center text-nobilva-accent text-2xl md:text-3xl 2xl:text-4xl font-bold">
                {currentSport}
              </div>
            ) : (
              <img
                src={`/images/nobilva/sports/${sportFileName}.svg`}
                alt={`${currentSport}${heroImageAlt}`}
                className="w-full h-full object-contain"
                onError={() => handleImageError(currentSport)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
