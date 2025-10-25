import React from "react";

// Define the component props
interface CarrotLoaderProps {
  isActive: boolean;
}

const CarrotLoader: React.FC<CarrotLoaderProps> = ({ isActive }) => {
  // If not active, return null to render nothing
  if (!isActive) {
    return null;
  }

  // Styles for the overlay container
  const overlayStyle: React.CSSProperties = {
    // Positioning and sizing to cover the entire viewport
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",

    // Ensure it's on top of everything else
    zIndex: 9999,

    // Visual appearance (semi-transparent dark background)
    backgroundColor: "rgba(0, 0, 0, 0.4)",

    // Center the content (the loader)
    display: "flex",
    justifyContent: "center",
    alignItems: "center",

    // Crucial for blocking clicks: Since the overlay covers the whole page,
    // it receives all mouse events, effectively blocking interaction with elements below it.
    cursor: "wait",
  };

  return (
    <div style={overlayStyle} className="pointer-events-none">
      <img
        src="/Throbber.png"
        alt="Loading Spinner"
        className="w-64 h-64 animate-rotate-wait"
      />
    </div>
  );
};

export default CarrotLoader;
