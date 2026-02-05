import { 
  HiOutlineChatAlt2,
  HiOutlineCalendar,
  HiOutlineAcademicCap,
  IconType
} from 'react-icons/hi';

export interface ServiceIconMapping {
  chat?: IconType;
  tutoring?: IconType;
  consultation?: IconType;
  default?: IconType;
}

const defaultMapping: ServiceIconMapping = {
  chat: HiOutlineChatAlt2,
  tutoring: HiOutlineAcademicCap,
  consultation: HiOutlineCalendar,
  default: HiOutlineCalendar
};

/**
 * サービス名から適切なアイコンを選択する関数
 * @param serviceName サービス名
 * @param mapping カスタムアイコンマッピング（オプション）
 * @returns 対応するアイコンコンポーネント
 */
export function getServiceIcon(
  serviceName: string, 
  mapping: ServiceIconMapping = defaultMapping
): IconType {
  const normalizedName = serviceName.toLowerCase();
  
  if (normalizedName.includes('チャット') || normalizedName.includes('chat')) {
    return mapping.chat || defaultMapping.chat!;
  } else if (normalizedName.includes('個別指導') || normalizedName.includes('tutoring')) {
    return mapping.tutoring || defaultMapping.tutoring!;
  } else if (normalizedName.includes('面談') || normalizedName.includes('consultation')) {
    return mapping.consultation || defaultMapping.consultation!;
  }
  
  // デフォルトはカレンダーアイコン
  return mapping.default || defaultMapping.default!;
}
