const StatCard = ({ label, value, sublabel }) => (
  <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-[#1e293b] p-4 shadow-xs dark:shadow-md transition-colors">
    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{value}</p>
    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{sublabel}</p>
  </div>
);

export default StatCard;