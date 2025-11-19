"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";

export default function AuthPage() {
  const searchParams = useSearchParams();
  const initialTab =
    (searchParams.get("tab") as "signup" | "login") || "signup";
  const [tab, setTab] = useState<"signup" | "login">(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-black text-white flex flex-col">
      {/* Sticky Navbar (same style as landing page, but no right-side buttons) */}
      <nav className="sticky top-0 z-50 flex items-center justify-between px-8 py-4 bg-black/40 backdrop-blur-md border-b border-zinc-800">
        {/* Left: Logo + Title (clickable home) */}
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
          <span className="text-xl font-semibold tracking-wide">VelocityIQ</span>
        </Link>
        <div></div>
      </nav>

      {/* Auth Card */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-zinc-900/60 rounded-2xl shadow-lg border border-zinc-800 p-8">
          {/* Tabs */}
          <div className="flex mb-8 border-b border-zinc-700">
            <button
              className={`flex-1 py-2 font-semibold ${
                tab === "signup"
                  ? "text-white border-b-2 border-yellow-500"
                  : "text-gray-400"
              }`}
              onClick={() => setTab("signup")}
            >
              Sign Up
            </button>
            <button
              className={`flex-1 py-2 font-semibold ${
                tab === "login"
                  ? "text-white border-b-2 border-yellow-500"
                  : "text-gray-400"
              }`}
              onClick={() => setTab("login")}
            >
              Log In
            </button>
          </div>

          {/* Social Buttons */}
          <div className="flex flex-col gap-4">
            {/* Google Button */}
            <button
            onClick={() => signIn("google",{ callbackUrl: "/dashboard" })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-white text-black font-semibold hover:bg-zinc-200 transition">
              <Image
                src="/google-logo.webp"
                alt="Google Logo"
                width={20}
                height={20}
              />
              Continue with Google
            </button>

            {/* GitHub Button */}
            <button
              onClick={() => signIn("github",{ callbackUrl: "/dashboard" })}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-black border border-gray-500 text-white font-semibold 
                hover:bg-gradient-to-r hover:from-black hover:to-gray-800 transition"
            >
              <span className="w-7 h-7 flex items-center justify-center rounded-full bg-white">
                <Image
                  src="/github-logo.svg"
                  alt="GitHub Logo"
                  width={20}
                  height={20}
                />
              </span>
              Continue with GitHub
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
