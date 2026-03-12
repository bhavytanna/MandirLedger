export default function Card({ title, children, footer, accent }) {
  // accent: 'amber' | 'green' | 'rose' | 'blue' | undefined
  const accentBorder = {
    amber: 'border-t-amber-400',
    green: 'border-t-green-400',
    rose:  'border-t-rose-400',
    blue:  'border-t-blue-400',
  }[accent] || 'border-t-amber-400/0';

  return (
    <div className={`
      bg-white/90 dark:bg-[#1a1232]/80
      border border-amber-100/70 dark:border-amber-900/25
      rounded-2xl shadow-card dark:shadow-card-dark
      backdrop-blur-sm text-gray-900 dark:text-gray-100
      overflow-hidden transition-all duration-200
      ${accent ? `border-t-2 ${accentBorder}` : ''}
    `}>
      {title ? (
        <div className="px-5 py-3.5 border-b border-amber-100/70 dark:border-amber-900/25 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-200 tracking-wide">{title}</h2>
        </div>
      ) : null}
      <div className="p-5">{children}</div>
      {footer ? (
        <div className="px-5 py-3.5 border-t border-amber-100/70 dark:border-amber-900/25 bg-amber-50/40 dark:bg-amber-900/10">
          {footer}
        </div>
      ) : null}
    </div>
  );
}
