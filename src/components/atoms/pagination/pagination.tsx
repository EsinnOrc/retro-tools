import React from "react";
import { Pagination as AntPagination } from "antd";
import type { PaginationProps } from "antd";
import styles from "./index.module.scss";

interface CustomPaginationProps extends PaginationProps {
  total: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<CustomPaginationProps> = ({
  total,
  pageSize,
  currentPage,
  onPageChange,
  ...rest
}) => {
  return (
    <AntPagination
      align="center"
      current={currentPage}
      pageSize={pageSize}
      total={total}
      onChange={onPageChange}
      className={styles.pagination}
      {...rest}
    />
  );
};

export default Pagination;
