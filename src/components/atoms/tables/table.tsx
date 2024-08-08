import React from "react";
import { Table as AntTable, TableProps } from "antd";
import styles from "./index.module.scss";

const Table: React.FC<TableProps<any>> = (props) => {
  return <AntTable {...props} className={styles.table} />;
};

export default Table;
