
import {
    FirestoreDataConverter,
    QueryDocumentSnapshot,
    SnapshotOptions,
    DocumentData,
    collection,
    CollectionReference,
    doc,
    DocumentReference,
    getFirestore
} from 'firebase/firestore';
import { Ad, Exam } from '@/types';

const adConverter: FirestoreDataConverter<Ad> = {
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

export const adsCollection = collection(getFirestore(), 'ads').withConverter(adConverter);

export const adDoc = (id: string) => doc(getFirestore(), 'ads', id).withConverter(adConverter);

const examConverter: FirestoreDataConverter<Exam> = {
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

export const examsCollection = collection(getFirestore(), 'exams').withConverter(examConverter);

export const examDoc = (id: string) => doc(getFirestore(), 'exams', id).withConverter(examConverter);


