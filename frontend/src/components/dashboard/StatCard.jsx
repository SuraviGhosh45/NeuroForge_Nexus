const StatCard = ({ label, value, sublabel }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-sm font-medium text-[#64748B]">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-[#172033]">{value}</p>
    <p className="mt-1 text-xs text-[#64748B]">{sublabel}</p>
  </div>
);

export default StatCard;