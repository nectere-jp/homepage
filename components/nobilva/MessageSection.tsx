import { Section } from "@/components/layout/Section";
import { Container } from "@/components/layout/Container";
import { ScrollReveal } from "@/components/animations/ScrollReveal";
import { highlightText } from "@/utils/textHighlight";
import { addSoftBreaks } from "@/utils/softBreak";

interface HighlightConfig {
  text: string;
  color?: string;
}

interface MessageSectionProps {
  title: string;
  subtitle: string;
  description: string;
  titleHighlight?: HighlightConfig | null;
  subtitleHighlight?: HighlightConfig | null;
  descriptionHighlight?: HighlightConfig | null;
}

export function MessageSection({
  title,
  subtitle,
  description,
  titleHighlight,
  subtitleHighlight,
  descriptionHighlight,
}: MessageSectionProps) {
  // タイトルをハイライト付きでレンダリング
  const renderTitle = () => {
    if (titleHighlight) {
      return highlightText(title, titleHighlight);
    }
    return title;
  };

  // サブタイトルをハイライト付きでレンダリング
  const renderSubtitle = () => {
    return highlightText(subtitle, subtitleHighlight);
  };

  // 説明文をハイライト付きでレンダリング
  const renderDescription = () => {
    const highlighted = highlightText(description, descriptionHighlight);
    return addSoftBreaks(highlighted);
  };

  return (
    <Section
      backgroundColor="transparent"
      className="bg-white pt-20 md:pt-24 pb-10 md:pb-16"
      padding="none"
    >
      <Container>
        <ScrollReveal>
          <div className="text-center max-w-5xl mx-auto">
            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black mb-8 tracking-tighter transform -skew-x-6 inline-block leading-tight">
              <span className="text-black whitespace-pre-line">
                {renderTitle()}
              </span>
            </h2>
            <p className="text-lg md:text-xl lg:text-2xl text-black mt-6 md:mt-8 whitespace-pre-line leading-relaxed">
              {renderSubtitle()}
            </p>
            <p
              className="text-sm md:text-base lg:text-lg text-black font-light mt-6 md:mt-8 whitespace-pre-line leading-relaxed max-w-4xl mx-auto"
              style={{ wordBreak: "keep-all", overflowWrap: "normal" }}
            >
              {renderDescription()}
            </p>
          </div>
        </ScrollReveal>
      </Container>
    </Section>
  );
}
