import GalaxyBackground from "../components/GalaxyBackground";

function Profile() {
  return (
    <div className="relative min-h-[85vh] rounded-2xl overflow-hidden flex items-center justify-center">

      {/* Galaxy Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-900 to-black"></div>

      <div className="relative z-10 backdrop-blur-lg bg-white/10 border border-purple-500/30 shadow-2xl rounded-2xl p-8 w-full max-w-md text-white">

        <h2 className="text-3xl font-bold text-center mb-6 text-purple-400">
          🌌  Profile
        </h2>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-2 bg-black/40 border border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />

          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 bg-black/40 border border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />

          <input
            type="text"
            placeholder="Role"
            className="w-full p-2 bg-black/40 border border-purple-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
          />

        </div>

        <button className="w-full mt-6 bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-semibold shadow-lg transition-all duration-300">
          Update Profile
        </button>

      </div>
    </div>
  );
}

export default Profile;