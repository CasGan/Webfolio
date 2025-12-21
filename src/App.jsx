import { Draggable } from "gsap/Draggable";
import gsap from "gsap";

import { Dock, Navbar, Welcome } from "#components";
import { Browser, Terminal, Resume, Finder, Text, Image, Contact } from "#windows";

gsap.registerPlugin(Draggable);

const App = () => {
  return (
    <main>
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
    </main>
  )
}

export default App;