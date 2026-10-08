"use client";

import { useState } from "react";
import { registerUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      await registerUser(email, password);

      router.replace("/");
    } catch (error: any) {
      console.error(error);

      if (error?.code === "auth/email-already-in-use") {
        setError(
          "An account already exists with this email."
        );
      } else if (error?.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (error?.code === "auth/weak-password") {
        setError(
          "Password is too weak. Use at least 6 characters."
        );
      } else {
        setError(
          "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f8f9fb] text-gray-950">

      {/* BACKGROUND */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">

        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#4285F4]/8 blur-3xl register-float-one" />

        <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[#EA4335]/6 blur-3xl register-float-two" />

        <div className="absolute right-[55%] top-[18%] h-52 w-52 rounded-full bg-[#34A853]/6 blur-3xl register-float-three" />

        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />
      </div>

      {/* MAIN */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-10">

        <div className="w-full max-w-[430px]">

          {/* BRAND */}
          <div className="mb-8 text-center register-fade-in">

            <div className="mb-5 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#4285F4]" />
                  <span className="h-2 w-2 rounded-full bg-[#EA4335]" />
                  <span className="h-2 w-2 rounded-full bg-[#FBBC05]" />
                  <span className="h-2 w-2 rounded-full bg-[#34A853]" />
                </div>
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-[-0.04em] text-gray-950">
              CampusCart
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Your campus marketplace, simplified.
            </p>
          </div>

          {/* CARD */}
          <div className="register-card register-fade-in-delay overflow-hidden rounded-[28px] border border-gray-200/80 bg-white/90 shadow-[0_25px_80px_rgba(0,0,0,0.08)] backdrop-blur-xl">

            {/* TOP ACCENT */}
            <div className="flex h-[3px] w-full">
              <span className="w-1/4 bg-[#4285F4]" />
              <span className="w-1/4 bg-[#EA4335]" />
              <span className="w-1/4 bg-[#FBBC05]" />
              <span className="w-1/4 bg-[#34A853]" />
            </div>

            <div className="p-7 sm:p-9">

              {/* HEADING */}
              <div className="mb-7">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-gray-400">
                  Get started
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-gray-950">
                  Create your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  Join your campus marketplace in seconds.
                </p>
              </div>

              {/* FORM */}
              <form
                onSubmit={handleRegister}
                className="space-y-5"
              >

                {/* EMAIL */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-700">
                    Email
                  </label>

                  <div className="input-wrap">
                    <svg
                      className="input-icon"
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
                      className="modern-input"
                    />
                  </div>
                </div>

                {/* PASSWORD */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-700">
                    Password
                  </label>

                  <div className="input-wrap">
                    <svg
                      className="input-icon"
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
                      placeholder="At least 6 characters"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="modern-input"
                    />
                  </div>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label className="mb-2 block text-xs font-semibold text-gray-700">
                    Confirm password
                  </label>

                  <div className="input-wrap">
                    <svg
                      className="input-icon"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    >
                      <path d="M20 7 10 17l-5-5" />

                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                      />
                    </svg>

                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value
                        )
                      }
                      placeholder="Re-enter your password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      className="modern-input"
                    />
                  </div>
                </div>

                {/* ERROR */}
                {error && (
                  <div className="error-box">
                    <span className="error-dot" />

                    <p>{error}</p>
                  </div>
                )}

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="register-button group relative mt-2 flex h-12 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gray-950 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-[0_10px_25px_rgba(0,0,0,0.14)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="relative z-10">
                    {loading
                      ? "Creating account..."
                      : "Create account"}
                  </span>

                  <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] transition-all duration-500 group-hover:w-full" />
                </button>
              </form>

              {/* LOGIN */}
              <div className="mt-7 border-t border-gray-100 pt-6 text-center">
                <p className="text-sm text-gray-500">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() =>
                      router.push("/")
                    }
                    className="cursor-pointer font-semibold text-gray-900 transition hover:text-[#4285F4]"
                  >
                    Sign in
                  </button>
                </p>
              </div>

            </div>
          </div>

          {/* FOOTER */}
          <div className="mt-6 flex items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-[0.14em] text-gray-400 register-fade-in-delay-2">
            <span>Built for campus life</span>

            <span className="flex gap-1">
              <span className="h-1 w-1 rounded-full bg-[#4285F4]" />
              <span className="h-1 w-1 rounded-full bg-[#EA4335]" />
              <span className="h-1 w-1 rounded-full bg-[#FBBC05]" />
              <span className="h-1 w-1 rounded-full bg-[#34A853]" />
            </span>
          </div>

        </div>
      </div>

      <style jsx>{`
        .register-fade-in {
          animation: registerFadeIn 0.7s
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .register-fade-in-delay {
          animation: registerFadeIn 0.7s
            0.08s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .register-fade-in-delay-2 {
          animation: registerFadeIn 0.7s
            0.18s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes registerFadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .register-float-one {
          animation: registerFloatOne 10s ease-in-out infinite;
        }

        .register-float-two {
          animation: registerFloatTwo 12s ease-in-out infinite;
        }

        .register-float-three {
          animation: registerFloatThree 14s ease-in-out infinite;
        }

        @keyframes registerFloatOne {
          0%,
          100% {
            transform: translate(0, 0);
          }

          50% {
            transform: translate(-25px, 20px);
          }
        }

        @keyframes registerFloatTwo {
          0%,
          100% {
            transform: translate(0, 0);
          }

          50% {
            transform: translate(20px, -25px);
          }
        }

        @keyframes registerFloatThree {
          0%,
          100% {
            transform: translate(0, 0);
          }

          50% {
            transform: translate(-15px, -20px);
          }
        }

        .register-card {
          transition:
            transform 0.4s ease,
            box-shadow 0.4s ease;
        }

        .register-card:hover {
          transform: translateY(-2px);
          box-shadow:
            0 30px 90px rgba(0, 0, 0, 0.1);
        }

        .input-wrap {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
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

        .input-wrap:focus-within .input-icon {
          color: #4285f4;
          transform: translateY(-50%) scale(1.05);
        }

        .modern-input {
          width: 100%;
          height: 48px;
          border: 1px solid #e5e7eb;
          border-radius: 13px;
          background: #fafafa;
          padding: 0 14px 0 44px;
          font-size: 14px;
          color: #111827;
          outline: none;
          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            box-shadow 0.2s ease;
        }

        .modern-input::placeholder {
          color: #9ca3af;
        }

        .modern-input:hover {
          border-color: #d1d5db;
        }

        .modern-input:focus {
          border-color: #4285f4;
          background: white;
          box-shadow:
            0 0 0 4px rgba(66, 133, 244, 0.08);
        }

        .error-box {
          display: flex;
          align-items: center;
          gap: 9px;
          border: 1px solid #fee2e2;
          border-radius: 12px;
          background: #fffafa;
          padding: 11px 13px;
          color: #b91c1c;
          font-size: 12px;
        }

        .error-dot {
          width: 6px;
          height: 6px;
          flex-shrink: 0;
          border-radius: 999px;
          background: #ea4335;
        }

        @media (prefers-reduced-motion: reduce) {
          .register-fade-in,
          .register-fade-in-delay,
          .register-fade-in-delay-2,
          .register-float-one,
          .register-float-two,
          .register-float-three {
            animation: none;
          }

          .register-card {
            transition: none;
          }
        }
      `}</style>
    </main>
  );
}