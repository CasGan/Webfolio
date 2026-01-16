import { useEffect } from "react";
import useWindowStore from "#store/window";
import { debounce } from "#store/window";

export default function useWindowViewportSync() {
  const updateMobileState = useWindowStore((s) => s.updateMobileState);
  const resetWindows = useWindowStore((s) => s.resetWindows);

  useEffect(() => {
    // Handler that updates mobile state and resets windows
    const handleResize = debounce(() => {
      updateMobileState(); // keep isMobile accurate
      resetWindows();      // reposition windows if needed
    }, 100);

    // Listen to resize and orientation changes
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    // Initial sync in case the app loads on mobile/resized viewport
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      handleResize.cancel(); 
    };
  }, [updateMobileState, resetWindows]);
}
