export default function Table({ columns, rows, rowKey }) {
  return (
    <div className="overflow-auto rounded-xl border border-amber-100/70 dark:border-amber-900/25 shadow-sm">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10">
            {columns.map((c) => (
              <th
                key={c.key}
                className="text-left px-4 py-3 font-semibold text-amber-800 dark:text-amber-300
                           text-xs uppercase tracking-wider whitespace-nowrap
                           border-b border-amber-100/70 dark:border-amber-900/25"
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white/90 dark:bg-[#1a1232]/70 divide-y divide-amber-50 dark:divide-amber-900/15">
          {rows.map((r, i) => (
            <tr
              key={rowKey(r)}
              className={`
                transition-colors duration-150
                hover:bg-amber-50/60 dark:hover:bg-amber-900/10
                ${i % 2 === 0 ? '' : 'bg-amber-50/25 dark:bg-amber-900/5'}
              `}
            >
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3 whitespace-nowrap text-gray-800 dark:text-gray-200">
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-400 dark:text-gray-500 text-sm">
                <div className="flex flex-col items-center gap-2">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-30">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  No records found
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
