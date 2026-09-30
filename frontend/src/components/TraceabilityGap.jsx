import { AlertTriangle, ArrowRight } from "lucide-react";

function TraceabilityGap({
  title = "Traceability Gap",
  description = "The next lifecycle stage could not be verified from available data.",
  stage = "End of Life",
}) {
  return (
    <div className="traceability-gap">
      <div className="gap-icon">
        <AlertTriangle size={18} />
      </div>

      <div className="gap-content">
        <div className="gap-heading">
          <strong>{title}</strong>

          <span>
            {stage}
            <ArrowRight size={12} />
          </span>
        </div>

        <p>{description}</p>

        <small>
          Information unavailable — not a confirmation of
          illegal disposal.
        </small>
      </div>
    </div>
  );
}

export default TraceabilityGap;