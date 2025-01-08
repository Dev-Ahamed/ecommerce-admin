import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import { PaginationState } from "@tanstack/react-table";

const useBillboards = (storeId: string) => {
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchData = useCallback(
    async (pagination: PaginationState, globalFilter: string) => {
      const res = await axios.get(
        `/api/${storeId}/billboards?pageIndex=${pagination.pageIndex}&pageSize=${pagination.pageSize}&searchTerm=${globalFilter}`
      );

      if (!res.data) {
        setData([]);
        setTotalRecords(0);
        return;
      }

      setData(res.data.data);
      setTotalRecords(res.data.totalRecords);

      return res.data;
    },
    [storeId]
  );

  useEffect(() => {
    console.log("Updated state (data):", data);
  }, [data]);

  return { data, totalRecords, fetchData };
};

export default useBillboards;
