import { useState } from "react";
import { WindowControls } from "#components/index.js";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import ResumeDownload from "#components/ResumeDownload.jsx";
import { AlertCircle, Loader } from "lucide-react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const PDF_PATH = "/files/resume.pdf";

const Resume = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLoadSuccess = () => {
    setIsLoading(false);
    setError(null);
  };

  const handleLoadError = (err) => {
    console.error("Failed to load PDF:", err);
    setIsLoading(false);
    setError("Failed to load resume. Please try downloading it instead.");
  };

  return (
    <>
      <div id="window-header">
        <WindowControls target="resume" />
        <h2>Resume.pdf</h2>

        <ResumeDownload
          disabled={Boolean(error)}
          filePath={PDF_PATH}
          fileName="resume.pdf"
        />
      </div>
      <div className="resume-content">
        {/* Loading State */}
        {isLoading && !error && (
          <div className="pdf-state pdf-loading">
            <Loader className="animate-spin" />
            <p>Loading resume…</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="pdf-state pdf-error">
            <AlertCircle />
            <p>{error}</p>
          </div>
        )}

        {/* PDF Viewer */}
        {!error && (
          <Document
            file={PDF_PATH}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleLoadError}
            loading={null} // disables default react-pdf loader
            error={null} // disables default react-pdf error UI
          >
            <Page pageNumber={1} renderTextLayer renderAnnotationLayer />
          </Document>
        )}
      </div>
    </>
  );
};

const ResumeWindow = WindowWrapper(Resume, "resume");

export default ResumeWindow;
