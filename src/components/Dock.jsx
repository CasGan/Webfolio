import { dockApps } from "#constants";
import useWindowStore from "#store/window";
import { Tooltip } from "react-tooltip";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const ANIMATION = {
  DISTANCE_EXPONENT: 2.75,
  FALLOFF_DIVISOR: 20000,
  SCALE_MULTIPLIER: 0.25,
  Y_OFFSET: -15,
  MAX_Z: 1000,
  HOVER_DURATION: 0.2,
  RESET_DURATION: 0.25,
  TAP_SCALE: 1.15,
};

const isTouch =
  typeof window !== "undefined" &&
  window.matchMedia("(pointer: coarse)").matches;

const Dock = () => {
  const dockRef = useRef(null);
  const { openWindow, closeWindow, windows } = useWindowStore();

  useGSAP(() => {
    const dock = dockRef.current;
    if (!dock) return;

    const icons = dock.querySelectorAll(".dock-icon");

    const resetIcons = () => {
      icons.forEach((icon) =>
        gsap.to(icon, {
          scale: 1,
          y: 0,
          zIndex: 0,
          duration: ANIMATION.RESET_DURATION,
          ease: "power1.out",
        })
      );
    };

    const handlePointerMove = (e) => {
      if (e.pointerType !== "mouse") return;
      const rect = dock.getBoundingClientRect();

      icons.forEach((icon) => {
        const r = icon.getBoundingClientRect();
        const center = r.left - rect.left + r.width / 2;
        const dist = Math.abs(e.clientX - rect.left - center);
        const intensity = Math.exp(
          -(dist ** ANIMATION.DISTANCE_EXPONENT) /
            ANIMATION.FALLOFF_DIVISOR
        );

        gsap.to(icon, {
          scale: 1 + ANIMATION.SCALE_MULTIPLIER * intensity,
          y: ANIMATION.Y_OFFSET * intensity,
          zIndex: Math.round(ANIMATION.MAX_Z * intensity),
          duration: ANIMATION.HOVER_DURATION,
        });
      });
    };

    dock.addEventListener("pointermove", handlePointerMove);
    dock.addEventListener("pointerleave", resetIcons);
    dock.addEventListener("pointerup", resetIcons);

    return () => {
      dock.removeEventListener("pointermove", handlePointerMove);
      dock.removeEventListener("pointerleave", resetIcons);
      dock.removeEventListener("pointerup", resetIcons);
    };
  }, []);

  const toggleApp = (id) => {
    const win = windows[id];
    if (!win) return;
    win.isOpen ? closeWindow(id) : openWindow(id);
  };

  return (
    <section id="dock">
      <div
        ref={dockRef}
        className="dock-container"
        role="toolbar"
      >
        {dockApps.map(({ id, name, icon, canOpen }) => (
          <button
            key={id}
            className="dock-icon data-draggable"
            disabled={!canOpen}
            aria-label={name}
            touch-action="manipulation"
            {...(!isTouch && {
              "data-tooltip-id": "dock-tooltip",
              "data-tooltip-content": name,
            })}
            onPointerDown={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (e.pointerType === "touch") {
                gsap.to(e.currentTarget, {
                  scale: ANIMATION.TAP_SCALE,
                  duration: 0.15,
                });
              }
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              e.stopPropagation();

              if (e.pointerType === "touch") {
                gsap.to(e.currentTarget, {
                  scale: 1,
                  duration: 0.2,
                });
              }

              toggleApp(id);
            }}
          >
            <img
              src={`/images/${icon}`}
              alt=""
              draggable={false}
            />

            {/* ✅ Mobile-visible label */}
            {isTouch && (
              <span className="sr-only">{name}</span>
            )}
          </button>
        ))}
      </div>

      {!isTouch && (
        <Tooltip
          id="dock-tooltip"
          place="top"
          className="tooltip"
        />
      )}
    </section>
  );
};

export default Dock;
