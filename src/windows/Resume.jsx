import { useEffect, useRef, useState } from "react";
import { WindowControls } from "#components/index.js";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import ResumeDownload from "#components/ResumeDownload.jsx";
import { debounce } from "#store/window";
import { AlertCircle, Loader, RotateCcw, Plus, Minus } from "lucide-react";
import { pdfjs, Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const PDF_PATH = "/files/resume.pdf";

// Zoom constants (hard-capped for performance)
const ZOOM_MIN = 0.95;
const ZOOM_MAX = 2.25;
const ZOOM_STEP = 0.15;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

const Resume = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Base width = fit-to-window width (NOT zoomed width)
  const [pageWidth, setPageWidth] = useState(620);

  // Zoom level (true PDF zoom)
  const [zoom, setZoom] = useState(1);

  const containerRef = useRef();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const computeWidth = () => {
      const w = el.clientWidth;
      
      const next = w > 0 ? Math.min(w * 0.92, 620) : 620;
      setPageWidth((prev) => (prev === next ? prev : next));
    };

    const debouncedCompute = debounce(computeWidth, 100);

    const ro = new ResizeObserver(debouncedCompute);
    ro.observe(el);

    computeWidth();
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
    setLoadError("Failed to load resume. Please try downloading it instead.");
  };

  // Pointer-agnostic zoom handlers
  const zoomIn = () => setZoom((z) => clamp(z + ZOOM_STEP, ZOOM_MIN, ZOOM_MAX));

  const zoomOut = () =>
    setZoom((z) => clamp(z - ZOOM_STEP, ZOOM_MIN, ZOOM_MAX));

  const resetZoom = () => setZoom(1);

  return (
    <>
      <div id="window-header">
        <WindowControls target="resume" />
        <h2 className="font-medium text-sm text-gray-500">Resume.pdf</h2>

        {/* Zoom controls (buttons are additive, not required for gestures) */}
       <div className="zoom-controls">
  <button className="zoom-btn" onPointerDown={zoomOut}>
    <Minus className="w-4 h-4" />
  </button>

  <span className="zoom-value">
    {Math.round(zoom * 100)}%
  </span>

  <button className="zoom-btn" onPointerDown={zoomIn}>
    <Plus className="w-4 h-4" />
  </button>

  <button
    className="zoom-btn reset"
    onPointerDown={resetZoom}
    aria-label="Reset zoom"
  >
    <RotateCcw className="w-4 h-4" />
  </button>
</div>


        <ResumeDownload
          disabled={false}
          filePath={PDF_PATH}
          fileName="resume.pdf"
        />
      </div>

      <div className="window-content overflow-y-auto">
        {/* Scrollable viewport (panning happens here) */}
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

          {/* Stage grows as zoom increases */}
          <div className="mx-auto" style={{ width: pageWidth * zoom }}>
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
                scale={zoom}
                renderTextLayer
                renderAnnotationLayer
              />
            </Document>
          </div>
        </div>
      </div>
    </>
  );
};

const ResumeWindow = WindowWrapper(Resume, "resume");

export default ResumeWindow;
