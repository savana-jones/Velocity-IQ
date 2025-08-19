import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white relative overflow-hidden">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-black/40 backdrop-blur-md border-b border-zinc-800">
        {/* Left: Logo + Title (clickable to home) */}
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
            <Image
              src="/logo.jpg"
              alt="VelocityIQ Logo"
              width={40}
              height={40}
              className="object-cover"
            />
          </div>
          <span className="text-xl font-semibold tracking-wide">
            VelocityIQ
          </span>
        </Link>

        {/* Right: Buttons */}
        <div className="flex items-center gap-4">
          <a
            href="/auth"
            className="px-4 py-2 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition"
          >
            Sign Up
          </a>
          <a
            href="/auth?tab=login"
            className="px-4 py-2 rounded-lg bg-black border border-gray-500 font-semibold text-white
                 hover:bg-gradient-to-r hover:from-yellow-600 hover:to-yellow-400 hover:text-black transition"
          >
            Log In
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-32">
        {/* Glow effect behind heading */}
        <div className="absolute top-1/3 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-3xl"></div>

        <h1 className="text-6xl md:text-7xl font-extrabold mb-6 bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
          VelocityIQ
        </h1>
        <p className="max-w-2xl text-lg md:text-xl text-gray-400 leading-relaxed">
          Smarter Sprint Planning & Team Insights powered by GitHub + Jira.
          <br />
          Predict workload balance, prevent burnout, and optimize your
          development flow.
        </p>
      </section>
    </main>
  );
}
