"use client";

import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firestore";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
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

function MyListingsContent() {
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");
  const [sellingId, setSellingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        if (!auth.currentUser) {
          setLoading(false);
          return;
        }

        const q = query(
          collection(db, "listings"),
          where("sellerId", "==", auth.currentUser.uid)
        );

        const snapshot = await getDocs(q);

        const data = snapshot.docs.map((listingDoc) => ({
          id: listingDoc.id,
          ...listingDoc.data(),
        })) as Listing[];

        data.sort((a, b) => {
          if (a.status === "available" && b.status !== "available") {
            return -1;
          }

          if (a.status !== "available" && b.status === "available") {
            return 1;
          }

          return 0;
        });

        setListings(data);
      } catch (error) {
        console.error("Error fetching listings:", error);
        setError("Failed to load your listings.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, []);

  const handleDelete = async (listingId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing?"
    );

    if (!confirmed) return;

    setDeletingId(listingId);
    setError("");

    try {
      await deleteDoc(doc(db, "listings", listingId));

      setListings((currentListings) =>
        currentListings.filter(
          (listing) => listing.id !== listingId
        )
      );
    } catch (error) {
      console.error("Error deleting listing:", error);
      setError("Failed to delete listing. Please try again.");
    } finally {
      setDeletingId("");
    }
  };

  const handleMarkAsSold = async (listingId: string) => {
    setSellingId(listingId);
    setError("");

    try {
      await updateDoc(doc(db, "listings", listingId), {
        status: "sold",
        updatedAt: new Date(),
      });

      setListings((currentListings) =>
        currentListings.map((listing) =>
          listing.id === listingId
            ? { ...listing, status: "sold" }
            : listing
        )
      );
    } catch (error) {
      console.error("Error marking listing as sold:", error);
      setError("Failed to mark listing as sold.");
    } finally {
      setSellingId("");
    }
  };

  const availableCount = listings.filter(
    (listing) => listing.status === "available"
  ).length;

  const soldCount = listings.filter(
    (listing) => listing.status !== "available"
  ).length;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#fafafa] text-gray-900">
        <Navbar />

        <section className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
          <div className="animate-pulse">
            <div className="h-4 w-28 rounded bg-gray-200" />

            <div className="mt-5 h-12 w-72 rounded-xl bg-gray-200" />

            <div className="mt-4 h-5 w-96 max-w-full rounded bg-gray-200" />

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-3xl border border-gray-200 bg-white"
                >
                  <div className="h-56 bg-gray-200" />

                  <div className="space-y-4 p-5">
                    <div className="h-4 w-20 rounded bg-gray-200" />
                    <div className="h-6 w-3/4 rounded bg-gray-200" />
                    <div className="h-5 w-24 rounded bg-gray-200" />
                    <div className="h-10 w-full rounded-xl bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#fafafa] text-gray-900">
      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
        {/* HEADER */}
        <div className="my-listings-fade-in">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#4285F4]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#EA4335]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#FBBC05]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#34A853]" />

            <span className="ml-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Your CampusCart
            </span>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-4xl font-semibold tracking-[-0.04em] text-gray-950 sm:text-5xl">
                My listings.
              </h1>

              <p className="mt-4 max-w-xl text-base leading-7 text-gray-500">
                Keep track of everything you're selling on campus.
              </p>
            </div>

            <button
              type="button"
              onClick={() => router.push("/sell")}
              className="group relative w-full cursor-pointer overflow-hidden rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 hover:shadow-lg sm:w-auto"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                + Create listing
                <span className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>

              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] transition-all duration-500 group-hover:w-full" />
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="my-listings-fade-in my-listings-delay-1 mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_6px_25px_rgba(0,0,0,0.025)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
              Total listings
            </p>

            <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">
              {listings.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_6px_25px_rgba(0,0,0,0.025)]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#34A853]" />

              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                Available
              </p>
            </div>

            <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">
              {availableCount}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-[0_6px_25px_rgba(0,0,0,0.025)]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-gray-300" />

              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-400">
                Sold
              </p>
            </div>

            <p className="mt-2 text-3xl font-semibold tracking-tight text-gray-950">
              {soldCount}
            </p>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="my-listings-fade-in mt-6 rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* EMPTY STATE */}
        {listings.length === 0 ? (
          <div className="my-listings-fade-in my-listings-delay-2 mt-8 flex min-h-[420px] items-center justify-center rounded-3xl border border-gray-200 bg-white px-6 shadow-[0_10px_40px_rgba(0,0,0,0.025)]">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                <svg
                  className="h-7 w-7 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M4 7h16" />
                  <path d="M6 7v11a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7" />
                  <path d="M9 7V4h6v3" />
                  <path d="M10 11v5" />
                  <path d="M14 11v5" />
                </svg>
              </div>

              <h2 className="mt-6 text-xl font-semibold text-gray-950">
                Nothing here yet.
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                List something you no longer need and give it a
                second life on campus.
              </p>

              <button
                type="button"
                onClick={() => router.push("/sell")}
                className="mt-7 cursor-pointer rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
              >
                Create your first listing
              </button>
            </div>
          </div>
        ) : (
          /* LISTINGS */
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing, index) => {
              const isSold = listing.status !== "available";
              const isDeleting = deletingId === listing.id;
              const isSelling = sellingId === listing.id;

              return (
                <article
                  key={listing.id}
                  className="my-listings-fade-in group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_35px_rgba(0,0,0,0.035)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(0,0,0,0.07)]"
                  style={{
                    animationDelay: `${100 + index * 70}ms`,
                  }}
                >
                  {/* IMAGE */}
                  <button
                    type="button"
                    onClick={() =>
                      router.push(`/listing/${listing.id}`)
                    }
                    className="relative block h-56 w-full cursor-pointer overflow-hidden bg-gray-100 text-left"
                  >
                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt={listing.name}
                        className={`h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.035] ${
                          isSold ? "grayscale opacity-60" : ""
                        }`}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        No image
                      </div>
                    )}

                    {/* STATUS */}
                    <div className="absolute left-4 top-4">
                      {isSold ? (
                        <span className="rounded-full border border-gray-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-500 shadow-sm backdrop-blur">
                          Sold
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 rounded-full border border-white/70 bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm backdrop-blur">
                          <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34A853] opacity-50" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34A853]" />
                          </span>
                          Available
                        </span>
                      )}
                    </div>

                    {/* VIEW ARROW */}
                    <div className="absolute bottom-4 right-4 flex h-9 w-9 translate-y-2 items-center justify-center rounded-full bg-white/90 text-gray-500 opacity-0 shadow-sm backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                      →
                    </div>
                  </button>

                  {/* CONTENT */}
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="rounded-full bg-gray-100 px-3 py-1.5 text-[11px] font-semibold text-gray-500">
                        {listing.category}
                      </span>

                      <span className="text-xs font-medium text-gray-400">
                        {listing.condition}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        router.push(`/listing/${listing.id}`)
                      }
                      className="mt-4 block w-full cursor-pointer text-left"
                    >
                      <h2 className="line-clamp-2 text-lg font-semibold leading-6 tracking-[-0.02em] text-gray-950 transition-colors group-hover:text-gray-700">
                        {listing.name}
                      </h2>
                    </button>

                    <div className="mt-4 flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-gray-400">
                          Price
                        </p>

                        <p className="mt-0.5 text-xl font-semibold tracking-tight text-gray-950">
                          ₹{listing.price}
                        </p>
                      </div>

                      {!isSold && (
                        <span className="text-xs font-medium text-gray-400">
                          Active
                        </span>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="mt-5 border-t border-gray-100 pt-4">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/my-listings/${listing.id}/edit`
                            )
                          }
                          className="cursor-pointer rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                        >
                          Edit
                        </button>

                        {!isSold ? (
                          <button
                            type="button"
                            onClick={() =>
                              handleMarkAsSold(listing.id)
                            }
                            disabled={isSelling}
                            className="cursor-pointer rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isSelling ? "Updating..." : "Mark sold"}
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              router.push(`/listing/${listing.id}`)
                            }
                            className="cursor-pointer rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 hover:text-gray-950"
                          >
                            View
                          </button>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(listing.id)
                        }
                        disabled={isDeleting}
                        className="mt-2 w-full cursor-pointer rounded-xl px-3 py-2.5 text-xs font-semibold text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting
                          ? "Deleting..."
                          : "Delete listing"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <style jsx>{`
        .my-listings-fade-in {
          animation: myListingsFadeIn 0.7s
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .my-listings-delay-1 {
          animation-delay: 100ms;
        }

        .my-listings-delay-2 {
          animation-delay: 180ms;
        }

        @keyframes myListingsFadeIn {
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
          .my-listings-fade-in {
            animation: none;
          }
        }
      `}</style>
    </main>
  );
}

export default function MyListingsPage() {
  return (
    <AuthGuard>
      <MyListingsContent />
    </AuthGuard>
  );
}