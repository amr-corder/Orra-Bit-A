import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase';

export async function uploadProductImage(file: File): Promise<string> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const imageRef = ref(
    storage,
    `product-images/${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safeName}`
  );
  const snapshot = await uploadBytes(imageRef, file, { contentType: file.type });
  return getDownloadURL(snapshot.ref);
}
