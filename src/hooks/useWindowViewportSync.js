import { useEffect } from "react";
import useWindowStore from "#store/window";

export default function useWindowViewportSync() {
  const resetWindows = useWindowStore((s) => s.resetWindows);

  useEffect(() => {
    let timer;
    const handler = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        resetWindows();
      }, 100);
    };

    window.addEventListener("resize", handler);
    window.addEventListener("orientationchange", handler);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handler);
      window.removeEventListener("orientationchange", handler);
    };
  }, [resetWindows]);
}
