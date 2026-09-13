import type { SocialLink, SocialLinkType } from "@/lib/blog";

const noteBrandColor = "#41C9B4";
const instagramBrandColor = "#E4405F";
const websiteBrandColor = "#4B5563";

function iconFor(type: SocialLinkType) {
  switch (type) {
    case "note":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-4 h-4">
          <path d="M4.75 3h14.5A1.75 1.75 0 0 1 21 4.75v14.5A1.75 1.75 0 0 1 19.25 21H4.75A1.75 1.75 0 0 1 3 19.25V4.75A1.75 1.75 0 0 1 4.75 3Zm.7 3.05v11.9h2.4v-6.7l4.6 6.7h2.4V6.05h-2.4v6.7l-4.6-6.7h-2.4Zm11.5 0v11.9h2.4V6.05h-2.4Z" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true" className="w-4 h-4">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "x":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-4 h-4">
          <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.828l-5.34-6.98L4.6 22H1.34l8.03-9.18L1 2h6.914l4.83 6.38L18.244 2Zm-1.2 18h1.874L7.06 4H5.06l11.984 16Z" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="w-4 h-4">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2C0 8 0 12 0 12s0 4 .5 5.8a3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 16 24 12 24 12s0-4-.5-5.8ZM9.6 15.6V8.4L15.8 12l-6.2 3.6Z" />
        </svg>
      );
    case "website":
    case "other":
    default:
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden="true" className="w-4 h-4">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18" />
        </svg>
      );
  }
}

function colorFor(type: SocialLinkType) {
  switch (type) {
    case "note":
      return noteBrandColor;
    case "instagram":
      return instagramBrandColor;
    default:
      return websiteBrandColor;
  }
}

export function AuthorSocialLinks({
  links,
  size = "sm",
  className = "",
}: {
  links: SocialLink[];
  size?: "sm" | "md";
  className?: string;
}) {
  if (!links || links.length === 0) return null;
  const padding = size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs";

  return (
    <div className={`flex flex-wrap gap-2 ${className}`.trim()}>
      {links.map((link) => (
        <a
          key={link.url}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-colors ${padding}`}
          style={{ color: colorFor(link.type) }}
          aria-label={`${link.label}（新しいタブで開く）`}
        >
          {iconFor(link.type)}
          <span className="font-medium">{link.label}</span>
        </a>
      ))}
    </div>
  );
}
