import { Draggable } from "gsap/Draggable";
import gsap from "gsap";

import { Dock, Navbar, Welcome, Home, DesktopBackground } from "#components";
import { Browser, Terminal, Resume, Finder, Text, Image, Contact, Gallery } from "#windows";

gsap.registerPlugin(Draggable);

const App = () => {
  return (
    <>
<DesktopBackground />    
    <main className="os-root">
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
}

export default App;