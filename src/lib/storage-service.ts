'use client';

import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  FirebaseStorage 
} from 'firebase/storage';
import { storage } from '@/firebase/app';

/**
 * @fileOverview Institutional Storage Governance Node v1.0.
 * Handles specialized file processing, compression, and metadata extraction.
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
  /**
   * Processes images for optimal web performance.
   * Converts to WebP and applies target dimensions.
   */
  private async processImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max resolution threshold for banners
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
            if (blob) resolve(blob);
            else reject(new Error('Compression failure'));
          },
          'image/webp',
          0.8 // 80% Quality target
        );
      };
      img.onerror = reject;
    });
  }

  /**
   * Uploads any file to a specific registry folder with progress tracking.
   */
  async uploadFile(
    file: File, 
    folder: StorageFolder, 
    onProgress?: (progress: number) => void
  ): Promise<FileMetadata> {
    let uploadData: File | Blob = file;
    let fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

    // 1. Logic: Auto-optimize images
    if (file.type.startsWith('image/') && file.type !== 'image/svg+xml') {
      try {
        uploadData = await this.processImage(file);
        fileName = fileName.replace(/\.[^/.]+$/, "") + ".webp";
      } catch (e) {
        console.warn('[Storage] Optimization failed, using raw node.');
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
        (error) => reject(error),
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

  /**
   * Removes a node from the storage registry.
   */
  async deleteFile(path: string): Promise<void> {
    if (!path) return;
    const storageRef = ref(storage, path);
    try {
      await deleteObject(storageRef);
    } catch (e) {
      console.warn('[Storage] Purge failed or node missing:', path);
    }
  }
}

export const storageService = new StorageService();
