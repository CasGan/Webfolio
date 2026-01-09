import { useEffect } from "react";
import gsap from "gsap";
import useWindowStore from "#store/window";

export default function useWindowViewportSync() {
  const resetWindows = useWindowStore((s) => s.resetWindows);

  useEffect(() => {
    const handler = () => {
      resetWindows();
    };

    window.addEventListener("resize", handler);
    window.addEventListener("orientationchange", handler);

    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("orientationchange", handler);
    };
  }, [resetWindows]);
}
