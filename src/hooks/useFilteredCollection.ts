import { useMemo, useState } from "react";
import { collection, query, Query, orderBy } from "firebase/firestore";
import { Firestore } from "firebase/firestore";
import { useCollection } from "@/firebase";

interface UseFilteredCollectionOptions {
  db: Firestore | null;
  collectionName: string;
  orderByField?: string;
  orderDirection?: "asc" | "desc";
  searchFields?: string[];
}

/**
 * Hook combining Firestore collection fetching with client-side search filtering.
 * Reduces the repeated pattern of useMemo query + useCollection + filter logic.
 */
export function useFilteredCollection<T extends Record<string, unknown>>({
  db,
  collectionName,
  orderByField,
  orderDirection = "desc",
  searchFields = ["title"],
}: UseFilteredCollectionOptions) {
  const [searchTerm, setSearchTerm] = useState("");

  const collectionQuery = useMemo((): Query<T> | null => {
    if (!db) return null;
    const ref = collection(db, collectionName);
    if (orderByField) {
      return query(ref, orderBy(orderByField, orderDirection)) as unknown as Query<T>;
    }
    return ref as unknown as Query<T>;
  }, [db, collectionName, orderByField, orderDirection]);

  const { data: rawData, loading } = useCollection<T>(collectionQuery);

  const filteredData = useMemo(() => {
    if (!rawData) return [];
    if (!searchTerm.trim()) return rawData;

    const term = searchTerm.toLowerCase();
    return rawData.filter((item) =>
      searchFields.some((field) => {
        const value = item[field];
        return typeof value === "string" && value.toLowerCase().includes(term);
      })
    );
  }, [rawData, searchTerm, searchFields]);

  return {
    data: filteredData,
    rawData,
    loading,
    searchTerm,
    setSearchTerm,
  };
}
