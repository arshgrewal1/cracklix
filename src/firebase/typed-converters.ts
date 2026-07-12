
import {
    FirestoreDataConverter,
    QueryDocumentSnapshot,
    SnapshotOptions,
    DocumentData,
    collection,
    doc,
    getFirestore,
    Firestore
} from 'firebase/firestore';
import { Ad, Exam } from '@/types';

/**
 * @fileOverview Institutional Data Converters v2.0.
 * FIXED: Removed module-level getFirestore() calls to prevent initialization crashes.
 */

export const adConverter: FirestoreDataConverter<Ad> = {
    toFirestore(ad: Ad): DocumentData {
        return { ...ad };
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): Ad {
        const data = snapshot.data(options)!;
        return {
            ...data,
            id: snapshot.id,
        } as Ad;
    },
};

export const getAdsCollection = (db: Firestore) => collection(db, 'ads').withConverter(adConverter);
export const getAdDoc = (db: Firestore, id: string) => doc(db, 'ads', id).withConverter(adConverter);

export const examConverter: FirestoreDataConverter<Exam> = {
    toFirestore(exam: Exam): DocumentData {
        return { ...exam };
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot,
        options: SnapshotOptions
    ): Exam {
        const data = snapshot.data(options)!;
        return {
            ...data,
            id: snapshot.id,
        } as Exam;
    },
};

export const getExamsCollection = (db: Firestore) => collection(db, 'exams').withConverter(examConverter);
export const getExamDoc = (db: Firestore, id: string) => doc(db, 'exams', id).withConverter(examConverter);
