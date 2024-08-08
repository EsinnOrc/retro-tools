import React, { FC } from "react";
import { Button as AntButton } from "antd";
import styles from "./index.module.scss";

interface ButtonProps {
  text?: string;
  onClick?: () => void;
  htmlType?: "button" | "submit" | "reset";
  icon?: React.ReactNode;
  className?: string;
}

const Buttons: FC<ButtonProps> = ({
  text,
  onClick,
  htmlType = "button",
  icon,
  className,
}) => {
  return (
    <div className={styles.button}>
      <AntButton
        onClick={onClick}
        htmlType={htmlType}
        icon={icon}
        className={className}
      >
        {text}
      </AntButton>
    </div>
  );
};

export default Buttons;
