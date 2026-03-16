function GalaxyBackground({ children }) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* Gradient Space Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900 to-black animate-pulse"></div>

      {/* Star Layer */}
      <div className="absolute inset-0 opacity-40">
        <div className="w-1 h-1 bg-white rounded-full absolute top-10 left-20"></div>
        <div className="w-1 h-1 bg-white rounded-full absolute top-40 right-32"></div>
        <div className="w-1 h-1 bg-white rounded-full absolute bottom-24 left-60"></div>
        <div className="w-1 h-1 bg-white rounded-full absolute bottom-40 right-20"></div>
        <div className="w-1 h-1 bg-white rounded-full absolute top-60 left-1/2"></div>
        <div className="w-1 h-1 bg-white rounded-full absolute bottom-10 right-1/3"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>

    </div>
  );
}

export default GalaxyBackground;