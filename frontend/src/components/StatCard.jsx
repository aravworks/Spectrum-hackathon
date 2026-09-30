import { ArrowUpRight } from "lucide-react";

function StatCard({
  label,
  value,
  unit = "",
  change,
  description,
  icon: Icon,
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-top">
        <span>{label}</span>

        {Icon && (
          <div className="stat-card-icon">
            <Icon size={18} />
          </div>
        )}
      </div>

      <div className="stat-value">
        {value}
        {unit && <small>{unit}</small>}
      </div>

      {change !== undefined && (
        <div className="stat-change">
          <ArrowUpRight size={14} />
          {change}
        </div>
      )}

      {description && (
        <p>{description}</p>
      )}
    </div>
  );
}

export default StatCard;