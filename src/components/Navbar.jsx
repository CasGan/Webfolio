import dayjs from "dayjs";
import { navIcons, navLinks } from "#constants";
import useWindowStore from "#store/window.js";
import clsx from "clsx";

const Navbar = () => {
  const { openWindow, closeWindow, windows } = useWindowStore();

  const toggleWindow = (type) => {
    const windowState = windows[type];
    windowState?.isOpen ? closeWindow(type) : openWindow(type);
  };

  const handleActivate = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWindow(type);
  };

  return (
    <nav>
      <div>
        <img src="/images/snake.png" alt="logo" className="icon" />
        <p className="font-bold">Cassandra's Portfolio</p>

        <ul>
          {navLinks.map(({ id, name, type }) => (
            <li
              key={id}
              role="button"
              aria-pressed={windows[type]?.isOpen}
              tabIndex={0}
              className={clsx(
                "touch-feedback rounded-md px-2 py-1",
                windows[type]?.isOpen && "bg-blue-500/20 text-blue-300"
              )}
              onPointerUp={(e) => handleActivate(e, type)}
              onKeyDown={(e) => {
                if(e.key === "Enter" || e.key === ""){
                  e.preventDefault(); 
                  toggleWindow(type);
                }
              }}
            >
              <p>{name}</p>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <ul>
          {navIcons.map(({ id, img }) => (
            <li key={id}>
              <img src={img} className="icon-hover" alt={`icon-${id}`} />
            </li>
          ))}
        </ul>
        <time>{dayjs().format("ddd MMM D h:mm A")}</time>
      </div>
    </nav>
  );
};

export default Navbar;
