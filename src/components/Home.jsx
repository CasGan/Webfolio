import { locations } from "#constants";
import useLocationStore from "#store/location.js";
import useWindowStore from "#store/window.js";
import { useGSAP } from "@gsap/react";
import { Draggable } from "gsap/Draggable";
import { useRef, useEffect } from "react";
import gsap from "gsap";

gsap.registerPlugin(Draggable);

const MOBILE_QUERY = "(max-width: 640px)";

const Home = () => {
  const { openWindow } = useWindowStore();
  const { setActiveLocation } = useLocationStore();

  const projects = locations.work?.children ?? [];

  const projectsRef = useRef(projects);
  const openRef = useRef(null);

  const positionsRef = useRef(new Map());
  const draggablesRef = useRef([]);
  const isDesktopActiveRef = useRef(false);

  const handleOpenProject = (project) => {
    setActiveLocation(project);
    openWindow("finder");
  };
  const handleFolderClick = (project) => {
    const { windows, openWindow, closeWindow } = useWindowStore.getState();
    const windowKey = "finder"; // assuming all folders open the Finder window

    const isOpen = windows[windowKey]?.isOpen;

    if (isOpen && project.id === windows[windowKey]?.data?.id) {
      // If the same project is already open, close it
      closeWindow(windowKey);
    } else {
      // Otherwise, open the window with this project
      setActiveLocation(project);
      openWindow(windowKey, project);
    }
  };

  useEffect(() => {
    projectsRef.current = projects;
    openRef.current = handleOpenProject;
  }, [projects, handleOpenProject]);

  useGSAP(() => {
    const mql = window.matchMedia(MOBILE_QUERY);

    const killDesktop = () => {
      draggablesRef.current.forEach((d) => d.kill());
      draggablesRef.current = [];
      gsap.set(".folder", { clearProps: "transform" });
      isDesktopActiveRef.current = false;
    };

    const initDesktop = () => {
      const navbar = document.querySelector("nav");
      const navHeight = navbar?.offsetHeight ?? 25;

      const getBounds = () => ({
        top: navHeight,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight - navHeight,
      });

      const folders = gsap.utils.toArray(".folder");

      folders.forEach((el, index) => {
        const id = el.dataset.projectId;

        if (!positionsRef.current.has(id)) {
          const row = index % 6; // vertical stacking
          const col = Math.floor(index / 6);

          const x = 40 + col * 140;
          const y = navHeight + 40 + row * 120;

          positionsRef.current.set(id, { x, y });
        }

        const pos = positionsRef.current.get(id);

        // Apply position immediately
        gsap.set(el, pos);

        // Animate opacity + slight slide
        gsap.from(el, {
          opacity: 0,
          y: pos.y - 30, // start 30px above
          duration: 0.5,
          delay: index * 0.05,
          ease: "power2.out",
          overwrite: "auto",
          onComplete: () => {
            // Ensure final position stays correct
            gsap.set(el, pos);
          },
        });
      });

      draggablesRef.current = Draggable.create(".folder", {
        type: "x,y",
        bounds: getBounds(),
        edgeResistance: 0.65,
        dragClickThreshold: 5,

        onDrag() {
          this.applyBounds(getBounds());
        },

        onDragEnd() {
          const id = this.target.dataset.projectId;
          positionsRef.current.set(id, { x: this.x, y: this.y });
        },

        onClick() {
          const id = this.target.dataset.projectId;
          const project = projectsRef.current.find((p) => String(p.id) === id);
          if (project) openRef.current(project);
        },
      });

      isDesktopActiveRef.current = true;
    };

    // Start on mobile
    if (mql.matches) {
      killDesktop();
      return;
    }

    //  Initial desktop
    initDesktop();

    const handleResize = () => {
      const isMobile = window.matchMedia(MOBILE_QUERY).matches;

      if (isMobile && isDesktopActiveRef.current) {
        killDesktop();
        return;
      }

      if (!isMobile && !isDesktopActiveRef.current) {
        initDesktop();
        return;
      }

      // Recalculate bounds
      const navbar = document.querySelector("nav");
      const navHeight = navbar?.offsetHeight ?? 25;
      const bounds = {
        top: navHeight,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight - navHeight,
      };

      draggablesRef.current.forEach((d) => {
        const el = d.target;
        const saved = positionsRef.current.get(el.dataset.projectId);

        // If saved position is outside bounds, reset to default
        let x = saved?.x ?? 40;
        let y = saved?.y ?? navHeight + 40;

        if (x < bounds.left) x = bounds.left + 40;
        if (y < bounds.top) y = bounds.top + 40;
        if (x > bounds.width - el.offsetWidth)
          x = bounds.width - el.offsetWidth - 40;
        if (y > bounds.height - el.offsetHeight)
          y = bounds.height - el.offsetHeight - 40;

        // Apply corrected position
        gsap.set(el, { x, y });

        // Update draggable bounds
        d.applyBounds(bounds);

        // Save corrected position
        positionsRef.current.set(el.dataset.projectId, { x, y });

        d.update();
      });
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      killDesktop();
    };
  }, []);

  return (
    <section id="home">
      <ul className="folder-container project-list">
        {projects.map((project) => (
          <li
            key={project.id}
            className="folder"
            data-project-id={project.id}
            onClick={() => handleFolderClick(project)}
          >
            <img src="/images/folder.png" alt={project.name} />
            <p>{project.name}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Home;
