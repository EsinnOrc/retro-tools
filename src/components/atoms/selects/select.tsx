import React, { FC } from "react";
import { Select as AntSelect, Flex } from "antd";
import styles from "./index.module.scss";

const { Option } = AntSelect;

interface SelectProps {
  value?: string;
  placeholder?: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const Select: FC<SelectProps> = ({
  value,
  placeholder,
  options,
  onChange,
  disabled = false,
}) => {
  return (
    <Flex className={styles.select}>
      <AntSelect
        value={value}
        placeholder={placeholder}
        onChange={(value) => onChange(value as string)}
        disabled={disabled}
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          option?.children
            ? option.children
                .toString()
                .toLowerCase()
                .includes(input.toLowerCase())
            : false
        }
      >
        {options.map((opt) => (
          <Option key={opt.value} value={opt.value}>
            {opt.label}
          </Option>
        ))}
      </AntSelect>
    </Flex>
  );
};

export default Select;
