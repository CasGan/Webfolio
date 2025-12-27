import { locations } from "#constants";
import useLocationStore from "#store/location.js";
import useWindowStore from "#store/window.js";
import { useGSAP } from "@gsap/react";
import clsx from "clsx";
import { Draggable } from "gsap/Draggable";
import { useRef, useEffect } from "react";

const Home = () => {
  const { openWindow } = useWindowStore();
  const { setActiveLocation } = useLocationStore();

  const projects = locations.work?.children ?? [];

  const handleOpenProjectFinder = (project) => {
    setActiveLocation(project);
    openWindow("finder");
  };

  const projectsRef = useRef(projects);
  const handleOpenRef = useRef(handleOpenProjectFinder);

  const draggablesRef = useRef([]);
  const positionsRef = useRef({});

  useEffect(() => {
    projectsRef.current = projects;
    handleOpenRef.current = handleOpenProjectFinder;
  });

  useGSAP(() => {
    const navbar = document.querySelector("nav");
    const navHeight = navbar ? navbar.offsetHeight : 25;

    const updateBounds = () => ({
      top: navHeight,
      left: 0,
      width: window.innerWidth,
      height: window.innerHeight - navHeight,
    });

    // Only store positions once, after mount
    const folderEls = document.querySelectorAll(".folder");
    folderEls.forEach((el) => {
      positionsRef.current[el.dataset.projectId] = {
        x: el.offsetLeft,
        y: el.offsetTop,
      };
    });

    const draggables = Draggable.create(".folder", {
      type: "x, y",
      bounds: updateBounds(),
      edgeResistance: 0.65,
      dragClickThreshold: 5,
      onClick: function () {
        const li = this.target.closest("li");
        if (!li) return;
        const projectId = li.dataset.projectId;
        const project = projectsRef.current.find((p) => p.id == projectId);
        if (project) handleOpenRef.current(project);
      },
    });

    draggablesRef.current = draggables;

    const handleResize = () => {
      const bounds = updateBounds();

      draggablesRef.current.forEach((d) => {
        const li = d.target;

        if (window.innerWidth < 640) {
          // Small screen: hide folders (Tailwind does this) and disable dragging
          d.disable();
        } else {
          // Large screen: restore positions and enable dragging
          d.enable();
          d.applyBounds(bounds);

          const pos = positionsRef.current[li.dataset.projectId];
          if (pos) {
            d.x = pos.x;
            d.y = pos.y;
            d.update();
          }
        }
      });
    };

    // Initial call
    if (window.innerWidth >= 640) {
      handleResize();
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      draggablesRef.current.forEach((d) => d.kill());
    };
  }, []);

  return (
    <section id="home">
      <ul className="project-list">
        {projects.map((project) => (
          <li
            key={project.id}
            className={clsx("group folder", project.windowPosition)}
            data-project-id={project.id}
          >
            <div className="folder-inner">
              <img src="/images/folder.png" alt={project.name} />
              <p>{project.name}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Home;
