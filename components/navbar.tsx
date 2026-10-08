
"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firestore";
import { auth, logoutUser } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [hasUnreadMessages, setHasUnreadMessages] =
    useState(false);

  const [userName, setUserName] = useState("");

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      return;
    }

    if (user.email) {
      setUserName(
        user.email.split("@")[0]
      );
    }

    const conversationsQuery = query(
      collection(db, "conversations"),
      where(
        "participants",
        "array-contains",
        user.uid
      )
    );

    const unsubscribe = onSnapshot(
      conversationsQuery,
      (snapshot) => {
        const unread = snapshot.docs.some(
          (conversation) => {
            const data =
              conversation.data();

            return (
              data.unreadFor?.includes(
                user.uid
              ) || false
            );
          }
        );

        setHasUnreadMessages(unread);
      },
      (error) => {
        console.error(
          "Navbar message listener error:",
          error
        );
      }
    );

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
      router.replace("/");
    } catch (error) {
      console.error(
        "Error logging out:",
        error
      );
    }
  };

  const navItems = [
    {
      label: "Marketplace",
      path: "/marketplace",
    },
    {
      label: "My Listings",
      path: "/my-listings",
    },
    {
      label: "Messages",
      path: "/messages",
    },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/80 bg-white/90 backdrop-blur-xl">

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">

        {/* BRAND */}
        <button
          type="button"
          onClick={() =>
            router.push("/marketplace")
          }
          className="group flex cursor-pointer items-center gap-2.5"
        >

          {/* Google colour dots */}
          <span className="flex items-center gap-[2px]">

            <span className="h-1.5 w-1.5 rounded-full bg-[#4285F4] transition-transform duration-300 group-hover:-translate-y-0.5" />

            <span className="h-1.5 w-1.5 rounded-full bg-[#EA4335] transition-transform duration-300 group-hover:translate-y-0.5" />

            <span className="h-1.5 w-1.5 rounded-full bg-[#FBBC05] transition-transform duration-300 group-hover:-translate-y-0.5" />

            <span className="h-1.5 w-1.5 rounded-full bg-[#34A853] transition-transform duration-300 group-hover:translate-y-0.5" />

          </span>

          <span className="text-lg font-semibold tracking-[-0.02em] text-gray-950">
            CampusCart
          </span>

        </button>

        {/* NAVIGATION */}
        <div className="hidden items-center gap-1 md:flex">

          {navItems.map((item) => {

            const active =
              pathname === item.path ||
              pathname.startsWith(
                `${item.path}/`
              );

            const isMessages =
              item.path === "/messages";

            return (
              <button
                key={item.path}
                type="button"
                onClick={() =>
                  router.push(item.path)
                }
                className={`group relative flex cursor-pointer items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-300 ${
                  active
                    ? "bg-gray-100 text-gray-950"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-950"
                }`}
              >

                {item.label}

                {isMessages &&
                  hasUnreadMessages && (
                    <span className="relative flex h-2.5 w-2.5">

                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4285F4] opacity-40" />

                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#4285F4]" />

                    </span>
                  )}

                {/* Active underline */}
                {active && (
                  <span className="absolute bottom-0 left-1/2 h-[2px] w-5 -translate-x-1/2 rounded-full bg-gray-900" />
                )}

              </button>
            );
          })}

          {/* DIVIDER */}
          <div className="mx-2 h-5 w-px bg-gray-200" />

          {/* SELL */}
          <button
            type="button"
            onClick={() =>
              router.push("/sell")
            }
            className={`group relative flex cursor-pointer items-center gap-2 overflow-hidden rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-300 ${
              pathname === "/sell"
                ? "bg-gray-800 text-white"
                : "bg-gray-950 text-white hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-md"
            }`}
          >

            <span className="relative z-10">
              Sell
            </span>

            <span className="relative z-10 text-gray-400 transition-transform duration-300 group-hover:translate-x-0.5">
              →
            </span>

            {/* Very subtle Google accent */}
            <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#34A853] transition-all duration-500 group-hover:w-full" />

          </button>

          {/* USER */}
          <div className="ml-2 flex items-center gap-2">

            {userName && (
              <div className="hidden max-w-[150px] truncate rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-500 lg:block">
                Hello, {userName}
              </div>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="cursor-pointer rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-all duration-300 hover:bg-gray-50 hover:text-gray-900"
            >
              Logout
            </button>

          </div>

        </div>

        {/* MOBILE ACTIONS */}
        <div className="flex items-center gap-2 md:hidden">

          <button
            type="button"
            onClick={() =>
              router.push("/messages")
            }
            className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-900"
            aria-label="Messages"
          >

            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path
                d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 2v-9.5A7.5 7.5 0 0 1 10.5 4H12.5A7.5 7.5 0 0 1 20 11.5Z"
              />
            </svg>

            {hasUnreadMessages && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#4285F4]" />
            )}

          </button>

          <button
            type="button"
            onClick={() =>
              router.push("/sell")
            }
            className="cursor-pointer rounded-lg bg-gray-950 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800"
          >
            Sell
          </button>

        </div>

      </div>

      {/* MOBILE NAV */}
      <div className="border-t border-gray-100 md:hidden">

        <div className="mx-auto flex max-w-7xl items-center justify-around px-2 py-2">

          {navItems.map((item) => {

            const active =
              pathname === item.path ||
              pathname.startsWith(
                `${item.path}/`
              );

            return (
              <button
                key={item.path}
                type="button"
                onClick={() =>
                  router.push(item.path)
                }
                className={`relative cursor-pointer px-3 py-2 text-xs font-medium transition-colors ${
                  active
                    ? "text-gray-950"
                    : "text-gray-400"
                }`}
              >
                {item.label}

                {item.path ===
                  "/messages" &&
                  hasUnreadMessages && (
                    <span className="absolute right-0 top-1 h-2 w-2 rounded-full bg-[#4285F4]" />
                  )}

              </button>
            );
          })}

          <button
            type="button"
            onClick={handleLogout}
            className="cursor-pointer px-3 py-2 text-xs font-medium text-gray-400 transition-colors hover:text-gray-900"
          >
            Logout
          </button>

        </div>

      </div>

    </nav>
  );
}

