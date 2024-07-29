import { FC } from "react";
import styles from "./index.module.scss";

interface LabelsProps {
  text: string;
  htmlFor: string;
}

export const Labels: FC<LabelsProps> = ({ text, htmlFor }) => {
  return (
    <label className={styles["label"]} htmlFor={htmlFor}>
      {text}
    </label>
  );
};
