"use client";

import { useEffect, useRef, useState } from "react";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firestore";
import { auth } from "@/lib/auth";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/authgaurd";
import Navbar from "@/components/navbar";

type Conversation = {
  id: string;
  listingId: string;
  listingName: string;
  participants: string[];
  unreadFor?: string[];
};

type Message = {
  id: string;
  senderId: string;
  text: string;
  createdAt?: {
    seconds: number;
  };
};

function ChatContent() {
  const router = useRouter();
  const params = useParams();

  const conversationId = params.id as string;

  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  /* LOAD CONVERSATION */
  useEffect(() => {
    const user = auth.currentUser;

    if (!conversationId || !user) {
      setLoading(false);
      return;
    }

    let unsubscribeMessages: (() => void) | null = null;

    const loadConversation = async () => {
      try {
        const conversationRef = doc(
          db,
          "conversations",
          conversationId
        );

        const conversationSnapshot =
          await getDoc(conversationRef);

        if (!conversationSnapshot.exists()) {
          setError("Conversation not found.");
          setLoading(false);
          return;
        }

        const data = conversationSnapshot.data();

        /* CHECK ACCESS */
        if (!data.participants?.includes(user.uid)) {
          setError(
            "You do not have access to this conversation."
          );
          setLoading(false);
          return;
        }

        setConversation({
          id: conversationSnapshot.id,
          ...data,
        } as Conversation);

        /* MARK AS READ */
        if (data.unreadFor?.includes(user.uid)) {
          await updateDoc(conversationRef, {
            unreadFor: arrayRemove(user.uid),
          });
        }

        /* REALTIME MESSAGES */
        const messagesQuery = query(
          collection(
            db,
            "conversations",
            conversationId,
            "messages"
          ),
          orderBy("createdAt", "asc")
        );

        unsubscribeMessages = onSnapshot(
          messagesQuery,
          (snapshot) => {
            const messageData = snapshot.docs.map(
              (messageDoc) => ({
                id: messageDoc.id,
                ...messageDoc.data(),
              })
            ) as Message[];

            setMessages(messageData);
            setLoading(false);
          },
          (snapshotError) => {
            console.error(
              "Messages listener error:",
              snapshotError
            );

            setError("Failed to load messages.");
            setLoading(false);
          }
        );
      } catch (error) {
        console.error(
          "Error loading conversation:",
          error
        );

        setError("Failed to load conversation.");
        setLoading(false);
      }
    };

    loadConversation();

    return () => {
      if (unsubscribeMessages) {
        unsubscribeMessages();
      }
    };
  }, [conversationId]);

  /* AUTO SCROLL */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /* FORMAT MESSAGE TIME */
  const formatTime = (
    timestamp?: { seconds: number }
  ) => {
    if (!timestamp) return "";

    return new Date(
      timestamp.seconds * 1000
    ).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  /* SEND MESSAGE */
  const sendMessage = async () => {
    const user = auth.currentUser;

    if (
      !user ||
      !conversation ||
      !messageText.trim() ||
      sending
    ) {
      return;
    }

    const text = messageText.trim();

    setSending(true);
    setMessageText("");

    try {
      const otherParticipant =
        conversation.participants.find(
          (participant) =>
            participant !== user.uid
        );

      await addDoc(
        collection(
          db,
          "conversations",
          conversationId,
          "messages"
        ),
        {
          senderId: user.uid,
          text,
          createdAt: serverTimestamp(),
        }
      );

      if (otherParticipant) {
        await updateDoc(
          doc(
            db,
            "conversations",
            conversationId
          ),
          {
            unreadFor: arrayUnion(
              otherParticipant
            ),
            updatedAt: serverTimestamp(),
          }
        );
      }
    } catch (error) {
      console.error(
        "Error sending message:",
        error
      );

      setMessageText(text);
      alert("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  /* ENTER TO SEND */
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };

  /* LOADING */
  if (loading) {
    return (
      <main className="min-h-screen bg-[#fafafa] text-gray-900">
        <Navbar />

        <section className="mx-auto max-w-4xl px-6 py-8">
          <div className="animate-pulse overflow-hidden rounded-3xl border border-gray-200 bg-white">
            <div className="border-b border-gray-200 p-5">
              <div className="h-4 w-24 rounded bg-gray-200" />

              <div className="mt-3 h-6 w-64 rounded bg-gray-200" />
            </div>

            <div className="h-[500px] space-y-6 p-6">
              <div className="flex justify-start">
                <div className="h-12 w-48 rounded-2xl bg-gray-200" />
              </div>

              <div className="flex justify-end">
                <div className="h-12 w-56 rounded-2xl bg-gray-200" />
              </div>

              <div className="flex justify-start">
                <div className="h-16 w-64 rounded-2xl bg-gray-200" />
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* ERROR */
  if (error || !conversation) {
    return (
      <main className="min-h-screen bg-[#fafafa] text-gray-900">
        <Navbar />

        <section className="flex min-h-[70vh] items-center justify-center px-6">
          <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
              ?
            </div>

            <h1 className="mt-5 text-xl font-semibold">
              {error || "Conversation not found."}
            </h1>

            <button
              type="button"
              onClick={() =>
                router.push("/messages")
              }
              className="mt-7 cursor-pointer rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
            >
              Back to Messages
            </button>
          </div>
        </section>
      </main>
    );
  }

  const currentUserId =
    auth.currentUser?.uid ?? "";

  return (
    <main className="min-h-screen bg-[#fafafa] text-gray-900">
      <Navbar />

      <section className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="chat-fade-in overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_12px_45px_rgba(0,0,0,0.045)]">

          {/* HEADER */}
          <div className="border-b border-gray-200 bg-white px-5 py-4 sm:px-6">
            <div className="flex items-center gap-4">

              <button
                type="button"
                onClick={() =>
                  router.push("/messages")
                }
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
              >
                ←
              </button>

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                >
                  <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H7l-4 2 1.5-4A7.5 7.5 0 1 1 20 11.5Z" />
                </svg>
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-400">
                  Conversation
                </p>

                <h1 className="truncate text-sm font-semibold text-gray-950 sm:text-base">
                  {conversation.listingName}
                </h1>
              </div>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/listing/${conversation.listingId}`
                  )
                }
                className="hidden cursor-pointer rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-950 sm:block"
              >
                View listing
              </button>
            </div>
          </div>

          {/* GOOGLE ACCENT */}
          <div className="flex h-[2px] w-full opacity-60">
            <span className="w-1/4 bg-[#4285F4]" />
            <span className="w-1/4 bg-[#EA4335]" />
            <span className="w-1/4 bg-[#FBBC05]" />
            <span className="w-1/4 bg-[#34A853]" />
          </div>

          {/* MESSAGES */}
          <div className="h-[55vh] min-h-[400px] overflow-y-auto bg-[#fafafa] px-4 py-6 sm:px-6">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm">
                    💬
                  </div>

                  <p className="mt-4 text-sm font-semibold text-gray-700">
                    Start the conversation
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    Send a message to the seller.
                  </p>

                </div>
              </div>
            ) : (
              <div className="space-y-3">

                {messages.map((message) => {
                  const isMine =
                    message.senderId ===
                    currentUserId;

                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isMine
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] sm:max-w-[65%] ${
                          isMine
                            ? "items-end"
                            : "items-start"
                        }`}
                      >
                        <div
                          className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                            isMine
                              ? "rounded-br-md bg-gray-950 text-white"
                              : "rounded-bl-md border border-gray-200 bg-white text-gray-700"
                          }`}
                        >
                          {message.text}
                        </div>

                        <p
                          className={`mt-1.5 text-[10px] text-gray-400 ${
                            isMine
                              ? "text-right"
                              : "text-left"
                          }`}
                        >
                          {formatTime(
                            message.createdAt
                          )}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* INPUT */}
          <div className="border-t border-gray-200 bg-white p-4 sm:p-5">
            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-[#fafafa] p-1.5 transition focus-within:border-gray-300 focus-within:bg-white focus-within:shadow-sm">

              <input
                type="text"
                value={messageText}
                onChange={(event) =>
                  setMessageText(
                    event.target.value
                  )
                }
                onKeyDown={handleKeyDown}
                placeholder="Write a message..."
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400"
              />

              <button
                type="button"
                onClick={sendMessage}
                disabled={
                  sending ||
                  !messageText.trim()
                }
                className="group relative flex h-10 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-gray-950 px-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="relative z-10">
                  {sending ? "..." : "Send"}
                </span>

                <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] transition-all duration-500 group-hover:w-full" />
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between px-1">

              <p className="text-[10px] text-gray-400">
                Press Enter to send
              </p>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/listing/${conversation.listingId}`
                  )
                }
                className="cursor-pointer text-[10px] font-medium text-gray-400 transition hover:text-gray-900 sm:hidden"
              >
                View listing →
              </button>

            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .chat-fade-in {
          animation: chatFadeIn 0.7s
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        @keyframes chatFadeIn {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .chat-fade-in {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}

export default function ChatPage() {
  return (
    <AuthGuard>
      <ChatContent />
    </AuthGuard>
  );
}