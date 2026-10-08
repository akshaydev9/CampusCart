
"use client";

import { useState } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "@/lib/firestore";
import { auth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/authgaurd";
import Navbar from "@/components/navbar";

type Book = {
  id: string;
  volumeInfo: {
    title?: string;
    authors?: string[];
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
  };
};

function SellContent() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] =
    useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] =
    useState("Books");
  const [condition, setCondition] =
    useState("Good");

  const [image, setImage] =
    useState<File | null>(null);

  const [imagePreview, setImagePreview] =
    useState("");

  const [bookSearch, setBookSearch] =
    useState("");

  const [books, setBooks] =
    useState<Book[]>([]);

  const [searchingBooks, setSearchingBooks] =
    useState(false);

  const [selectedBook, setSelectedBook] =
    useState<Book | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // --------------------------------
  // GOOGLE BOOKS
  // --------------------------------

  const searchBooks = async () => {
    if (!bookSearch.trim()) {
      return;
    }

    setSearchingBooks(true);
    setError("");
    setBooks([]);

    try {
      const apiKey =
        process.env
          .NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY;

      if (!apiKey) {
        throw new Error(
          "Google Books API key is missing."
        );
      }

      const url =
        `https://www.googleapis.com/books/v1/volumes` +
        `?q=${encodeURIComponent(
          bookSearch.trim()
        )}` +
        `&maxResults=8` +
        `&printType=books` +
        `&key=${apiKey}`;

      const response =
        await fetch(url);

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(
          "Google Books API error:",
          errorText
        );

        throw new Error(
          `Google Books request failed (${response.status})`
        );
      }

      const data =
        await response.json();

      setBooks(data.items || []);

      if (
        !data.items ||
        data.items.length === 0
      ) {
        setError(
          "No books found. Try another search."
        );
      }
    } catch (error) {
      console.error(
        "Book search error:",
        error
      );

      setError(
        "Book search failed. Please try again."
      );
    } finally {
      setSearchingBooks(false);
    }
  };

  // --------------------------------
  // SELECT BOOK
  // --------------------------------

  const selectBook = (book: Book) => {
    const info = book.volumeInfo;

    setSelectedBook(book);

    if (info.title) {
      setName(info.title);
    }

    if (info.description) {
      const cleanDescription =
        info.description.replace(
          /<[^>]*>/g,
          ""
        );

      setDescription(
        cleanDescription
      );
    }

    const cover =
      info.imageLinks?.thumbnail ||
      info.imageLinks?.smallThumbnail;

    if (cover) {
      setImagePreview(
        cover.replace(
          "http://",
          "https://"
        )
      );
    }

    setBooks([]);
  };

  // --------------------------------
  // IMAGE
  // --------------------------------

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select an image file."
      );
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setError(
        "Image must be smaller than 5MB."
      );
      return;
    }

    setError("");
    setImage(file);
    setSelectedBook(null);

    setImagePreview(
      URL.createObjectURL(file)
    );
  };

  // --------------------------------
  // SUBMIT
  // --------------------------------

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    if (!auth.currentUser) {
      setError(
        "You must be logged in."
      );
      return;
    }

    if (
      !name.trim() ||
      !description.trim() ||
      !price
    ) {
      setError(
        "Please fill in all required fields."
      );
      return;
    }

    if (Number(price) <= 0) {
      setError(
        "Price must be greater than 0."
      );
      return;
    }

    if (!image && !selectedBook) {
      setError(
        "Please upload an image or select a book from Google Books."
      );
      return;
    }

    const cloudName =
      process.env
        .NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

    const uploadPreset =
      process.env
        .NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setError(
        "Cloudinary is not configured correctly."
      );
      return;
    }

    setLoading(true);

    try {
      let imageUrl = "";

      // CLOUDINARY
      if (image) {
        const formData =
          new FormData();

        formData.append(
          "file",
          image
        );

        formData.append(
          "upload_preset",
          uploadPreset
        );

        const response =
          await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
              method: "POST",
              body: formData,
            }
          );

        if (!response.ok) {
          throw new Error(
            "Image upload failed."
          );
        }

        const data =
          await response.json();

        imageUrl =
          data.secure_url;
      }

      // GOOGLE BOOKS COVER
      if (
        !image &&
        selectedBook
      ) {
        imageUrl =
          selectedBook
            .volumeInfo
            .imageLinks
            ?.thumbnail ||
          selectedBook
            .volumeInfo
            .imageLinks
            ?.smallThumbnail ||
          "";

        imageUrl =
          imageUrl.replace(
            "http://",
            "https://"
          );
      }

      await addDoc(
        collection(
          db,
          "listings"
        ),
        {
          name: name.trim(),
          description:
            description.trim(),
          price: Number(price),
          category,
          condition,
          imageUrl,
          sellerId:
            auth.currentUser.uid,
          status: "available",
          createdAt: new Date(),
        }
      );

      router.push(
        "/marketplace"
      );
    } catch (error) {
      console.error(
        "Error creating listing:",
        error
      );

      setError(
        "Failed to create listing. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#fafafa] text-gray-900">

      <Navbar />

      <section className="mx-auto max-w-6xl px-6 py-10 sm:py-14">

        {/* BACK */}
        <button
          type="button"
          onClick={() =>
            router.push(
              "/marketplace"
            )
          }
          className="sell-fade-in mb-8 flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-400 transition hover:text-gray-900"
        >
          ← Back to marketplace
        </button>

        {/* HEADER */}
        <div className="sell-fade-in max-w-2xl">

          <div className="flex items-center gap-2">

            <span className="h-1.5 w-1.5 rounded-full bg-[#4285F4]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#EA4335]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#FBBC05]" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#34A853]" />

            <span className="ml-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Sell on CampusCart
            </span>

          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-gray-950 sm:text-5xl">
            Turn your unused stuff
            <br />
            <span className="text-gray-400">
              into someone else's find.
            </span>
          </h1>

          <p className="mt-5 text-base leading-7 text-gray-500">
            Create a listing in less than a
            minute. Add your item details,
            upload a photo, and you're ready
            to sell.
          </p>

        </div>

        {/* FORM */}
        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.7fr]">

          <form
            onSubmit={handleSubmit}
            className="sell-fade-in sell-delay-1 rounded-3xl border border-gray-200 bg-white p-6 shadow-[0_10px_40px_rgba(0,0,0,0.04)] sm:p-8"
          >

            {/* ITEM NAME */}
            <div>

              <label className="mb-2 block text-sm font-semibold">
                Item name
              </label>

              <input
                type="text"
                required
                value={name}
                onChange={(e) =>
                  setName(
                    e.target.value
                  )
                }
                placeholder="Engineering Mathematics Textbook"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100"
              />

            </div>

            {/* CATEGORY */}
            <div className="mt-6">

              <label className="mb-2 block text-sm font-semibold">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => {
                  const value =
                    e.target.value;

                  setCategory(value);

                  if (
                    value !== "Books"
                  ) {
                    setBooks([]);
                    setSelectedBook(
                      null
                    );
                    setBookSearch("");
                  }
                }}
                className="w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100"
              >
                <option value="Books">
                  Books
                </option>

                <option value="Electronics">
                  Electronics
                </option>

                <option value="College Supplies">
                  College Supplies
                </option>

                <option value="Other">
                  Other
                </option>
              </select>

            </div>

            {/* GOOGLE BOOKS */}
            {category === "Books" && (
              <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-[#fafafa]">

                <div className="border-b border-gray-200 bg-white p-5">

                  <div className="flex items-center gap-3">

                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100">

                      <div className="flex gap-[2px]">

                        <span className="h-1.5 w-1.5 rounded-full bg-[#4285F4]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#EA4335]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FBBC05]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#34A853]" />

                      </div>

                    </div>

                    <div>

                      <h2 className="text-sm font-semibold">
                        Find your book
                      </h2>

                      <p className="mt-0.5 text-xs text-gray-400">
                        Search Google Books to
                        automatically fill details.
                      </p>

                    </div>

                  </div>

                  <div className="mt-4 flex gap-2">

                    <input
                      type="text"
                      value={
                        bookSearch
                      }
                      onChange={(e) =>
                        setBookSearch(
                          e.target.value
                        )
                      }
                      onKeyDown={(e) => {
                        if (
                          e.key ===
                          "Enter"
                        ) {
                          e.preventDefault();
                          searchBooks();
                        }
                      }}
                      placeholder="Search by title..."
                      className="min-w-0 flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100"
                    />

                    <button
                      type="button"
                      onClick={
                        searchBooks
                      }
                      disabled={
                        searchingBooks ||
                        !bookSearch.trim()
                      }
                      className="cursor-pointer rounded-xl bg-gray-950 px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {searchingBooks
                        ? "..."
                        : "Search"}
                    </button>

                  </div>

                </div>

                {/* RESULTS */}
                {books.length > 0 && (
                  <div className="max-h-[360px] space-y-2 overflow-y-auto p-3">

                    {books.map(
                      (book) => {

                        const info =
                          book.volumeInfo;

                        const cover =
                          info.imageLinks
                            ?.smallThumbnail ||
                          info.imageLinks
                            ?.thumbnail;

                        return (
                          <button
                            key={book.id}
                            type="button"
                            onClick={() =>
                              selectBook(
                                book
                              )
                            }
                            className="group flex w-full cursor-pointer gap-4 rounded-xl border border-transparent bg-white p-3 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-sm"
                          >

                            {cover ? (
                              <img
                                src={cover.replace(
                                  "http://",
                                  "https://"
                                )}
                                alt={
                                  info.title ||
                                  "Book"
                                }
                                className="h-20 w-14 shrink-0 rounded-lg object-cover shadow-sm transition duration-300 group-hover:scale-[1.03]"
                              />
                            ) : (
                              <div className="flex h-20 w-14 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-[10px] text-gray-400">
                                No cover
                              </div>
                            )}

                            <div className="min-w-0 flex-1">

                              <h3 className="line-clamp-2 text-sm font-semibold">
                                {info.title ||
                                  "Untitled book"}
                              </h3>

                              {info.authors &&
                                info.authors
                                  .length >
                                  0 && (
                                  <p className="mt-1 line-clamp-1 text-xs text-gray-400">
                                    {info.authors.join(
                                      ", "
                                    )}
                                  </p>
                                )}

                              <p className="mt-3 text-[11px] font-semibold text-gray-400 transition-colors group-hover:text-[#4285F4]">
                                Select this book →
                              </p>

                            </div>

                          </button>
                        );
                      }
                    )}

                  </div>
                )}

              </div>
            )}

            {/* DESCRIPTION */}
            <div className="mt-6">

              <label className="mb-2 block text-sm font-semibold">
                Description
              </label>

              <textarea
                required
                value={
                  description
                }
                onChange={(e) =>
                  setDescription(
                    e.target.value
                  )
                }
                placeholder="Describe the item's condition, usage, included accessories, etc."
                rows={5}
                className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm leading-6 outline-none transition focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100"
              />

            </div>

            {/* PRICE + CONDITION */}
            <div className="mt-6 grid gap-5 sm:grid-cols-2">

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Price
                </label>

                <div className="relative">

                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">
                    ₹
                  </span>

                  <input
                    type="number"
                    required
                    min="1"
                    value={price}
                    onChange={(e) =>
                      setPrice(
                        e.target.value
                      )
                    }
                    placeholder="450"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-9 pr-4 text-sm outline-none transition focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100"
                  />

                </div>

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  Condition
                </label>

                <select
                  value={
                    condition
                  }
                  onChange={(e) =>
                    setCondition(
                      e.target.value
                    )
                  }
                  className="w-full cursor-pointer rounded-xl border border-gray-200 bg-gray-50 px-4 py-3.5 text-sm outline-none transition focus:border-gray-400 focus:bg-white focus:ring-4 focus:ring-gray-100"
                >
                  <option value="Like New">
                    Like New
                  </option>

                  <option value="Good">
                    Good
                  </option>

                  <option value="Fair">
                    Fair
                  </option>
                </select>

              </div>

            </div>

            {/* IMAGE UPLOAD */}
            <div className="mt-6">

              <label className="mb-2 block text-sm font-semibold">
                Item image
              </label>

              <label className="group relative flex min-h-[180px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-gray-50 transition-all duration-300 hover:border-gray-400 hover:bg-white">

                {imagePreview ? (
                  <>
                    <img
                      src={
                        imagePreview
                      }
                      alt="Preview"
                      className="absolute inset-0 h-full w-full object-contain p-4 transition duration-500 group-hover:scale-[1.02]"
                    />

                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4 pt-12">

                      <p className="text-center text-xs font-medium text-white">
                        Click to replace image
                      </p>

                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">

                      <svg
                        className="h-5 w-5 text-gray-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      >
                        <path d="M12 16V4" />
                        <path d="m7 9 5-5 5 5" />
                        <path d="M4 20h16" />
                      </svg>

                    </div>

                    <p className="mt-3 text-sm font-semibold">
                      Upload an image
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      PNG, JPG or WEBP · Max 5MB
                    </p>
                  </>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={
                    handleImageChange
                  }
                  className="hidden"
                />

              </label>

              {selectedBook && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2.5 text-xs font-medium text-green-700">

                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100">
                    ✓
                  </span>

                  Using the Google Books cover

                </div>
              )}

            </div>

            {/* ERROR */}
            {error && (
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">

                <span className="font-bold">
                  !
                </span>

                <span>
                  {error}
                </span>

              </div>
            )}

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={loading}
              className="sell-submit group relative mt-8 w-full cursor-pointer overflow-hidden rounded-2xl bg-gray-950 px-6 py-4 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:bg-gray-800 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >

              <span className="relative z-10 flex items-center justify-center gap-3">

                {loading
                  ? "Creating listing..."
                  : "Create Listing"}

                {!loading && (
                  <span className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                )}

              </span>

              <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] transition-all duration-500 group-hover:w-full" />

            </button>

          </form>

          {/* PREVIEW / INFO */}
          <aside className="sell-fade-in sell-delay-2">

            <div className="sticky top-24">

              {/* PREVIEW */}
              <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)]">

                <div className="border-b border-gray-100 px-6 py-5">

                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                    Live preview
                  </p>

                </div>

                <div className="p-5">

                  <div className="overflow-hidden rounded-2xl bg-gray-100">

                    {imagePreview ? (
                      <img
                        src={
                          imagePreview
                        }
                        alt="Listing preview"
                        className="h-56 w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-56 flex-col items-center justify-center text-center">

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">

                          <svg
                            className="h-5 w-5 text-gray-400"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.7"
                          >
                            <rect
                              x="3"
                              y="3"
                              width="18"
                              height="18"
                              rx="3"
                            />

                            <circle
                              cx="8.5"
                              cy="8.5"
                              r="1.5"
                            />

                            <path d="m21 15-5-5L5 21" />
                          </svg>

                        </div>

                        <p className="mt-3 text-xs text-gray-400">
                          Your image will appear here
                        </p>

                      </div>
                    )}

                  </div>

                  <div className="mt-5">

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <p className="text-xs text-gray-400">
                          {category}
                        </p>

                        <h3 className="mt-1 line-clamp-2 font-semibold">
                          {name ||
                            "Your item name"}
                        </h3>

                      </div>

                      <p className="shrink-0 font-semibold">
                        ₹
                        {price ||
                          "0"}
                      </p>

                    </div>

                    <div className="mt-4 flex gap-2">

                      <span className="rounded-full bg-gray-100 px-3 py-1 text-[11px] font-medium text-gray-500">
                        {condition}
                      </span>

                      <span className="rounded-full bg-green-50 px-3 py-1 text-[11px] font-medium text-green-600">
                        Available
                      </span>

                    </div>

                  </div>

                </div>

              </div>

              {/* TIPS */}
              <div className="mt-5 rounded-2xl border border-gray-200 bg-white p-5">

                <div className="flex items-center gap-2">

                  <span className="text-sm">
                    ✦
                  </span>

                  <p className="text-sm font-semibold">
                    Quick tips
                  </p>

                </div>

                <ul className="mt-4 space-y-3 text-xs leading-5 text-gray-500">

                  <li className="flex gap-2">
                    <span className="text-[#4285F4]">
                      •
                    </span>
                    Use a clear photo of your item.
                  </li>

                  <li className="flex gap-2">
                    <span className="text-[#EA4335]">
                      •
                    </span>
                    Be honest about its condition.
                  </li>

                  <li className="flex gap-2">
                    <span className="text-[#FBBC05]">
                      •
                    </span>
                    Set a reasonable campus price.
                  </li>

                  <li className="flex gap-2">
                    <span className="text-[#34A853]">
                      •
                    </span>
                    Add useful details buyers need.
                  </li>

                </ul>

              </div>

            </div>

          </aside>

        </div>

      </section>

      <style jsx>{`
        .sell-fade-in {
          animation: sellFadeIn 0.7s
            cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .sell-delay-1 {
          animation-delay: 100ms;
        }

        .sell-delay-2 {
          animation-delay: 180ms;
        }

        @keyframes sellFadeIn {
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
          .sell-fade-in {
            animation: none;
          }
        }
      `}</style>

    </main>
  );
}

export default function SellPage() {
  return (
    <AuthGuard>
      <SellContent />
    </AuthGuard>
  );
}

