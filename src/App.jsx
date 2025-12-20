import { Draggable } from "gsap/Draggable";
import gsap from "gsap";

import { Dock, Navbar, Welcome } from "#components";
import { Browser, Terminal, Resume } from "#windows";

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
    </main>
  )
}

export default App;