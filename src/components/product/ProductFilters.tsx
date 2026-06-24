"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface ProductFiltersProps {
  categories: { id: number; name: string; slug: string }[];
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentSearch = searchParams.get("q") || "";

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value;
          updateParams("q", q);
        }}
      >
        <input
          name="q"
          defaultValue={currentSearch}
          placeholder="搜索商品..."
          className="h-10 w-64 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => updateParams("category", "")}
          className={`rounded-full px-4 py-2 text-sm transition-colors cursor-pointer ${
            !currentCategory
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => updateParams("category", cat.slug)}
            className={`rounded-full px-4 py-2 text-sm transition-colors cursor-pointer ${
              currentCategory === cat.slug
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
