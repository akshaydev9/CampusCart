"use client";

import { useState } from "react";
import { loginUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await loginUser(email, password);
      router.replace("/marketplace");
    } catch (error: any) {
      console.error(error);

      if (error?.code === "auth/invalid-credential") {
        setError("Incorrect email or password.");
      } else if (error?.code === "auth/user-not-found") {
        setError("No account exists with this email.");
      } else if (error?.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else if (error?.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f6f8] text-gray-950">

      {/* BACKGROUND */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#4285F4]/10 blur-[110px] auth-orb-one" />

        <div className="absolute -bottom-40 left-[25%] h-[500px] w-[500px] rounded-full bg-[#34A853]/8 blur-[110px] auth-orb-two" />

        <div className="absolute -right-40 top-[10%] h-[450px] w-[450px] rounded-full bg-[#FBBC05]/8 blur-[110px] auth-orb-three" />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

      </div>

      {/* PAGE */}

      <div className="relative z-10 flex min-h-screen">

        {/* ========================================= */}
        {/* LEFT SIDE */}
        {/* ========================================= */}

        <section className="relative hidden overflow-hidden lg:flex lg:w-[55%]">

          <div className="flex w-full flex-col justify-between px-14 py-12 xl:px-20">

            {/* BRAND */}

            <div className="auth-enter">

              <div className="flex items-center gap-3">

                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">

                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-[#4285F4]" />
                    <span className="h-2 w-2 rounded-full bg-[#EA4335]" />
                    <span className="h-2 w-2 rounded-full bg-[#FBBC05]" />
                    <span className="h-2 w-2 rounded-full bg-[#34A853]" />
                  </div>

                </div>

                <span className="text-xl font-bold tracking-[-0.04em]">
                  CampusCart
                </span>

              </div>

            </div>

            {/* HERO */}

            <div className="auth-enter-delay max-w-[600px]">

              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-gray-500 backdrop-blur-md">

                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#34A853]" />

                Built for students

              </div>

              <h1 className="text-[clamp(3.5rem,6vw,6.5rem)] font-bold leading-[0.9] tracking-[-0.07em] text-gray-950">

                Buy.
                <br />

                Sell.
                <br />

                <span className="relative inline-block">

                  Repeat.

                  <span className="absolute -bottom-3 left-0 h-[4px] w-[75%] overflow-hidden rounded-full">

                    <span className="block h-full w-full bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853]" />

                  </span>

                </span>

              </h1>

              <p className="mt-8 max-w-[470px] text-base leading-7 text-gray-500">

                A simple marketplace built for your
                campus. Find textbooks, electronics,
                supplies and more — all from people
                around you.

              </p>

              {/* SMALL FEATURE ROW */}

              <div className="mt-10 flex flex-wrap items-center gap-3">

                <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-4 py-2 text-xs font-medium text-gray-600 backdrop-blur-md">

                  <span className="h-1.5 w-1.5 rounded-full bg-[#4285F4]" />

                  Buy locally

                </div>

                <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-4 py-2 text-xs font-medium text-gray-600 backdrop-blur-md">

                  <span className="h-1.5 w-1.5 rounded-full bg-[#EA4335]" />

                  Sell easily

                </div>

                <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-4 py-2 text-xs font-medium text-gray-600 backdrop-blur-md">

                  <span className="h-1.5 w-1.5 rounded-full bg-[#34A853]" />

                  Stay on campus

                </div>

              </div>

            </div>

            {/* FOOTER */}

            <div className="auth-enter-delay-2">

              <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-gray-400">

                <span>Campus marketplace</span>

                <span className="h-px w-10 bg-gray-300" />

                <div className="flex gap-1">

                  <span className="h-1 w-1 rounded-full bg-[#4285F4]" />
                  <span className="h-1 w-1 rounded-full bg-[#EA4335]" />
                  <span className="h-1 w-1 rounded-full bg-[#FBBC05]" />
                  <span className="h-1 w-1 rounded-full bg-[#34A853]" />

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ========================================= */}
        {/* RIGHT SIDE */}
        {/* ========================================= */}

        <section className="flex w-full items-center justify-center px-5 py-10 lg:w-[45%] lg:border-l lg:border-gray-200/70 lg:bg-white/30">

          <div className="w-full max-w-[420px]">

            {/* MOBILE BRAND */}

            <div className="mb-8 text-center lg:hidden auth-enter">

              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm">

                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#4285F4]" />
                  <span className="h-2 w-2 rounded-full bg-[#EA4335]" />
                  <span className="h-2 w-2 rounded-full bg-[#FBBC05]" />
                  <span className="h-2 w-2 rounded-full bg-[#34A853]" />
                </div>

              </div>

              <h1 className="text-3xl font-bold tracking-[-0.05em]">
                CampusCart
              </h1>

              <p className="mt-2 text-sm text-gray-500">
                Your campus marketplace.
              </p>

            </div>

            {/* LOGIN CARD */}

            <div className="auth-login-card overflow-hidden rounded-[30px] border border-gray-200 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.08)]">

              {/* TOP ACCENT */}

              <div className="flex h-[3px]">

                <span className="w-1/4 bg-[#4285F4]" />
                <span className="w-1/4 bg-[#EA4335]" />
                <span className="w-1/4 bg-[#FBBC05]" />
                <span className="w-1/4 bg-[#34A853]" />

              </div>

              <div className="p-7 sm:p-10">

                {/* HEADING */}

                <div className="mb-8">

                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                    Welcome back
                  </p>

                  <h2 className="mt-2 text-[30px] font-bold tracking-[-0.05em]">
                    Good to see you.
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-gray-500">
                    Sign in and get back to your campus.
                  </p>

                </div>

                {/* FORM */}

                <form
                  onSubmit={handleLogin}
                  className="space-y-5"
                >

                  {/* EMAIL */}

                  <div>

                    <label className="mb-2 block text-xs font-bold text-gray-700">
                      Email address
                    </label>

                    <div className="auth-input-wrap">

                      <svg
                        className="auth-input-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >

                        <rect
                          x="3"
                          y="5"
                          width="18"
                          height="14"
                          rx="2"
                        />

                        <path d="m3 7 9 6 9-6" />

                      </svg>

                      <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        placeholder="you@example.com"
                        required
                        autoComplete="email"
                        className="auth-input"
                      />

                    </div>

                  </div>

                  {/* PASSWORD */}

                  <div>

                    <label className="mb-2 block text-xs font-bold text-gray-700">
                      Password
                    </label>

                    <div className="auth-input-wrap">

                      <svg
                        className="auth-input-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >

                        <rect
                          x="5"
                          y="10"
                          width="14"
                          height="10"
                          rx="2"
                        />

                        <path d="M8 10V7a4 4 0 0 1 8 0v3" />

                      </svg>

                      <input
                        type="password"
                        value={password}
                        onChange={(event) =>
                          setPassword(event.target.value)
                        }
                        placeholder="Enter your password"
                        required
                        autoComplete="current-password"
                        className="auth-input"
                      />

                    </div>

                  </div>

                  {/* ERROR */}

                  {error && (
                    <div className="auth-error">

                      <span className="auth-error-dot" />

                      <p>{error}</p>

                    </div>
                  )}

                  {/* SIGN IN */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="auth-submit group"
                  >

                    <span className="relative z-10">
                      {loading
                        ? "Signing in..."
                        : "Sign in"}
                    </span>

                    <span className="absolute bottom-0 left-0 h-[3px] w-0 bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] transition-all duration-500 group-hover:w-full" />

                  </button>

                </form>

                {/* REGISTER */}

                <div className="mt-8 border-t border-gray-100 pt-6 text-center">

                  <p className="text-sm text-gray-500">

                    Don't have an account?{" "}

                    <button
                      type="button"
                      onClick={() =>
                        router.push("/register")
                      }
                      className="cursor-pointer font-bold text-gray-950 transition hover:text-[#4285F4]"
                    >
                      Create one →
                    </button>

                  </p>

                </div>

              </div>

            </div>

            {/* TRUST LINE */}

            <div className="mt-5 flex items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-[0.13em] text-gray-400">

              <span className="h-1.5 w-1.5 rounded-full bg-[#34A853]" />

              <span>Simple · Fast · Campus-first</span>

            </div>

          </div>

        </section>

      </div>

      {/* ANIMATIONS */}

      <style jsx>{`

        .auth-enter {
          animation: authEnter 0.8s
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .auth-enter-delay {
          animation: authEnter 0.9s
            0.1s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .auth-enter-delay-2 {
          animation: authEnter 0.9s
            0.2s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .auth-login-card {
          animation: cardEnter 0.8s
            0.08s cubic-bezier(0.22, 1, 0.36, 1) both;

          transition:
            transform 0.4s ease,
            box-shadow 0.4s ease;
        }

        .auth-login-card:hover {
          transform: translateY(-3px);

          box-shadow:
            0 35px 100px rgba(0, 0, 0, 0.11);
        }

        @keyframes authEnter {

          from {
            opacity: 0;
            transform: translateY(22px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }

        }

        @keyframes cardEnter {

          from {
            opacity: 0;
            transform: translateY(25px) scale(0.98);
          }

          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }

        }

        .auth-orb-one {
          animation: orbOne 12s ease-in-out infinite;
        }

        .auth-orb-two {
          animation: orbTwo 15s ease-in-out infinite;
        }

        .auth-orb-three {
          animation: orbThree 13s ease-in-out infinite;
        }

        @keyframes orbOne {

          0%,
          100% {
            transform: translate(0, 0);
          }

          50% {
            transform: translate(50px, 30px);
          }

        }

        @keyframes orbTwo {

          0%,
          100% {
            transform: translate(0, 0);
          }

          50% {
            transform: translate(-40px, -30px);
          }

        }

        @keyframes orbThree {

          0%,
          100% {
            transform: translate(0, 0);
          }

          50% {
            transform: translate(-30px, 40px);
          }

        }

        .auth-input-wrap {
          position: relative;
        }

        .auth-input-icon {
          position: absolute;
          left: 15px;
          top: 50%;
          width: 18px;
          height: 18px;
          transform: translateY(-50%);
          color: #9ca3af;
          pointer-events: none;

          transition:
            color 0.2s ease,
            transform 0.2s ease;
        }

        .auth-input-wrap:focus-within .auth-input-icon {
          color: #4285f4;

          transform:
            translateY(-50%)
            scale(1.08);
        }

        .auth-input {
          width: 100%;
          height: 51px;

          border: 1px solid #e5e7eb;
          border-radius: 14px;

          background: #f9fafb;

          padding:
            0 15px 0 45px;

          font-size: 14px;
          color: #111827;

          outline: none;

          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .auth-input::placeholder {
          color: #9ca3af;
        }

        .auth-input:hover {
          border-color: #d1d5db;
        }

        .auth-input:focus {
          border-color: #4285f4;
          background: white;

          box-shadow:
            0 0 0 4px
            rgba(66, 133, 244, 0.08);
        }

        .auth-submit {
          position: relative;

          display: flex;

          height: 52px;
          width: 100%;

          cursor: pointer;

          align-items: center;
          justify-content: center;

          overflow: hidden;

          border-radius: 14px;

          background: #111827;
          color: white;

          font-size: 14px;
          font-weight: 700;

          transition:
            transform 0.25s ease,
            background 0.25s ease,
            box-shadow 0.25s ease;
        }

        .auth-submit:hover {
          transform: translateY(-2px);

          background: #1f2937;

          box-shadow:
            0 12px 30px
            rgba(0, 0, 0, 0.14);
        }

        .auth-submit:active {
          transform: translateY(0);
        }

        .auth-submit:disabled {
          cursor: not-allowed;
          opacity: 0.55;

          transform: none;

          box-shadow: none;
        }

        .auth-error {
          display: flex;

          align-items: center;

          gap: 9px;

          border: 1px solid #fee2e2;
          border-radius: 13px;

          background: #fffafa;

          padding: 11px 13px;

          color: #b91c1c;

          font-size: 12px;
        }

        .auth-error-dot {
          height: 6px;
          width: 6px;

          flex-shrink: 0;

          border-radius: 999px;

          background: #ea4335;
        }

        @media (prefers-reduced-motion: reduce) {

          .auth-enter,
          .auth-enter-delay,
          .auth-enter-delay-2,
          .auth-login-card,
          .auth-orb-one,
          .auth-orb-two,
          .auth-orb-three {
            animation: none;
          }

          .auth-login-card {
            transition: none;
          }

        }

      `}</style>

    </main>
  );
}