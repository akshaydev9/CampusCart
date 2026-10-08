
"use client";

import { useEffect, useState } from "react";
import {
  addDoc,
  collection,
  doc,
  getDoc,
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
  campus?: string;
};

function ListingContent() {
  const router = useRouter();
  const params = useParams();

  const rawId = params?.id;
  const listingId = Array.isArray(rawId) ? rawId[0] : rawId;

  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [contacting, setContacting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchListing() {
      if (!listingId) {
        setError("Listing not found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const listingRef = doc(db, "listings", listingId);
        const snapshot = await getDoc(listingRef);

        if (cancelled) return;

        if (!snapshot.exists()) {
          setListing(null);
          setError("Listing not found. It may have been deleted.");
          return;
        }

        const data = snapshot.data();

        setListing({
          ...data,
          id: snapshot.id,
        } as Listing);
      } catch (err) {
        console.error("Error fetching listing:", err);

        if (!cancelled) {
          setError(
            "Unable to load this listing. Check your connection and permissions."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchListing();

    return () => {
      cancelled = true;
    };
  }, [listingId]);

  const handleContactSeller = async () => {
    const user = auth.currentUser;

    if (!user) {
      alert("Please log in to contact the seller.");
      router.push("/");
      return;
    }

    if (!listing) return;

    if (user.uid === listing.sellerId) {
      alert("This is your listing. You cannot contact yourself.");
      return;
    }

    if (listing.status?.toLowerCase() === "sold") {
      alert("This listing has already been sold.");
      return;
    }

    setContacting(true);

    try {
      const conversationsQuery = query(
        collection(db, "conversations"),
        where("listingId", "==", listing.id),
        where("participants", "array-contains", user.uid)
      );

      const conversationsSnapshot = await getDocs(conversationsQuery);

      const existingConversation = conversationsSnapshot.docs.find((item) => {
        const data = item.data();
        return (
          Array.isArray(data.participants) &&
          data.participants.includes(listing.sellerId)
        );
      });

      if (existingConversation) {
        router.push(`/messages/${existingConversation.id}`);
        return;
      }

      const conversationRef = await addDoc(
        collection(db, "conversations"),
        {
          listingId: listing.id,
          listingName: listing.name,
          participants: [user.uid, listing.sellerId],
          unreadFor: [listing.sellerId],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }
      );

      router.push(`/messages/${conversationRef.id}`);
    } catch (err) {
      console.error("Error contacting seller:", err);
      alert(
        "Could not start a conversation. Check your Firestore permissions and try again."
      );
    } finally {
      setContacting(false);
    }
  };

  const isOwner =
    !!auth.currentUser &&
    !!listing &&
    auth.currentUser.uid === listing.sellerId;

  const isSold = listing?.status?.toLowerCase() === "sold";

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-gray-100"
        >
          <span aria-hidden="true">←</span>
          Back
        </button>

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
            <p className="text-gray-600">Loading listing...</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <h1 className="text-xl font-bold text-gray-900">
              Could not open listing
            </h1>
            <p className="mt-3 text-sm text-red-600">{error}</p>

            <button
              onClick={() => router.push("/marketplace")}
              className="mt-6 rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Back to Marketplace
            </button>
          </div>
        ) : listing ? (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {listing.imageUrl ? (
                <img
                  src={listing.imageUrl}
                  alt={listing.name}
                  className="h-80 w-full object-contain p-4 sm:h-[460px]"
                />
              ) : (
                <div className="flex h-80 items-center justify-center bg-gray-100 text-gray-400 sm:h-[460px]">
                  No image available
                </div>
              )}
            </div>

            <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
              <div className="mb-4 flex flex-wrap gap-2">
                {listing.category && (
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {listing.category}
                  </span>
                )}

                {listing.condition && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                    {listing.condition}
                  </span>
                )}

                {isSold && (
                  <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700">
                    Sold
                  </span>
                )}
              </div>

              <h1 className="break-words text-3xl font-bold tracking-tight">
                {listing.name}
              </h1>

              <p className="mt-4 text-3xl font-extrabold text-blue-700">
                ₹{Number(listing.price || 0).toLocaleString("en-IN")}
              </p>

              <div className="my-6 border-t border-gray-100" />

              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                Description
              </h2>

              <p className="mt-3 whitespace-pre-wrap break-words leading-7 text-gray-700">
                {listing.description || "No description provided."}
              </p>

              {listing.campus && (
                <div className="mt-6">
                  <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">
                    Campus
                  </h2>
                  <p className="mt-2 text-gray-700">{listing.campus}</p>
                </div>
              )}

              <div className="mt-8 border-t border-gray-100 pt-6">
                {isOwner ? (
                  <div className="rounded-xl bg-blue-50 p-4">
                    <p className="font-semibold text-blue-900">
                      This is your listing.
                    </p>
                    <p className="mt-1 text-sm text-blue-800">
                      You can manage or edit it from My Listings.
                    </p>

                    <button
                      onClick={() => router.push("/my-listings")}
                      className="mt-4 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
                    >
                      Manage My Listings
                    </button>
                  </div>
                ) : isSold ? (
                  <button
                    disabled
                    className="w-full cursor-not-allowed rounded-lg bg-gray-200 px-5 py-3 font-semibold text-gray-500"
                  >
                    This item has been sold
                  </button>
                ) : (
                  <button
                    onClick={handleContactSeller}
                    disabled={contacting}
                    className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {contacting ? "Opening chat..." : "Contact Seller"}
                  </button>
                )}

                <p className="mt-3 text-center text-xs text-gray-500">
                  {isOwner
                    ? "Only you should be able to edit your listing."
                    : "Contact the seller to discuss this item."}
                </p>
              </div>
            </section>
          </div>
        ) : null}
      </div>
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
