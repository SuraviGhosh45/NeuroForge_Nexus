const StatCard = ({ label, value, sublabel }) => (
  <div className="rounded-lg border border-[#e8eef8]/10 bg-[#0d1a2b] p-4">
    <p className="text-sm text-[#e8eef8]/60">{label}</p>
    <p className="mt-1 text-2xl font-semibold text-[#e8eef8]">{value}</p>
    <p className="mt-1 text-xs text-[#e8eef8]/40">{sublabel}</p>
  </div>
);

export default StatCard;