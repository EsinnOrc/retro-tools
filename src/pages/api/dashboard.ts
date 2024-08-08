import { getDocs, query, collection, where, addDoc } from "firebase/firestore";
import { db } from "@/firebaseConfig";
import { Template } from "@/types/dashboard";

export const fetchTemplates = async (userId: string): Promise<Template[]> => {
  const templatesQuery = query(
    collection(db, "templates"),
    where("user_id", "==", userId)
  );
  const templatesSnapshot = await getDocs(templatesQuery);
  return templatesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Template[];
};

export const createRoom = async (templateId: string) => {
  const roomRef = await addDoc(collection(db, "rooms"), {
    template_id: templateId,
    is_active: true,
    created_at: new Date(),
  });
  return roomRef.id;
};
