export default function Alert({ type = 'error', message }) {
  if (!message) return null;

  const isSuccess = type === 'success';

  const styles = isSuccess
    ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800/40 dark:bg-green-900/20 dark:text-green-300'
    : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-300';

  const icon = isSuccess ? (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" className="shrink-0 mt-0.5">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" className="shrink-0 mt-0.5">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className={`flex items-start gap-2.5 border rounded-xl px-4 py-3 text-sm font-medium ${styles}`}>
      {icon}
      <span>{message}</span>
    </div>
  );
}
