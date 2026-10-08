"use client";

import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firestore";
import { auth } from "@/lib/auth";

export default function TestFirestorePage() {
  const addTestListing = async () => {
    try {
      if (!auth.currentUser) {
        alert("You must be logged in first.");
        return;
      }

      await addDoc(collection(db, "listings"), {
        name: "Engineering Mathematics Textbook",
        description: "Used engineering mathematics textbook",
        price: 450,
        category: "Books",
        condition: "Good",
        sellerId: auth.currentUser.uid,
        status: "available",
        createdAt: new Date(),
      });

      alert("Listing added successfully!");
    } catch (error) {
      console.error(error);
      alert("Error adding listing");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <button
        type="button"
        onClick={addTestListing}
        className="cursor-pointer rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
      >
        Add Test Listing
      </button>
    </main>
  );
}