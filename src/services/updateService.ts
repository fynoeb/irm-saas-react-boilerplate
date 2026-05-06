import { 
  collection, 
  onSnapshot, 
  addDoc, 
  serverTimestamp, 
  query, 
  where,
  getDocs,
  orderBy
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Update } from '../types';
import { handleFirestoreError, OperationType } from './errorService';
import { UPDATES } from '../constants/mockData';

const COLLECTION_NAME = 'updates';

export const subscribeToUpdates = (callback: (updates: Update[]) => void) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return () => {};

  const q = query(
    collection(db, COLLECTION_NAME), 
    where('ownerId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const updates = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Update));
    callback(updates);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  });
};

export const addActivityUpdate = async (update: Omit<Update, 'id' | 'ownerId'>) => {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error('User not authenticated');

  try {
    await addDoc(collection(db, COLLECTION_NAME), {
      ...update,
      ownerId: userId,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COLLECTION_NAME);
  }
};

export const seedInitialUpdates = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const q = query(collection(db, COLLECTION_NAME), where('ownerId', '==', userId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log('Seeding initial updates...');
    for (const update of UPDATES) {
      const { id, ...data } = update;
      await addActivityUpdate(data as any);
    }
  }
};
