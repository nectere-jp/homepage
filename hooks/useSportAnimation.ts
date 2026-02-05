import { useState, useEffect } from 'react';

const sportToFileName: Record<string, string> = {
  // Japanese
  '野球': 'baseball',
  'サッカー': 'soccer',
  'バスケ': 'basketball',
  'テニス': 'tennis',
  // English
  'Baseball': 'baseball',
  'Soccer': 'soccer',
  'Basketball': 'basketball',
  'Tennis': 'tennis',
  // German
  'Fußball': 'soccer',
};

export function useSportAnimation(sports: string[]) {
  const [currentSportIndex, setCurrentSportIndex] = useState(0);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (sports.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentSportIndex((prev) => (prev + 1) % sports.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [sports.length]);

  const currentSport = sports[currentSportIndex] || '';
  const sportFileName = sportToFileName[currentSport] || '';

  // スポーツが変わったときに画像エラー状態をリセット
  useEffect(() => {
    setImageError((prev) => {
      const newState = { ...prev };
      delete newState[currentSport];
      return newState;
    });
  }, [currentSport]);

  const handleImageError = (sport: string) => {
    setImageError((prev) => ({
      ...prev,
      [sport]: true,
    }));
  };

  return {
    currentSport,
    sportFileName,
    imageError,
    handleImageError,
  };
}
