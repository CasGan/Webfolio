import WindowControls from "#components/WindowControls.jsx";
import { blogPosts } from "#constants";
import WindowWrapper from "#hoc/WindowWrapper.jsx";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  MoveRight,
  PanelLeft,
  Plus,
  Search,
  Share,
  ShieldHalf,
} from "lucide-react";
const Browser = () => {
  return (
    <>
      <div id="window-header">
        <WindowControls target="browser" />
        <PanelLeft className="ml-10 icon" />

        <div className="flex items-center gap-1 ml-5">
          <ChevronLeft className="icon" />
          <ChevronRight className="icon" />
        </div>
        <div className="flex-1 flex-center gap-3">
          <ShieldHalf className="icon" />
          <div className="search">
            <Search className="icon" />
            <input
              type="text"
              placeholder="Search or Enter website name "
              className="flex-1"
              aria-label="Search or Enter website name"
            />
          </div>
        </div>

        <div className="flex items-center gap-5">
            <Share className="icon"/>
            <Plus className="icon"/>
            <Copy className="icon"/>
        </div>
      </div>
      <div className="blog">
        <h2>My Blogs</h2>
        <div className="space-y-8">
            {blogPosts.map(({id, image, title, date, link}) => (
                <div key={id} className="blog-post">
                    <div className="col-span-2">
                        <img src={image} alt={title}/>
                    </div> 
                    <div className="content"> 
                        <p>{date}</p>
                        <h3>{title}</h3>
                        <a href={link} target="_blank" rel="noopener noreferrer">
                            Check out the full post <MoveRight className="icon"/>
                        </a>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </>
  );
};

const BrowserWindow = WindowWrapper(Browser, "browser");

export default BrowserWindow;
