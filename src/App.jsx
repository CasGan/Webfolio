import { Draggable } from "gsap/Draggable";
import gsap from "gsap";
gsap.registerPlugin(Draggable);

import { Dock, Navbar, Welcome } from "#components";
import { Terminal } from "#windows";


const App = () => {
  return (
    <main>
      <Navbar />
      <Welcome />
      <Dock />  

      <Terminal /> 
    </main>
  )
}

export default App;