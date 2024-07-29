import React, { FC } from "react";
import Inputs from "@/components/atoms/inputs/inputs";
import { Labels } from "@/components/atoms/labels/label";
import { Flex } from "antd";

interface InputGroupProps {
  label: string;
  name: string;
  value: string;
  type: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const InputGroup: FC<InputGroupProps> = ({
  label,
  name,
  value,
  type,
  onChange,
}) => {
  return (
    <Flex vertical>
      <Labels text={label} htmlFor={name} />
      <Inputs name={name} onChange={onChange} value={value} type={type} />
    </Flex>
  );
};

export default InputGroup;
