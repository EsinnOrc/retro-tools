import { FC, useState } from "react";
import { useRouter } from "next/router";
import { Layout } from "antd";
import { getAuth } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { db } from "../../firebaseConfig";
import Inputs from "@/components/atoms/inputs/inputs";
import Buttons from "@/components/atoms/buttons/button";
import SelectGroup from "@/components/molecules/selectGroup/selectGroup";
import InputGroup from "@/components/molecules/inputGroup/inputGroup";
import styles from "@/components/organisms/form/index.module.scss";

const { Content, Footer } = Layout;

const CreateTemplateForm: FC = () => {
  const [templateName, setTemplateName] = useState("");
  const [step, setStep] = useState("");
  const [stepNames, setStepNames] = useState<{ id: string; name: string }[]>([]);
  const [showSteps, setShowSteps] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  const handleCreateTemplate = async () => {
    const user = auth.currentUser;

    if (!user) {
      console.error("No user is signed in.");
      return;
    }

    try {
      await addDoc(collection(db, "templates"), {
        name: templateName,
        step: parseInt(step, 10),
        step_names: stepNames,
        user_id: user.uid,
      });

      console.log("Template and steps created successfully");
      router.push("/");
    } catch (error) {
      console.error("Error creating template and steps:", error);
    }
  };

  const handleStepNameChange = (index: number, value: string) => {
    const newStepNames = [...stepNames];
    newStepNames[index].name = value;
    setStepNames(newStepNames);
  };

  const handleNextClick = () => {
    setShowSteps(true);
  };

  const handleStepChange = (value: string) => {
    setStep(value);
    const stepCount = parseInt(value, 10) || 0;
    const newStepNames = [];
    for (let i = 0; i < stepCount; i++) {
      newStepNames.push({ id: uuidv4(), name: "" });
    }
    setStepNames(newStepNames);
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
          {!showSteps ? (
            <Buttons text="İleri" onClick={handleNextClick} htmlType="button" />
          ) : (
            <>
              <SelectGroup
                label="Number of Steps"
                name="steps"
                onChange={handleStepChange}
                value={step}
                options={[1, 2, 3, 4, 5].map((num) => ({ value: num.toString(), label: num.toString() }))}
                placeholder="Select number of steps"
              />
              {stepNames.map((step, index) => (
                <Inputs
                  key={index}
                  name={`stepName${index}`}
                  onChange={(e) => handleStepNameChange(index, e.target.value)}
                  value={step.name}
                  type="text"
                />
              ))}
              <Buttons text="Kaydet" onClick={handleCreateTemplate} htmlType="button" />
            </>
          )}
        </div>
      </Content>
      <Footer style={{ textAlign: "center" }}>©2024 Created by Esin and Semih</Footer>
    </Layout>
  );
};

export default CreateTemplateForm;
