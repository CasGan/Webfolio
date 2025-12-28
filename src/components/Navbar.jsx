import dayjs from "dayjs";
import { navIcons, navLinks } from "#constants";
import useWindowStore from "#store/window.js";

const Navbar = () => {
  const { openWindow, closeWindow, windows } = useWindowStore();

  const toggleWindow = (type) => {
    const windowState = windows[type];

    if (windowState?.isOpen) {
      closeWindow(type);
    } else {
      openWindow(type);
    }
  };

  return (
    <nav>
      <div>
        <img src="/images/snake.png" alt="logo" className="icon" />
        <p className="font-bold ">Cassandra's Portfolio</p>
        <ul>
          {navLinks.map(({ id, name, type }) => (
            <li key={id} onClick={() => toggleWindow(type)}>
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
