import { NextRequest, NextResponse } from 'next/server';
import { adminDB } from '@/lib/firebase';

export async function POST(req: NextRequest) {
  const { collection, doc, data } = await req.json();

  try {
    if (doc) {
      if (data) {
        await adminDB.collection(collection).doc(doc).set(data);
        return NextResponse.json({ success: true });
      } else {
        const docSnap = await adminDB.collection(collection).doc(doc).get();
        if (docSnap.exists) {
          return NextResponse.json({ success: true, data: docSnap.data() });
        } else {
          return NextResponse.json({ success: false, error: 'Document not found' });
        }
      }
    } else {
      const querySnapshot = await adminDB.collection(collection).get();
      const documents = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return NextResponse.json({ success: true, data: documents });
    }
  } catch (error: any) {
    console.error('[FIREBASE_API_ERROR]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
