import React from "react";
import Link from "next/link";

export interface CTABlockProps {
  type: "nobilva" | "teachit" | "translation" | "web-design" | "print";
  title?: string;
  description?: string;
  buttonText?: string;
  link?: string;
}

export function CTABlock({
  type,
  title,
  description,
  buttonText = "詳しく見る",
  link = "#",
}: CTABlockProps) {
  return (
    <div className={`cta-block cta-block-${type}`}>
      <div className="cta-block-inner">
        <div className="cta-block-icon">
          <svg
            className="cta-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="cta-block-content">
          {title && <h3 className="cta-block-title">{title}</h3>}
          {description && (
            <p className="cta-block-description">{description}</p>
          )}
          <Link href={link} className="cta-block-button">
            {buttonText}
            <svg
              className="cta-button-arrow"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
