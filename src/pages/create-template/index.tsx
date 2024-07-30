import { FC, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "antd";
import { getAuth } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import Inputs from "@/components/atoms/inputs/inputs";
import Buttons from "@/components/atoms/buttons/button";
import InputGroup from "@/components/molecules/inputGroup/inputGroup";
import styles from "@/components/organisms/form/index.module.scss";

const { Content, Footer } = Layout;

const CreateTemplateForm: FC = () => {
  const [templateName, setTemplateName] = useState("");
  const [step, setStep] = useState("");
  const [stepNames, setStepNames] = useState<string[]>([]);
  const [showStepNames, setShowStepNames] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  const handleCreateTemplate = async () => {
    const user = auth.currentUser;

    if (!user) {
      console.error("No user is signed in.");
      return;
    }

    try {
      const templateRef = await addDoc(collection(db, "templates"), {
        name: templateName,
        step: parseInt(step, 10),
        user_id: user.uid,
      });

      const stepPromises = stepNames.map((stepName) =>
        addDoc(collection(db, "template_steps"), {
          template_id: templateRef.id,
          step_name: stepName,
        })
      );

      await Promise.all(stepPromises);

      console.log("Template and steps created successfully");
      router.push("/");
    } catch (error) {
      console.error("Error creating template and steps:", error);
    }
  };

  const handleStepNameChange = (index: number, value: string) => {
    const newStepNames = [...stepNames];
    newStepNames[index] = value;
    setStepNames(newStepNames);
  };

  const handleNextClick = () => {
    const stepCount = parseInt(step, 10) || 0;
    setStepNames(new Array(stepCount).fill(""));
    setShowStepNames(true);
  };

  return (
    <Layout className={styles.layout}>
      <Content style={{ padding: '0 50px' }}>
        <div className={styles.content}>
          <h2>Create a New Template</h2>
          <InputGroup
            label="Template Name"
            name="templateName"
            onChange={(e) => setTemplateName(e.target.value)}
            value={templateName}
            type="text"
          />
          <InputGroup
            label="Number of Steps"
            name="steps"
            onChange={(e) => setStep(e.target.value)}
            value={step}
            type="number"
          />
          {!showStepNames && (
            <Buttons text="İleri" onClick={handleNextClick} htmlType="button" />
          )}
          {showStepNames && (
            <>
              {stepNames.map((_, index) => (
                <Inputs
                  key={index}
                  name={`stepName${index}`}
                  onChange={(e) => handleStepNameChange(index, e.target.value)}
                  value={stepNames[index]}
                  type="text"
                />
              ))}
              <Buttons text="Kaydet" onClick={handleCreateTemplate} htmlType="button" />
            </>
          )}
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>©2023 Created by You</Footer>
    </Layout>
  );
};

export default CreateTemplateForm;
