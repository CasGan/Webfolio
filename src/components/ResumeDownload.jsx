import { useId, useState } from "react";
import { Download } from "lucide-react";

const isSafeFilePath = (path) => {
  return (
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//")
  );
};

const ResumeDownload = ({
  disabled,
  filePath,
  fileName = "Resume.pdf",
}) => {
  const tooltipId = useId();
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    if (disabled || !isSafeFilePath(filePath)) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 1500);
      return;
    }

    try {
      const link = document.createElement("a");
      link.href = filePath;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 1500);
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={handleClick}
        disabled={false}
        aria-label={
          disabled
            ? "Resume download unavailable"
            : "Download resume as PDF"
        }
        aria-describedby={showTooltip ? tooltipId : undefined}
        className={`icon ${
          disabled
            ? "opacity-50 cursor-not-allowed"
            : ""
        }`}
      >
        <Download className="w-4 h-4" />
      </button>

      {showTooltip && (
        <div
          id={tooltipId}
          role="status"
          aria-live="polite"
          className="download-tooltip"
        >
          Download unavailable
        </div>
      )}
    </div>
  );
};

export default ResumeDownload;
