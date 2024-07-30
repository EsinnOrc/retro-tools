import { useState } from "react";

const [templates, setTemplates] = useState<any[]>([]);
const [templateSteps, setTemplateSteps] = useState<{ [key: string]: any[] }>({});
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

export const fetchTemplates = async () => {
    try {
      const db = getFirestore();
      const templatesSnapshot = await getDocs(collection(db, "templates"));
      const templatesList = templatesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTemplates(templatesList);

      const templateStepsData: { [key: string]: any[] } = {};
      for (const template of templatesList) {
        const stepsQuery = query(collection(db, "template_steps"), where("template_id", "==", template.id));
        const stepsSnapshot = await getDocs(stepsQuery);
        templateStepsData[template.id] = stepsSnapshot.docs.map(doc => doc.data());
      }
      setTemplateSteps(templateStepsData);

    } catch (error) {
      console.error("Error fetching templates or steps:", error);
    }
  };
