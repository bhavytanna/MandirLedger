export default function Input({ label, ...props }) {
  return (
    <label className="block group">
      <div className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1.5 tracking-wide uppercase">
        {label}
      </div>
      <input
        {...props}
        className="
          w-full rounded-xl border-2 px-4 py-2.5 text-sm
          bg-white dark:bg-[#1a1232]/80
          border-amber-100 dark:border-amber-900/30
          text-gray-800 dark:text-gray-100
          placeholder:text-gray-400 dark:placeholder:text-gray-500
          focus:outline-none focus:border-amber-400 dark:focus:border-amber-500
          focus:ring-4 focus:ring-amber-400/15 dark:focus:ring-amber-400/10
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      />
    </label>
  );
}
