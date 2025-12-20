import { Download, AlertTriangle } from "lucide-react";
import { useState } from "react";

const ResumeDownload = ({ disabled, filePath }) => {
  const [showError, setShowError] = useState(false);

  const handleClick = () => {
    if (disabled) {
      setShowError(true);
      setTimeout(() => setShowError(false), 1600);
      return;
    }
    const link = document.createElement("a");
    link.href = filePath;
    link.download = ""; 
    document.body.appendChild(link);
    link.click(); 
    document.body.removeChild(link);
  };

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        className={`icon ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
        } ${showError ? "shake" : ""}`}
        title={disabled ? "Resume unavailable" : "Download resume"}
      >
        {showError ? (
          <AlertTriangle className="w-4 h-4 text-red-500" />
        ) : (
          <Download className="w-4 h-4" />
        )}
      </button>

      {showError && <div className="download-tooltip">Unable to download</div>}
    </div>
  );
};

export default ResumeDownload;
