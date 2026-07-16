import { doc, updateDoc, deleteDoc, collection, query, where, getDocs, or, limit } from "firebase/firestore";
import { db } from "./firebase";

export type SoftDeletableCollection = 
  | "members" 
  | "newcomers" 
  | "departments" 
  | "transactions"
  | "followups"
  | "messages";

/**
 * Soft delete a document by setting deletedAt timestamp
 */
export async function softDelete(
  collectionName: SoftDeletableCollection,
  docId: string,
  churchId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      deletedAt: new Date(),
    });
    return { success: true };
  } catch (error) {
    console.error(`Soft delete failed for ${collectionName}/${docId}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Delete failed" 
    };
  }
}

/**
 * Restore a soft-deleted document by clearing deletedAt
 */
export async function restoreDocument(
  collectionName: SoftDeletableCollection,
  docId: string,
  churchId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      deletedAt: null,
    });
    return { success: true };
  } catch (error) {
    console.error(`Restore failed for ${collectionName}/${docId}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Restore failed" 
    };
  }
}

/**
 * Permanently delete a document (hard delete)
 */
export async function hardDelete(
  collectionName: SoftDeletableCollection,
  docId: string,
  churchId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    return { success: true };
  } catch (error) {
    console.error(`Hard delete failed for ${collectionName}/${docId}:`, error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Delete failed" 
    };
  }
}

/**
 * Get soft-deleted documents (archived/trash)
 */
export async function getArchivedDocuments(
  collectionName: SoftDeletableCollection,
  churchId: string,
  maxResults = 50
) {
  try {
    const colRef = collection(db, collectionName);
    const q = query(
      colRef,
      where("churchId", "==", churchId),
      where("deletedAt", "!=", null),
      limit(maxResults)
    );
    
    const snapshot = await getDocs(q);
    return {
      success: true,
      documents: snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        deletedAt: doc.data().deletedAt?.toDate?.() || doc.data().deletedAt,
      })),
    };
  } catch (error) {
    console.error(`Get archived failed for ${collectionName}:`, error);
    return {
      success: false,
      documents: [],
      error: error instanceof Error ? error.message : "Failed to fetch archived",
    };
  }
}

/**
 * Check if a query should filter out deleted items
 * Add this to your queries to exclude soft-deleted documents
 */
export function isNotDeleted<T extends { deletedAt?: Date | null }>(item: T): boolean {
  return !item.deletedAt;
}

/**
 * Create a query constraint that filters out deleted documents
 * Usage: query(collection(db, "members"), where("churchId", "==", churchId), notDeleted())
 */
export function notDeletedConstraint() {
  return where("deletedAt", "==", null);
}