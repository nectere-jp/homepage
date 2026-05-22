const cards = [
  {
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
    title: "30日全額返金保証",
    description: "入会から30日以内であれば全額返金。",
  },
  {
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    title: "入塾金：8,000円",
    description:
      "チーム申し込みの場合は4,000円。教材はメンターが推薦する市販の参考書・問題集をご家庭でご用意いただきます。",
  },
  {
    icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    title: "通塾・送迎：不要",
    description: "全てオンラインで完結します",
  },
];

export function SafetyCards({ className = "" }: { className?: string }) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${className}`.trim()}
    >
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-nobilva-light rounded-xl p-5 text-center flex flex-col items-center justify-center"
        >
          <div className="text-2xl mb-2">
            <svg
              className="w-8 h-8 mx-auto text-nobilva-accent"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={card.icon}
              />
            </svg>
          </div>
          <p className="font-bold text-gray-900 mb-1">{card.title}</p>
          <p className="text-xs text-gray-500">{card.description}</p>
        </div>
      ))}
    </div>
  );
}
