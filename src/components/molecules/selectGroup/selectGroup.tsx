import React, { FC } from "react";
import Select from "@/components/atoms/selects/select";
import { Labels } from "@/components/atoms/labels/label";
import styles from "./index.module.scss";

interface SelectGroupProps {
  label: string;
  name: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
}

const SelectGroup: FC<SelectGroupProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  placeholder,
  disabled = false,
}) => {
  return (
    <div className={styles["selectGroup"]}>
      <Labels text={label} htmlFor={name} />
      <Select
        value={value}
        placeholder={placeholder}
        options={options}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
};

export default SelectGroup;
