import { FC } from "react";
import styles from "./index.module.scss";
import { Button, Flex } from "antd";
interface ButtonProps {
  text: string;
  onClick: () => void;
  htmlType: "button" | "submit" | "reset";
}

const Buttons: FC<ButtonProps> = ({ text, onClick, htmlType }) => {
  return (
    <div className={styles["button"]}>
      <Button onClick={onClick} htmlType={htmlType}>
        {text}
      </Button>
    </div>
  );
};

export default Buttons;
