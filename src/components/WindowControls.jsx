import useWindowStore from "#store/window.js";

const WindowControls = ({target}) => {
    const {closeWindow} = useWindowStore();

    const handleClose = (e) => {
      e.preventDefault(); 
      e.stopPropagation(); 
      closeWindow(target); 
    };

  return (
    <div id="window-controls">
       <div
        className="control close"
        role="button"
        aria-label="Close window"
        tabIndex={0}
        onPointerUp={handleClose}
        onClick={(e) => {
          if (e.detail === 0) handleClose(e);
        }}
      />
        {/* <div className="minimize" />
        <div className="maximize"/> */}
    </div>
  )
}

export default WindowControls;