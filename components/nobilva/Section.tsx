interface SectionProps {
  children: React.ReactNode;
  bg?: "white" | "light";
  id?: string;
  className?: string;
}

const bgMap = {
  white: "bg-white",
  light: "bg-nobilva-light",
};

export function Section({
  children,
  bg = "white",
  id,
  className = "",
}: SectionProps) {
  return (
    <section
      id={id}
      className={`${bgMap[bg]} py-16 md:py-24 ${className}`.trim()}
    >
      <div className="max-w-6xl mx-auto px-6 md:px-12 lg:px-16">
        {children}
      </div>
    </section>
  );
}
