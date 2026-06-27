import { collection, getDocs, addDoc, query, limit, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { DEFAULT_NOTES, DEFAULT_VIDEOS, DEFAULT_QUIZZES } from "./defaultData";

/**
 * Automatically seeds default notes, video lectures, and quizzes into Firestore
 * if those collections are currently empty. This guarantees that the user
 * immediately experiences a fully functioning app with rich educational content.
 */
export async function seedDefaultData() {
  try {
    // 1. Check & Seed Notes
    const notesColRef = collection(db, "notes");
    const notesQuery = query(notesColRef, limit(1));
    const notesSnapshot = await getDocs(notesQuery);
    
    if (notesSnapshot.empty) {
      console.log("[Seeder] Notes collection is empty. Seeding default notes...");
      for (const note of DEFAULT_NOTES) {
        await addDoc(notesColRef, {
          ...note,
          createdAt: serverTimestamp()
        });
      }
      console.log("[Seeder] Successfully seeded default notes.");
    }

    // 2. Check & Seed Videos
    const videosColRef = collection(db, "videos");
    const videosQuery = query(videosColRef, limit(1));
    const videosSnapshot = await getDocs(videosQuery);
    
    if (videosSnapshot.empty) {
      console.log("[Seeder] Videos collection is empty. Seeding default videos...");
      for (const video of DEFAULT_VIDEOS) {
        await addDoc(videosColRef, {
          ...video,
          createdAt: serverTimestamp()
        });
      }
      console.log("[Seeder] Successfully seeded default videos.");
    }

    // 3. Check & Seed Quizzes
    const quizzesColRef = collection(db, "quizzes");
    const quizzesQuery = query(quizzesColRef, limit(1));
    const quizzesSnapshot = await getDocs(quizzesQuery);
    
    if (quizzesSnapshot.empty) {
      console.log("[Seeder] Quizzes collection is empty. Seeding default quizzes...");
      for (const quiz of DEFAULT_QUIZZES) {
        await addDoc(quizzesColRef, {
          ...quiz,
          createdAt: serverTimestamp()
        });
      }
      console.log("[Seeder] Successfully seeded default quizzes.");
    }

  } catch (error) {
    console.error("[Seeder] Failed to seed default data to Firestore:", error);
  }
}
