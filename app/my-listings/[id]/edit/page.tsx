"use client";

import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firestore";
import { auth } from "@/lib/auth";
import { useParams, useRouter } from "next/navigation";

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Books");
  const [condition, setCondition] = useState("Good");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchListing = async () => {
      try {
        if (!auth.currentUser) {
          setError("You must be logged in.");
          return;
        }

        const listingId = params.id as string;

        const listingRef = doc(db, "listings", listingId);
        const snapshot = await getDoc(listingRef);

        if (!snapshot.exists()) {
          setError("Listing not found.");
          return;
        }

        const data = snapshot.data();

        // Make sure the current user owns this listing
        if (data.sellerId !== auth.currentUser.uid) {
          setError("You do not have permission to edit this listing.");
          return;
        }

        setName(data.name || "");
        setDescription(data.description || "");
        setPrice(String(data.price || ""));
        setCategory(data.category || "Books");
        setCondition(data.condition || "Good");
      } catch (error) {
        console.error("Error loading listing:", error);
        setError("Failed to load listing.");
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!name.trim() || !description.trim() || !price) {
      setError("Please fill in all required fields.");
      return;
    }

    if (Number(price) <= 0) {
      setError("Price must be greater than 0.");
      return;
    }

    try {
      setSaving(true);

      const listingId = params.id as string;

      const listingRef = doc(db, "listings", listingId);

      await updateDoc(listingRef, {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        category,
        condition,
        updatedAt: new Date(),
      });

      router.push("/my-listings");
    } catch (error) {
      console.error("Error updating listing:", error);
      setError("Failed to update listing.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 text-gray-900">
        <p>Loading listing...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 text-gray-900">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold">
            {error}
          </h1>

          <button
            type="button"
            onClick={() => router.push("/my-listings")}
            className="mt-6 cursor-pointer rounded-lg bg-black px-5 py-3 font-semibold text-white hover:bg-gray-800"
          >
            Back to My Listings
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-12 text-gray-900">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8 shadow-sm">
        <button
          type="button"
          onClick={() => router.push("/my-listings")}
          className="mb-6 cursor-pointer text-sm text-gray-500 hover:text-black"
        >
          ← Back to My Listings
        </button>

        <h1 className="text-3xl font-semibold">
          Edit Listing
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div>
            <label className="mb-2 block font-medium">
              Item name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none placeholder:text-gray-400 focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Description
            </label>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Price
            </label>

            <input
              type="number"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Category
            </label>

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none"
            >
              <option value="Books">Books</option>
              <option value="Electronics">Electronics</option>
              <option value="College Supplies">
                College Supplies
              </option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block font-medium">
              Condition
            </label>

            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none"
            >
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>
          </div>

          {error && (
            <div className="rounded-lg bg-red-100 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full cursor-pointer rounded-lg bg-black p-3 font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving changes..." : "Save Changes"}
          </button>
        </form>
      </div>
    </main>
  );
}