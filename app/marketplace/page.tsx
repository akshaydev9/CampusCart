"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firestore";
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

function MarketplaceContent() {
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const snapshot = await getDocs(
          collection(db, "listings")
        );

        const data = snapshot.docs.map((listingDoc) => ({
          id: listingDoc.id,
          ...listingDoc.data(),
        })) as Listing[];

        setListings(data);
      } catch (error) {
        console.error(
          "Error fetching listings:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchListings();
  }, []);

  const filteredListings = listings.filter((listing) => {
    const searchTerm = search.toLowerCase();

    const matchesStatus =
      listing.status === "available";

    const matchesSearch =
      listing.name
        .toLowerCase()
        .includes(searchTerm) ||
      listing.description
        .toLowerCase()
        .includes(searchTerm);

    const matchesCategory =
      category === "All" ||
      listing.category === category;

    return (
      matchesStatus &&
      matchesSearch &&
      matchesCategory
    );
  });

  return (
    <main className="min-h-screen bg-[#fafafa] text-gray-900">

      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-gray-200 bg-white">

        {/* Very subtle Google-colour glow */}
        <div className="pointer-events-none absolute left-1/2 top-[-200px] h-[420px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-100/20 via-yellow-100/20 to-green-100/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-20 sm:pb-20 sm:pt-24">

          <div className="max-w-3xl">

            {/* GOOGLE-COLOUR ACCENT */}
            <div className="marketplace-fade-in mb-5 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500">

              <span className="flex gap-[3px]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#4285F4]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#EA4335]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#FBBC05]" />
                <span className="h-1.5 w-1.5 rounded-full bg-[#34A853]" />
              </span>

              Your campus marketplace

            </div>

            <h1 className="marketplace-fade-in marketplace-delay-1 text-5xl font-semibold tracking-[-0.04em] text-gray-950 sm:text-6xl lg:text-7xl">
              Buy and sell
              <br />
              <span className="text-gray-400">
                on campus.
              </span>
            </h1>

            <p className="marketplace-fade-in marketplace-delay-2 mt-6 max-w-2xl text-base leading-7 text-gray-500 sm:text-lg">
              Find textbooks, electronics, college
              supplies, and more from people around
              your campus.
            </p>

          </div>

          {/* SEARCH */}
          <div className="marketplace-fade-in marketplace-delay-3 mt-10 max-w-3xl">

            <div className="group relative">

              <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-100/30 via-red-100/20 to-green-100/30 opacity-0 blur-xl transition duration-500 group-focus-within:opacity-100" />

              <div className="relative flex items-center rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition duration-300 focus-within:border-gray-300 focus-within:shadow-[0_12px_40px_rgba(0,0,0,0.08)]">

                <svg
                  className="ml-5 h-5 w-5 shrink-0 text-gray-400 transition-colors duration-300 group-focus-within:text-[#4285F4]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />

                  <path d="m20 20-4-4" />
                </svg>

                <input
                  type="text"
                  placeholder="Search for anything..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="w-full bg-transparent px-4 py-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 sm:text-base"
                />

                {search && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearch("")
                    }
                    className="mr-3 flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* MARKETPLACE CONTENT */}
      <section className="mx-auto max-w-7xl px-6 py-10 sm:py-14">

        {/* FILTERS */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex flex-wrap gap-2">

            {[
              "All",
              "Books",
              "Electronics",
              "College Supplies",
              "Other",
            ].map((item) => {

              const active =
                category === item;

              return (
                <button
                  type="button"
                  key={item}
                  onClick={() =>
                    setCategory(item)
                  }
                  className={`cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${
                    active
                      ? "bg-gray-950 text-white shadow-sm"
                      : "border border-gray-200 bg-white text-gray-500 hover:-translate-y-0.5 hover:border-gray-300 hover:text-gray-900 hover:shadow-sm"
                  }`}
                >
                  {item}
                </button>
              );
            })}

          </div>

          {!loading && (
            <p className="text-sm text-gray-400">
              {filteredListings.length}{" "}
              {filteredListings.length === 1
                ? "listing"
                : "listings"}
            </p>
          )}

        </div>

        {/* TITLE */}
        <div className="mt-12 flex items-end justify-between">

          <div>

            <div className="flex items-center gap-2">

              <span className="h-1.5 w-1.5 rounded-full bg-[#4285F4]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#EA4335]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#FBBC05]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#34A853]" />

              <p className="ml-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Marketplace
              </p>

            </div>

            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-gray-950">
              Latest listings
            </h2>

          </div>

        </div>

        {/* LOADING */}
        {loading ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white"
                >

                  <div className="marketplace-shimmer h-56 bg-gray-100" />

                  <div className="space-y-4 p-5">

                    <div className="marketplace-shimmer h-5 w-3/4 rounded bg-gray-100" />

                    <div className="marketplace-shimmer h-4 w-1/3 rounded bg-gray-100" />

                    <div className="marketplace-shimmer h-4 w-1/2 rounded bg-gray-100" />

                  </div>

                </div>
              )
            )}

          </div>

        ) : filteredListings.length === 0 ? (

          /* EMPTY */
          <div className="marketplace-fade-in mt-8 overflow-hidden rounded-3xl border border-gray-200 bg-white">

            <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">

              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">

                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-[#EA4335]" />
                <div className="absolute -bottom-1 -left-1 h-2 w-2 rounded-full bg-[#34A853]" />

                <svg
                  className="h-6 w-6 text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                  />

                  <path d="m20 20-4-4" />
                </svg>

              </div>

              <h3 className="mt-5 text-lg font-semibold text-gray-900">
                Nothing found
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                Try changing your search or
                selecting a different category.
              </p>

              {(search ||
                category !== "All") && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                  }}
                  className="mt-6 cursor-pointer rounded-lg bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
                >
                  Clear filters
                </button>
              )}

            </div>

          </div>

        ) : (

          /* LISTINGS */
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {filteredListings.map(
              (listing, index) => (
                <button
                  type="button"
                  key={listing.id}
                  onClick={() =>
                    router.push(
                      `/listing/${listing.id}`
                    )
                  }
                  className="marketplace-card marketplace-fade-in group cursor-pointer overflow-hidden rounded-2xl border border-gray-200 bg-white text-left transition-all duration-500 hover:-translate-y-1 hover:border-gray-300 hover:shadow-[0_18px_50px_rgba(0,0,0,0.08)]"
                  style={{
                    animationDelay: `${index * 70}ms`,
                  }}
                >

                  {/* IMAGE */}
                  <div className="relative h-56 overflow-hidden bg-gray-100">

                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt={listing.name}
                        className="h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        No image
                      </div>
                    )}

                    <div className="pointer-events-none absolute inset-0 bg-black/[0.03] transition duration-500 group-hover:bg-black/[0.06]" />

                    {/* CATEGORY */}
                    <div className="absolute left-4 top-4 rounded-full border border-white/60 bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm backdrop-blur">
                      {listing.category}
                    </div>

                  </div>

                  {/* CARD */}
                  <div className="p-5">

                    <div className="flex items-start justify-between gap-4">

                      <h3 className="line-clamp-2 text-[15px] font-semibold leading-6 text-gray-900">
                        {listing.name}
                      </h3>

                      <span className="shrink-0 text-base font-semibold tracking-tight text-gray-950">
                        ₹{listing.price}
                      </span>

                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-gray-400">

                      <span>
                        {listing.condition}
                      </span>

                      <span className="h-1 w-1 rounded-full bg-gray-300" />

                      <span>
                        Available
                      </span>

                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">

                      <span className="text-xs text-gray-400">
                        View listing
                      </span>

                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition-all duration-300 group-hover:translate-x-1 group-hover:border-[#4285F4] group-hover:bg-[#4285F4] group-hover:text-white">
                        →
                      </span>

                    </div>

                  </div>

                </button>
              )
            )}

          </div>

        )}

      </section>

      <style jsx>{`
        .marketplace-fade-in {
          animation: marketplaceFadeIn 0.7s
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .marketplace-delay-1 {
          animation-delay: 80ms;
        }

        .marketplace-delay-2 {
          animation-delay: 160ms;
        }

        .marketplace-delay-3 {
          animation-delay: 240ms;
        }

        .marketplace-shimmer {
          position: relative;
          overflow: hidden;
        }

        .marketplace-shimmer::after {
          content: "";
          position: absolute;
          inset: 0;
          transform: translateX(-100%);
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.7),
            transparent
          );
          animation: marketplaceShimmer 1.5s infinite;
        }

        @keyframes marketplaceFadeIn {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes marketplaceShimmer {
          100% {
            transform: translateX(100%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .marketplace-fade-in,
          .marketplace-shimmer::after {
            animation: none;
          }

          .marketplace-card,
          .marketplace-card img {
            transition: none;
          }
        }
      `}</style>

    </main>
  );
}

export default function MarketplacePage() {
  return (
    <AuthGuard>
      <MarketplaceContent />
    </AuthGuard>
  );
}

