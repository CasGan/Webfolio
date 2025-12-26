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

    const draggables = Draggable.create(".folder", {
      type: "x, y",
      bounds: updateBounds(),
      edgeResistance: 0.65,
      dragClickThreshold: 5,
      
      onClick: function () {
        // Ensure we get the <li> even if user clicks img or p inside
        const li = this.target.closest("li");
        if (!li) return;

        const projectId = li.dataset.projectId;
        const project = projectsRef.current.find((p) => p.id == projectId); // allow number/string match
        if (project) handleOpenRef.current(project);
      },
    });

    const handleResize = () => {
      draggables.forEach((d) => {
        draggables.forEach((d) => d.applyBounds(updateBounds()));
      });
    };

    window.addEventListener("resize", handleResize);

    // cleanup when component unmounts
    return () => {
      window.removeEventListener("resize", handleResize);
      draggables.forEach((draggable) => draggable.kill());
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
