"use client";

import dynamic from "next/dynamic";

const EmployeeVisitChart = dynamic(
  () => import("./EmployeeVisitChart"),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 text-center text-sm text-gray-500">
        Loading employee visit chart...
      </div>
    ),
  }
);

export default function EmployeeVisitChartPage() {
  return <EmployeeVisitChart />;
}