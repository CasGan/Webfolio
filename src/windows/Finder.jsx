import { WindowControls } from "#components";
import { locations } from "#constants";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import useLocationStore from "#store/location.js";
import useWindowStore from "#store/window.js";
import clsx from "clsx";


import { Search } from "lucide-react";

const Finder = () => {
  const { activeLocation, setActiveLocation } = useLocationStore();
  const { openWindow, focusWindow } = useWindowStore();
  
  const WINDOW_KEY_MAP = {
    txtfile: 'txtfile',
    imgfile: 'imgfile',
  };

 const openItem = (item) => {
  if (item.fileType === "pdf") {
    openWindow("resume");
    focusWindow("resume");
    return;
  }

  if (item.kind === "folder") {
    setActiveLocation(item);
    return;
  }

  if (["fig", "url"].includes(item.fileType) && item.href) {
    window.open(item.href, "_blank");
    return;
  }

  const windowKey = `${item.fileType}${item.kind}`;
  const mappedKey = WINDOW_KEY_MAP[windowKey];

  if (mappedKey) {
    const data = item;
    openWindow(mappedKey, data);
    focusWindow(mappedKey); 
  }
};

  const renderList = (name, items) => (
    <div>
      <h3>{name}</h3>
      <ul>
        {items.map((item) => (
          <li
            key={item.id}
            role="button"
            onPointerUp={() => setActiveLocation(item)}
            className={clsx(
              item.id === activeLocation.id ? "active" : "not-active"
            )}
          >
            <img src={item.icon} className="w-4" alt={item.name} />
            <p className="text-sm font-medium truncate">{item.name}</p>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <>
      <div id="window-header">
        <WindowControls target="finder" />
        <Search className="icon" />
      </div>

      <div className="bg-white flex h-full">
        <div className="sidebar">
          <ul>{renderList("Favorites", Object.values(locations))}</ul>
          <ul>{renderList("My Projects", locations.work.children)}</ul>
        </div>

        <ul className="content">
          {activeLocation?.children.map((item) => (
            <li
              key={item.id}
              className={`${item.position} finder-file`}
              role="button"
              onPointerUp={(e) =>{
                e.stopPropagation();
                openItem(item);
              }}
            >
              <img src={item.icon} alt={item.name} />
              <p>{item.name}</p>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

const FinderWindow = WindowWrapper(Finder, "finder");

export default FinderWindow;