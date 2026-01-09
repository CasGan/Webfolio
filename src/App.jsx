import { Draggable } from "gsap/Draggable";
import gsap from "gsap";
import { Dock, Navbar, Welcome, Home, DesktopBackground } from "#components";
import {
  Browser,
  Terminal,
  Resume,
  Finder,
  Text,
  Image,
  Contact,
  Gallery,
} from "#windows";
import useWindowViewportSync from "#hooks/useWindowViewportSync";
gsap.registerPlugin(Draggable);

const App = () => {
  useWindowViewportSync(); 
  return (
    <>
      <main className="os-root">
        <DesktopBackground />
        <Navbar />
        <Welcome />
        <Dock />

        <Terminal />
        <Browser />
        <Resume />
        <Finder />
        <Text />
        <Image />
        <Contact />
        <Home />
        <Gallery />
      </main>
    </>
  );
};

export default App;
