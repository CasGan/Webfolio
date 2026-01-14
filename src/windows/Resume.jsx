import { useEffect, useRef, useState } from "react";
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

// Simple debounce helper
const debounce = (fn, delay = 100) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

const Resume = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [pageWidth, setPageWidth] = useState(620); // sensible default

  const containerRef = useRef();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Compute page width based on container size
    const computeWidth = () => {
      const w = el.clientWidth;
      const next = w > 0 ? Math.min(w * 0.92, 620) : 620;
      setPageWidth((prev) => (prev === next ? prev : next));
    };

    const debouncedCompute = debounce(computeWidth, 100);

    // Observe size changes
    const ro = new ResizeObserver(debouncedCompute);
    ro.observe(el);

    // Initial measurement
    computeWidth();

    // Fallback: listen to window resize
    window.addEventListener("resize", debouncedCompute);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", debouncedCompute);
    };
  }, []);

  const handleLoadSuccess = () => {
    setIsLoading(false);
    setLoadError(null);
  };

  const handleLoadError = (err) => {
    console.error("Failed to load PDF:", err);
    setIsLoading(false);
    setLoadError(
      "Failed to load resume. Please try downloading it instead."
    );
  };

  return (
    <>
      <div id="window-header">
        <WindowControls target="resume" />
        <h2 className="font-medium text-sm text-gray-500">Resume.pdf</h2>
        <ResumeDownload
          disabled={false}
          filePath={PDF_PATH}
          fileName="resume.pdf"
        />
      </div>

      <div className="window-content">
        <div className="resume-content p-4 bg-gray-50" ref={containerRef}>
          {isLoading && !loadError && (
            <div className="pdf-state pdf-loading">
              <Loader className="animate-spin" />
              <p>Loading resume…</p>
            </div>
          )}

          {loadError && (
            <div className="pdf-state pdf-error">
              <AlertCircle />
              <p>{loadError}</p>
            </div>
          )}

          <Document
            file={PDF_PATH}
            onLoadSuccess={handleLoadSuccess}
            onLoadError={handleLoadError}
            loading={null}
            error={null}
          >
            <Page
              pageNumber={1}
              width={pageWidth}
              scale={1.75}
              renderTextLayer
              renderAnnotationLayer
            />
          </Document>
        </div>
      </div>
    </>
  );
};

const ResumeWindow = WindowWrapper(Resume, "resume");

export default ResumeWindow;
