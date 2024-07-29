import { FC } from "react";
import styles from "./index.module.scss";
import { Input, Flex } from "antd";

interface InputProps {
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  value: string;
  type: string;
}

const Inputs: FC<InputProps> = ({ name, onChange, value, type }) => {
  return (
    <div className={styles.input}>
      <Input
        id={name}
        type={type}
        name={name}
        onChange={onChange}
        value={value}
      />
    </div>
  );
};

export default Inputs;
