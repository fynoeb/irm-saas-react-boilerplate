import { 
  collection, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  query, 
  where,
  setDoc,
  doc,
  getDocs,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Investor } from '../types';
import { handleFirestoreError, OperationType } from './errorService';
import { INVESTORS } from '../constants/mockData';

const COLLECTION_NAME = 'investors';

/**
 * Subscribes to real-time updates for investors belonging to the current user.
 * 
 * @param callback - Function invoked with the updated list of investors.
 * @returns Unsubscribe function to terminate the real-time listener.
 */
export const subscribeToInvestors = (callback: (investors: Investor[]) => void) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return () => {};

  const q = query(collection(db, COLLECTION_NAME), where('ownerId', '==', userId));
  
  return onSnapshot(q, (snapshot) => {
    const investors = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Investor));
    callback(investors);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  });
};

/**
 * Creates a new investor profile in the database.
 * 
 * @param investor - The investor entity data (excluding system-managed fields).
 * @throws Error if the user is not authenticated or a database error occurs.
 */
export const addInvestor = async (investor: Omit<Investor, 'id' | 'ownerId'>) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');

  try {
    await addDoc(collection(db, COLLECTION_NAME), {
      ...investor,
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
  }
};

/**
 * Updates an existing investor profile with partial data.
 * 
 * @param investorId - The unique identifier of the investor document.
 * @param data - The attributes to be updated.
 * @throws Error if the update fails due to validation or permission issues.
 */
export const updateInvestor = async (investorId: string, data: Partial<Investor>) => {
  try {
    const docRef = doc(db, COLLECTION_NAME, investorId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${COLLECTION_NAME}/${investorId}`);
  }
};

/**
 * Permanently removes an investor profile from the database.
 * 
 * @param investorId - The unique identifier of the investor to delete.
 * @throws Error if the deletion is unauthorized or the ID is invalid.
 */
export const deleteInvestor = async (investorId: string) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');

  if (!investorId || typeof investorId !== 'string') {
    throw new Error('Invalid investor ID provided for deletion');
  }

  try {
    const docRef = doc(db, COLLECTION_NAME, investorId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COLLECTION_NAME}/${investorId}`);
  }
};

/**
 * Orchestrates initial data seeding for first-time profile initialization.
 * Verifies document existence before attempting to write sample data.
 */
export const seedInitialInvestors = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const q = query(collection(db, COLLECTION_NAME), where('ownerId', '==', userId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log('Seeding initial investors...');
    for (const investor of INVESTORS) {
      const { id, ...data } = investor;
      await addInvestor(data as any);
    }
  }
};
