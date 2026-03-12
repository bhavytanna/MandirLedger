export default function Pagination({ page, pages, onPage }) {
  return (
    <div className="flex items-center justify-between mt-4 pt-3 border-t border-amber-100/60 dark:border-amber-900/20">
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Page <span className="font-semibold text-amber-600 dark:text-amber-400">{page}</span> of{' '}
        <span className="font-semibold">{pages}</span>
      </div>
      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
            border border-amber-200 dark:border-amber-800/40
            text-amber-700 dark:text-amber-400
            bg-white dark:bg-amber-900/10
            hover:bg-amber-50 dark:hover:bg-amber-900/20
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-150
          "
        >
          <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
            <path fillRule="evenodd" d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
          </svg>
          Prev
        </button>
        <button
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="
            flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
            border border-amber-200 dark:border-amber-800/40
            text-amber-700 dark:text-amber-400
            bg-white dark:bg-amber-900/10
            hover:bg-amber-50 dark:hover:bg-amber-900/20
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-150
          "
        >
          Next
          <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor">
            <path fillRule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
