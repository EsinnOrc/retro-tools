import React from "react";
import { Card as AntCard } from "antd";
import Buttons from "@/components/atoms/buttons/button";
import styles from "./index.module.scss";

interface CardProps {
  title: string;
  description: string;
  buttonText: string;
  steps: string[];
  onButtonClick: () => void;
}

const Card: React.FC<CardProps> = ({
  title,
  description,
  buttonText,
  steps,
  onButtonClick,
}) => {
  return (
    <AntCard className={styles.card}>
      <AntCard.Meta title={title} description={description} />
      <div className={styles.content}>
        <div className={styles.steps}>
          <h4>Steps:</h4>
          <ul>
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ul>
        </div>
      </div>
      <div className={styles.cardActions}>
        <Buttons
          text={buttonText}
          onClick={onButtonClick}
          htmlType="button"
          className={styles.cardButton}
        />
      </div>
    </AntCard>
  );
};

export default Card;
