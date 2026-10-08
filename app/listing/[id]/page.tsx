
"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firestore";
import { auth } from "@/lib/auth";
import { useParams, useRouter } from "next/navigation";
import AuthGuard from "@/components/authgaurd";
import Navbar from "@/components/navbar";

type Listing = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  condition: string;
  sellerId: string;
  status: string;
  imageUrl?: string;
};

function ListingContent() {
  const router = useRouter();
  const params = useParams();

  const listingId = params.id as string;

  const [listing, setListing] =
    useState<Listing | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [contacting, setContacting] =
    useState(false);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const listingQuery = query(
          collection(db, "listings"),
          where(
            "__name__",
            "==",
            listingId
          )
        );

        const snapshot =
          await getDocs(listingQuery);

        if (snapshot.empty) {
          setError("Listing not found.");
          return;
        }

        const listingDoc =
          snapshot.docs[0];

        setListing({
          id: listingDoc.id,
          ...listingDoc.data(),
        } as Listing);
      } catch (error) {
        console.error(
          "Error fetching listing:",
          error
        );

        setError(
          "Failed to load listing."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [listingId]);

  const handleContactSeller =
    async () => {
      if (
        !auth.currentUser ||
        !listing
      ) {
        return;
      }

      if (
        auth.currentUser.uid ===
        listing.sellerId
      ) {
        alert(
          "You cannot contact yourself."
        );
        return;
      }

      setContacting(true);

      try {
        const conversationsQuery =
          query(
            collection(
              db,
              "conversations"
            ),
            where(
              "listingId",
              "==",
              listing.id
            ),
            where(
              "participants",
              "array-contains",
              auth.currentUser.uid
            )
          );

        const snapshot =
          await getDocs(
            conversationsQuery
          );

        if (!snapshot.empty) {
          const existingConversation =
            snapshot.docs[0];

          router.push(
            `/messages/${existingConversation.id}`
          );

          return;
        }

        const conversationRef =
          await addDoc(
            collection(
              db,
              "conversations"
            ),
            {
              listingId:
                listing.id,

              listingName:
                listing.name,

              participants: [
                auth.currentUser.uid,
                listing.sellerId,
              ],

              unreadFor: [],

              createdAt:
                serverTimestamp(),

              updatedAt:
                serverTimestamp(),
            }
          );

        router.push(
          `/messages/${conversationRef.id}`
        );
      } catch (error) {
        console.error(
          "Error starting conversation:",
          error
        );

        alert(
          "Failed to contact seller."
        );
      } finally {
        setContacting(false);
      }
    };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fafafa] text-gray-900">
        <Navbar />

        <section className="mx-auto max-w-5xl px-6 py-12">

          <div className="animate-pulse">

            <div className="h-4 w-36 rounded bg-gray-200" />

            <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">

              <div className="h-[500px] rounded-3xl bg-gray-200" />

              <div className="space-y-5">

                <div className="h-6 w-24 rounded bg-gray-200" />

                <div className="h-12 w-3/4 rounded bg-gray-200" />

                <div className="h-10 w-32 rounded bg-gray-200" />

                <div className="h-32 rounded-2xl bg-gray-200" />

              </div>

            </div>

          </div>

        </section>
      </main>
    );
  }

  if (error || !listing) {
    return (
      <main className="min-h-screen bg-[#fafafa] text-gray-900">
        <Navbar />

        <section className="flex min-h-[70vh] items-center justify-center px-6">

          <div className="listing-fade-in w-full max-w-md rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">

              <span className="text-xl text-gray-400">
                ?
              </span>

            </div>

            <h1 className="mt-5 text-xl font-semibold">
              {error ||
                "Listing not found."}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              This listing may have been
              removed or is no longer
              available.
            </p>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/marketplace"
                )
              }
              className="mt-7 cursor-pointer rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
            >
              Back to Marketplace
            </button>

          </div>

        </section>
      </main>
    );
  }

  const isSold =
    listing.status !== "available";

  const isOwner =
    auth.currentUser?.uid ===
    listing.sellerId;

  return (
    <main className="min-h-screen bg-[#fafafa] text-gray-900">

      <Navbar />

      {/* PAGE */}
      <section className="mx-auto max-w-6xl px-6 py-10 sm:py-14">

        {/* BACK */}
        <button
          type="button"
          onClick={() =>
            router.push(
              "/marketplace"
            )
          }
          className="listing-fade-in mb-8 flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-400 transition hover:text-gray-900"
        >
          <span className="text-lg transition-transform duration-300 group-hover:-translate-x-1">
            ←
          </span>

          Back to marketplace
        </button>

        {/* PRODUCT GRID */}
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">

          {/* IMAGE */}
          <div className="listing-fade-in">

            <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_12px_40px_rgba(0,0,0,0.05)]">

              {listing.imageUrl ? (
                <img
                  src={listing.imageUrl}
                  alt={listing.name}
                  className={`h-[420px] w-full object-cover transition duration-700 ease-out group-hover:scale-[1.025] sm:h-[520px] ${
                    isSold
                      ? "opacity-60 grayscale"
                      : ""
                  }`}
                />
              ) : (
                <div className="flex h-[420px] items-center justify-center text-sm text-gray-400 sm:h-[520px]">
                  No image available
                </div>
              )}

              {/* TOP BADGE */}
              <div className="absolute left-5 top-5">

                {isSold ? (
                  <span className="rounded-full border border-gray-200 bg-white/90 px-4 py-2 text-xs font-semibold text-gray-500 shadow-sm backdrop-blur">
                    Sold
                  </span>
                ) : (
                  <span className="flex items-center gap-2 rounded-full border border-white/60 bg-white/90 px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur">

                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34A853] opacity-50" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34A853]" />
                    </span>

                    Available

                  </span>
                )}

              </div>

            </div>

            {/* GOOGLE ACCENT LINE */}
            <div className="mt-4 flex h-1 overflow-hidden rounded-full opacity-70">

              <span className="w-[25%] bg-[#4285F4]" />
              <span className="w-[25%] bg-[#EA4335]" />
              <span className="w-[25%] bg-[#FBBC05]" />
              <span className="w-[25%] bg-[#34A853]" />

            </div>

          </div>

          {/* DETAILS */}
          <div className="listing-fade-in listing-delay-1">

            {/* CATEGORY */}
            <div className="flex items-center gap-2">

              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500">
                {listing.category}
              </span>

              <span className="text-gray-300">
                •
              </span>

              <span className="text-xs font-medium text-gray-400">
                {listing.condition}
              </span>

            </div>

            {/* TITLE */}
            <h1 className="mt-5 text-4xl font-semibold tracking-[-0.035em] text-gray-950 sm:text-5xl">
              {listing.name}
            </h1>

            {/* PRICE */}
            <div className="mt-7">

              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                Asking price
              </p>

              <p className="mt-1 text-4xl font-semibold tracking-tight text-gray-950">
                ₹{listing.price}
              </p>

            </div>

            {/* DESCRIPTION */}
            <div className="mt-9 border-t border-gray-200 pt-8">

              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-400">
                About this item
              </h2>

              <p className="mt-4 whitespace-pre-wrap text-[15px] leading-7 text-gray-600">
                {listing.description}
              </p>

            </div>

            {/* ACTION */}
            <div className="mt-9">

              {isOwner ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100">
                      <span className="text-sm">
                        ✓
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-semibold">
                        This is your listing
                      </p>

                      <p className="mt-0.5 text-xs text-gray-400">
                        Manage it from My Listings.
                      </p>
                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/my-listings"
                      )
                    }
                    className="mt-4 w-full cursor-pointer rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold transition hover:bg-gray-50"
                  >
                    Manage Listing
                  </button>

                </div>

              ) : isSold ? (
                <div className="rounded-2xl border border-gray-200 bg-gray-100 p-5 text-center">

                  <p className="text-sm font-semibold text-gray-500">
                    This item has been sold.
                  </p>

                  <p className="mt-1 text-xs text-gray-400">
                    It is no longer available.
                  </p>

                </div>

              ) : (
                <button
                  type="button"
                  onClick={
                    handleContactSeller
                  }
                  disabled={
                    contacting
                  }
                  className="group relative w-full cursor-pointer overflow-hidden rounded-2xl bg-gray-950 px-6 py-4 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-gray-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >

                  <span className="relative z-10 flex items-center justify-center gap-3">

                    {contacting
                      ? "Opening conversation..."
                      : "Contact Seller"}

                    {!contacting && (
                      <span className="transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    )}

                  </span>

                  {/* GOOGLE ACCENT */}
                  <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] transition-all duration-500 group-hover:w-full" />

                </button>
              )}

            </div>

            {/* TRUST CARD */}
            <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">

              <div className="flex items-start gap-4">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100">

                  <svg
                    className="h-5 w-5 text-gray-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                  >
                    <path d="M12 3 5 6v5c0 4.5 2.8 8.1 7 10 4.2-1.9 7-5.5 7-10V6l-7-3Z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>

                </div>

                <div>

                  <p className="text-sm font-semibold">
                    Campus-to-campus
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-400">
                    Connect directly with the
                    seller and arrange a convenient
                    campus handoff.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      <style jsx>{`
        .listing-fade-in {
          animation: listingFadeIn 0.7s
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .listing-delay-1 {
          animation-delay: 120ms;
        }

        @keyframes listingFadeIn {
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
          .listing-fade-in {
            animation: none;
          }
        }
      `}</style>

    </main>
  );
}

export default function ListingPage() {
  return (
    <AuthGuard>
      <ListingContent />
    </AuthGuard>
  );
}

