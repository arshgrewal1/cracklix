import { useState, useCallback } from "react";
import { doc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { Firestore } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface UseFirestoreCrudOptions {
  db: Firestore | null;
  collectionName: string;
  generateId?: (item: Record<string, unknown>) => string;
  toastMessages?: {
    saveSuccess?: string;
    saveFailed?: string;
    deleteSuccess?: string;
  };
}

/**
 * Hook that encapsulates the common Firestore save/delete pattern
 * used across admin pages with toast notifications.
 */
export function useFirestoreCrud({
  db,
  collectionName,
  generateId,
  toastMessages = {},
}: UseFirestoreCrudOptions) {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const {
    saveSuccess = "Registry Synced",
    saveFailed = "Sync Failed",
    deleteSuccess = "Item Removed",
  } = toastMessages;

  const saveDocument = useCallback(
    async (
      data: Record<string, unknown>,
      options?: {
        id?: string;
        transform?: (payload: Record<string, unknown>) => Record<string, unknown>;
        onSuccess?: () => void;
      }
    ): Promise<boolean> => {
      if (!db || isSaving) return false;

      setIsSaving(true);
      const docId =
        options?.id ||
        (data.id as string) ||
        (generateId ? generateId(data) : `${collectionName.slice(0, -1)}-${Date.now()}`);

      let payload: Record<string, unknown> = {
        ...data,
        id: docId,
        updatedAt: serverTimestamp(),
      };

      if (options?.transform) {
        payload = options.transform(payload);
      }

      try {
        await setDoc(doc(db, collectionName, docId), payload, { merge: true });
        toast({ title: saveSuccess });
        options?.onSuccess?.();
        return true;
      } catch {
        toast({ variant: "destructive", title: saveFailed });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [db, isSaving, collectionName, generateId, toast, saveSuccess, saveFailed]
  );

  const deleteDocument = useCallback(
    async (id: string, confirmMessage?: string): Promise<boolean> => {
      if (!db) return false;
      if (confirmMessage && !confirm(confirmMessage)) return false;

      try {
        await deleteDoc(doc(db, collectionName, id));
        toast({ title: deleteSuccess });
        return true;
      } catch {
        toast({ variant: "destructive", title: "Delete Failed" });
        return false;
      }
    },
    [db, collectionName, toast, deleteSuccess]
  );

  const toggleField = useCallback(
    async (
      id: string,
      field: string,
      currentValue: string,
      values: [string, string]
    ): Promise<boolean> => {
      if (!db || isSaving) return false;

      setIsSaving(true);
      const nextValue = currentValue === values[0] ? values[1] : values[0];

      try {
        await setDoc(
          doc(db, collectionName, id),
          { [field]: nextValue, updatedAt: serverTimestamp() },
          { merge: true }
        );
        toast({ title: "Registry Synced", description: `Field updated to ${nextValue}.` });
        return true;
      } catch {
        toast({ variant: "destructive", title: "Sync Failed" });
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [db, isSaving, collectionName, toast]
  );

  return {
    isSaving,
    saveDocument,
    deleteDocument,
    toggleField,
  };
}
