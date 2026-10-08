"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firestore";
import { auth } from "@/lib/auth";
import AuthGuard from "@/components/authgaurd";
import Navbar from "@/components/navbar";

function EditListingContent() {
  const router = useRouter();
  const params = useParams();

  const id = params?.id as string;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Books");
  const [condition, setCondition] = useState("Good");
  const [campus, setCampus] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    const loadListing = async () => {
      try {
        const user = auth.currentUser;

        if (!user) {
          router.replace("/");
          return;
        }

        const listingRef = doc(db, "listings", id);
        const snapshot = await getDoc(listingRef);

        if (!snapshot.exists()) {
          setError("Listing not found.");
          setLoading(false);
          return;
        }

        const data = snapshot.data();

        if (data.sellerId !== user.uid) {
          setError("You don't have permission to edit this listing.");
          setLoading(false);
          return;
        }

        setName(data.name || "");
        setDescription(data.description || "");
        setPrice(String(data.price ?? ""));
        setCategory(data.category || "Other");
        setCondition(data.condition || "Good");
        setCampus(data.campus || "");
      } catch (err) {
        console.error("Error loading listing:", err);
        setError("Failed to load listing.");
      } finally {
        setLoading(false);
      }
    };

    loadListing();
  }, [id, router]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      router.replace("/");
      return;
    }

    if (!name.trim()) {
      setError("Please enter a listing name.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }

    const numericPrice = Number(price);

    if (
      price === "" ||
      Number.isNaN(numericPrice) ||
      numericPrice < 0
    ) {
      setError("Please enter a valid price.");
      return;
    }

    if (!campus.trim()) {
      setError("Please enter a campus or pickup location.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const listingRef = doc(db, "listings", id);

      await updateDoc(listingRef, {
        name: name.trim(),
        description: description.trim(),
        price: numericPrice,
        category,
        condition,
        campus: campus.trim(),
        updatedAt: serverTimestamp(),
      });

      router.push("/my-listings");
    } catch (err) {
      console.error("Error updating listing:", err);
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGuard>
      <Navbar />

      <main className="min-h-screen bg-[#fafafa] px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-3xl">

          <button
            type="button"
            onClick={() => router.push("/my-listings")}
            className="mb-7 text-sm font-medium text-gray-500 transition hover:text-gray-900"
          >
            ← Back to My Listings
          </button>

          <div className="mb-8">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#4285F4]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#EA4335]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#FBBC05]" />
              <span className="h-1.5 w-1.5 rounded-full bg-[#34A853]" />
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-gray-950 sm:text-4xl">
              Edit your listing
            </h1>

            <p className="mt-2 text-gray-500">
              Update the details of your CampusCart listing.
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="animate-pulse space-y-6">
                <div className="h-12 rounded-xl bg-gray-100" />
                <div className="h-32 rounded-xl bg-gray-100" />
                <div className="h-12 rounded-xl bg-gray-100" />
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="h-12 rounded-xl bg-gray-100" />
                  <div className="h-12 rounded-xl bg-gray-100" />
                </div>
                <div className="h-12 rounded-xl bg-gray-100" />
              </div>
            </div>
          ) : error ? (
            <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900">
                Unable to edit listing
              </h2>

              <p className="mt-2 text-sm text-red-600">
                {error}
              </p>

              <button
                type="button"
                onClick={() => router.push("/my-listings")}
                className="mt-6 rounded-xl bg-gray-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black"
              >
                Back to My Listings
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
            >
              <div className="space-y-6">

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Listing name
                  </label>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Engineering Mathematics textbook"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Description
                  </label>

                  <textarea
                    value={description}
                    onChange={(e) =>
                      setDescription(e.target.value)
                    }
                    rows={6}
                    placeholder="Describe your item..."
                    className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3.5 text-sm leading-6 outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Price
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-gray-400">
                      ₹
                    </span>

                    <input
                      type="number"
                      min="0"
                      value={price}
                      onChange={(e) =>
                        setPrice(e.target.value)
                      }
                      placeholder="0"
                      className="w-full rounded-xl border border-gray-200 py-3.5 pl-9 pr-4 text-sm outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                    />
                  </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-800">
                      Category
                    </label>

                    <select
                      value={category}
                      onChange={(e) =>
                        setCategory(e.target.value)
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                    >
                      <option>Books</option>
                      <option>Electronics</option>
                      <option>College Supplies</option>
                      <option>Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-800">
                      Condition
                    </label>

                    <select
                      value={condition}
                      onChange={(e) =>
                        setCondition(e.target.value)
                      }
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                    >
                      <option>Like New</option>
                      <option>Good</option>
                      <option>Fair</option>
                    </select>
                  </div>

                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-800">
                    Campus / pickup location
                  </label>

                  <input
                    type="text"
                    value={campus}
                    onChange={(e) =>
                      setCampus(e.target.value)
                    }
                    placeholder="e.g. PES University, RR Campus"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3.5 text-sm outline-none transition focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                  />
                </div>

              </div>

              {error && (
                <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    router.push("/my-listings")
                  }
                  disabled={saving}
                  className="rounded-xl border border-gray-200 px-5 py-3.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-gray-950 px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Saving changes..."
                    : "Save changes"}
                </button>

              </div>
            </form>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}

export default function EditListingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="text-sm font-medium text-gray-500">
            Loading edit form...
          </div>
        </div>
      }
    >
      <EditListingContent />
    </Suspense>
  );
}