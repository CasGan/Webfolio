import { locations } from "#constants";
import useLocationStore from "#store/location.js";
import useWindowStore from "#store/window.js";
import { useGSAP } from "@gsap/react";
import clsx from "clsx";
import { Draggable } from "gsap/Draggable";

const Home = () => {
  const { openWindow } = useWindowStore();
  const { setActiveLocation } = useLocationStore();

  const projects = locations.work?.children ?? [];

  const handleOpenProjectFinder = (project) => {
    setActiveLocation(project);
    openWindow("finder");
  };

  useGSAP(() => {
    const navHeight = 25;
    const draggables = Draggable.create(".folder", {
      type: "left,top",
      bounds: {
        top: navHeight,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight - navHeight,
      },
      edgeResistance: 0.65,
      dragClickThreshold: 5,
      onClick: function () {
        // Ensure we get the <li> even if user clicks img or p inside
        const li = this.target.closest("li");
        if (!li) return;

        const projectId = li.dataset.projectId;
        const project = projects.find((p) => p.id == projectId); // allow number/string match
        if (project) handleOpenProjectFinder(project);
      },
    });

    // cleanup when component unmounts
    return () => {
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
            <img src="/images/folder.png" alt={project.name} />
            <p>{project.name}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default Home;
