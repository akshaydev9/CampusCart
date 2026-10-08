"use client";

import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firestore";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/authgaurd";
import Navbar from "@/components/navbar";

type Conversation = {
  id: string;
  listingId: string;
  listingName: string;
  participants: string[];
  unreadFor?: string[];
  updatedAt?: {
    seconds: number;
  };
};

function MessagesContent() {
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;

    if (!user) {
      setLoading(false);
      return;
    }

    const conversationsQuery = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid)
    );

    const unsubscribe = onSnapshot(
      conversationsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((conversationDoc) => ({
          id: conversationDoc.id,
          ...conversationDoc.data(),
        })) as Conversation[];

        data.sort((a, b) => {
          const aTime = a.updatedAt?.seconds || 0;
          const bTime = b.updatedAt?.seconds || 0;

          return bTime - aTime;
        });

        setConversations(data);
        setLoading(false);
      },
      (error) => {
        console.error("Messages listener error:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const formatTime = (timestamp?: { seconds: number }) => {
    if (!timestamp) return "";

    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();

    const sameDay =
      date.toDateString() === now.toDateString();

    if (sameDay) {
      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    return date.toLocaleDateString([], {
      day: "numeric",
      month: "short",
    });
  };

  const unreadCount = conversations.filter((conversation) =>
    conversation.unreadFor?.includes(auth.currentUser?.uid || "")
  ).length;

  return (
    <main className="min-h-screen bg-[#fafafa] text-gray-900">
      <Navbar />

      <section className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
        {/* HEADER */}
        <div className="messages-fade-in">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4285F4]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#EA4335]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#FBBC05]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#34A853]" />

            <span className="ml-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              CampusCart
            </span>
          </div>

          <div className="mt-5 flex items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-gray-950 sm:text-5xl">
                Messages.
              </h1>

              <p className="mt-4 text-base leading-7 text-gray-500">
                Conversations with people on campus.
              </p>
            </div>

            {unreadCount > 0 && (
              <div className="hidden items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600 sm:flex">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#4285F4] opacity-50" />
                  <span className="relative h-2 w-2 rounded-full bg-[#4285F4]" />
                </span>

                {unreadCount} unread
              </div>
            )}
          </div>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="mt-10 space-y-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="animate-pulse rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="h-11 w-11 rounded-full bg-gray-200" />

                  <div className="flex-1">
                    <div className="h-4 w-40 rounded bg-gray-200" />
                    <div className="mt-2 h-3 w-56 rounded bg-gray-200" />
                  </div>

                  <div className="h-3 w-12 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          /* EMPTY */
          <div className="messages-fade-in messages-delay-1 mt-10 flex min-h-[420px] items-center justify-center rounded-3xl border border-gray-200 bg-white px-6 shadow-[0_10px_40px_rgba(0,0,0,0.025)]">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                <svg
                  className="h-7 w-7 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 2 1.5-4A7.5 7.5 0 1 1 20 11.5Z" />
                </svg>
              </div>

              <h2 className="mt-6 text-xl font-semibold text-gray-950">
                No conversations yet.
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                When you contact a seller, your conversation will
                appear here.
              </p>

              <button
                type="button"
                onClick={() => router.push("/marketplace")}
                className="mt-7 cursor-pointer rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
              >
                Browse Marketplace
              </button>
            </div>
          </div>
        ) : (
          /* CONVERSATIONS */
          <div className="messages-fade-in messages-delay-1 mt-10 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.035)]">
            {conversations.map((conversation, index) => {
              const unread =
                conversation.unreadFor?.includes(
                  auth.currentUser?.uid || ""
                ) || false;

              return (
                <button
                  key={conversation.id}
                  type="button"
                  onClick={() =>
                    router.push(
                      `/messages/${conversation.id}`
                    )
                  }
                  className={`group relative flex w-full cursor-pointer items-center gap-4 px-5 py-5 text-left transition-all duration-300 hover:bg-gray-50 sm:px-6 ${
                    index !== conversations.length - 1
                      ? "border-b border-gray-100"
                      : ""
                  }`}
                >
                  {/* UNREAD ACCENT */}
                  {unread && (
                    <span className="absolute bottom-0 left-0 top-0 w-[2px] bg-[#4285F4]" />
                  )}

                  {/* AVATAR */}
                  <div
                    className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition duration-300 group-hover:scale-105 ${
                      unread
                        ? "bg-blue-50 text-[#4285F4]"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 2 1.5-4A7.5 7.5 0 1 1 20 11.5Z" />
                    </svg>

                    {unread && (
                      <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-white bg-[#4285F4]" />
                    )}
                  </div>

                  {/* TEXT */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h2
                        className={`truncate text-sm ${
                          unread
                            ? "font-bold text-gray-950"
                            : "font-semibold text-gray-800"
                        }`}
                      >
                        {conversation.listingName}
                      </h2>

                      {unread && (
                        <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#4285F4]">
                          New
                        </span>
                      )}
                    </div>

                    <p className="mt-1 truncate text-xs text-gray-400">
                      Conversation about this listing
                    </p>
                  </div>

                  {/* TIME + ARROW */}
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-[11px] font-medium text-gray-400">
                      {formatTime(conversation.updatedAt)}
                    </span>

                    <span className="text-gray-300 transition-all duration-300 group-hover:translate-x-1 group-hover:text-[#4285F4]">
                      →
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </section>

      <style jsx>{`
        .messages-fade-in {
          animation: messagesFadeIn 0.7s
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .messages-delay-1 {
          animation-delay: 120ms;
        }

        @keyframes messagesFadeIn {
          from {
            opacity: 0;
            transform: translateY(16px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .messages-fade-in {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}

export default function MessagesPage() {
  return (
    <AuthGuard>
      <MessagesContent />
    </AuthGuard>
  );
}