import { useEffect, useState } from "react";
import { ExecutionCard } from "@/components/execution/ExecutionCard_";
import { ExecutionHeader } from "@/components/execution/ExecutionHeader";
import { apiGetRequest } from "@/utils/apiRequest";
import type { IExecution } from "@/types";

export default function Executions() {
  const [executions, setExecutions] = useState<Array<IExecution> | undefined>(
    []
  );

  useEffect(() => {
    async function fetchExecutions() {
      try {
        const fetchedExecutions = await apiGetRequest("/api/executions", {
          next: { revalidate: 2 },
          // cache: "no-cache"
        });
        setExecutions(fetchedExecutions);
      } catch (error) {
        console.error("Error fetching executions:", error);
      }
    }

    fetchExecutions();
  }, []);

  return (
    <div className="container">
      <ExecutionHeader />
      <div className="flex flex-col-reverse gap-8">
        {executions?.map((execution, i) => (
          <ExecutionCard
            key={i}
            execution={execution}
            index={executions.length - i - 1}
          />
        ))}
      </div>
    </div>
  );
}
