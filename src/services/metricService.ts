import { 
  collection, 
  onSnapshot, 
  query, 
  where,
  getDocs,
  setDoc,
  doc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { Metric } from '../types';
import { handleFirestoreError, OperationType } from './errorService';
import { METRICS } from '../constants/mockData';

const COLLECTION_NAME = 'metrics';

export const subscribeToMetrics = (callback: (metrics: Metric[]) => void) => {
  const userId = auth.currentUser?.uid;
  if (!userId) return () => {};

  const q = query(collection(db, COLLECTION_NAME), where('ownerId', '==', userId));
  
  return onSnapshot(q, (snapshot) => {
    const metrics = snapshot.docs.map(doc => doc.data() as Metric);
    // Sort to maintain consistency if needed, since Firestore doesn't guarantee order without orderBy
    const sortedMetrics = metrics.sort((a, b) => a.label.localeCompare(b.label));
    callback(sortedMetrics);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, COLLECTION_NAME);
  });
};

export const seedInitialMetrics = async () => {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const q = query(collection(db, COLLECTION_NAME), where('ownerId', '==', userId));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log('Seeding initial metrics...');
    for (const metric of METRICS) {
      // Use label as doc id for uniqueness per user
      const metricId = `${userId}_${metric.label.replace(/\s+/g, '_')}`;
      await setDoc(doc(db, COLLECTION_NAME, metricId), {
        ...metric,
        ownerId: userId
      });
    }
  }
};
