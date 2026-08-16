import { NextResponse } from 'next/server';
import { adminDB, adminStorage, adminAuth } from '@/firebase/server-init';
import { nanoid } from 'nanoid';

/**
 * @fileOverview Institutional PDF Ingestion Endpoint v1.0.
 * Handles authenticated multipart/form-data uploads directly to Cloud Storage via Admin SDK.
 */

export async function POST(req: Request) {
  try {
    // 1. Authenticate Request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'UNAUTHORIZED' }, { status: 401 });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const userId = decodedToken.uid;

    // 2. Parse Multipart Payload
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const boardId = formData.get('boardId') as string;
    const examId = formData.get('examId') as string;
    const subjectId = formData.get('subjectId') as string;
    const category = formData.get('category') as string;
    const title = formData.get('title') as string;
    const isFree = formData.get('isFree') === 'true';

    if (!file || file.type !== 'application/pdf') {
      return NextResponse.json({ success: false, error: 'INVALID_FILE_TYPE', message: 'Only PDF documents are authorized.' }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'FILE_TOO_LARGE', message: 'Maximum payload size is 50MB.' }, { status: 413 });
    }

    // 3. Upload to Cloud Storage
    const docId = nanoid(12);
    const buffer = Buffer.from(await file.arrayBuffer());
    const storagePath = `study-materials/${userId}/${docId}/${file.name.replace(/\s+/g, '_')}`;
    
    const bucket = adminStorage.bucket();
    const blob = bucket.file(storagePath);
    
    await blob.save(buffer, {
      contentType: 'application/pdf',
      metadata: {
        firebaseStorageDownloadTokens: nanoid(),
        userId,
        docId
      }
    });

    // 4. Generate Long-Term Signed URL
    const [downloadUrl] = await blob.getSignedUrl({
      action: 'read',
      expires: '03-01-2500' 
    });

    // 5. Create Firestore Registry
    const noteData = {
      id: docId,
      title: title || file.name,
      boardId,
      examId,
      subjectId,
      category: category || 'NOTES',
      pdfUrl: downloadUrl,
      storagePath,
      isFree,
      status: 'completed', // Status is completed since we've verified storage and registry
      userId,
      fileSize: file.size,
      mimeType: 'application/pdf',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await adminDB.collection('notes').doc(docId).set(noteData);

    return NextResponse.json({ 
      success: true, 
      docId, 
      url: downloadUrl,
      path: storagePath 
    });

  } catch (error: any) {
    console.error('[STUDY_UPLOAD_CRITICAL_FAILURE]:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'SERVER_ERROR', 
      message: error.message || 'Internal ingestion failure.' 
    }, { status: 500 });
  }
}
