import { locations } from "#constants";
import useLocationStore from "#store/location.js";
import useWindowStore from "#store/window.js";
import { useGSAP } from "@gsap/react";
import clsx from "clsx";
import { Draggable } from "gsap/Draggable";

const projects = locations.work?.children ?? [];

const Home = () => {
  const { openWindow } = useWindowStore();
  const { setActiveLocation } = useLocationStore();

  const handleOpenProjectFinder = (project) => {
    setActiveLocation(project);
    openWindow("finder");
  };

  useGSAP(() => {
    const draggables = Draggable.create(".folder", {
      type: "x,y",
      dragClickThreshold: 5,
      onClick: function () {
        const projectId = this.target.dataset.projectId;
        const project = projects.find((p) => p.id === projectId);
        if (project) handleOpenProjectFinder(project);
      },
    });

    // clean up
    return () => {
      draggables.forEach((draggable) => draggable.kill());
    };
  }, []);

  return (
    <section id="home">
      <ul>
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
