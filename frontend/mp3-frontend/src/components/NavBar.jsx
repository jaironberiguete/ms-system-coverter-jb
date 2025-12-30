export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/10 backdrop-blur border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-indigo-500 font-bold">
            JB
          </div>
          <div>
          </div>
        </div>

        {/* Actions */}
        <button
          className="text-sm px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition"
        >
          Log In
        </button>
      </div>
    </nav>
  );
}
