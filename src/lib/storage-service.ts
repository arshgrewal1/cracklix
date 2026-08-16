'use client';

import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { storage } from '@/firebase/app';

/**
 * @fileOverview Institutional Storage Governance Node v2.0 [Hardened].
 * FIXED: Accurate progress reporting and robust error recovery for PDF nodes.
 */

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
  uploadedAt: string;
}

export type StorageFolder = 
  | 'banners' 
  | 'logos' 
  | 'vacancies' 
  | 'current-affairs' 
  | 'notes' 
  | 'downloads' 
  | 'pyqs' 
  | 'daily-quiz' 
  | 'mock-tests' 
  | 'user-profile';

class StorageService {
  private async processImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const MAX_WIDTH = 1920;
        if (width > MAX_WIDTH) {
          height = (MAX_WIDTH / width) * height;
          width = MAX_WIDTH;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas context failure'));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
               URL.revokeObjectURL(img.src);
               resolve(blob);
            }
            else reject(new Error('Compression failure'));
          },
          'image/webp',
          0.85
        );
      };
      img.onerror = (err) => {
         URL.revokeObjectURL(img.src);
         reject(err);
      };
    });
  }

  async uploadFile(
    file: File, 
    folder: StorageFolder, 
    onProgress?: (progress: number) => void
  ): Promise<FileMetadata> {
    if (!storage) throw new Error("Storage hub is offline.");

    let uploadData: File | Blob = file;
    let fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

    if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
      try {
        uploadData = await this.processImage(file);
        fileName = fileName.replace(/\.[^/.]+$/, "") + ".webp";
      } catch (e) {
        console.warn('[Storage] Image optimization bypassed:', e);
      }
    }

    const storagePath = `${folder}/${fileName}`;
    const storageRef = ref(storage, storagePath);
    const uploadTask = uploadBytesResumable(storageRef, uploadData);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => {
           console.error("[STORAGE_UPLOAD_ERROR]:", error);
           reject(error);
        },
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve({
            name: file.name,
            size: file.size,
            type: file.type.startsWith('image/') ? 'image/webp' : file.type,
            url,
            path: storagePath,
            uploadedAt: new Date().toISOString()
          });
        }
      );
    });
  }

  async deleteFile(path: string): Promise<void> {
    if (!path || !storage) return;
    const storageRef = ref(storage, path);
    try {
      await deleteObject(storageRef);
    } catch (e) {
      console.warn('[Storage] Node purge bypassed:', path);
    }
  }
}

export const storageService = new StorageService();
