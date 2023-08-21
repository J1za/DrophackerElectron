import { useEffect, useState } from "react";
import { apiGetRequest } from "@/utils/apiRequest";
import { ExAccountHeader } from "@/components/execution/account/ExAccountHeader";
import ExAccountStepCard from "@/components/execution/account/ExAccountStepCard";
import { ExAccountCardHeader } from "@/components/execution/account/ExAccountCardHeader";
import type { IExecutionAccount, IExecutionStep } from "@/types";
import { useRouter } from "next/router";

export default function Executions() {
  const [account, setAccount] = useState<IExecutionAccount | undefined>(
    undefined
  );
  const router = useRouter();
  const { executionId, address } = router.query;

  const [steps, setSteps] = useState<Array<IExecutionStep>>([]);

  useEffect(() => {
    async function fetchExecutionData() {
      try {
        const { account: fetchedAccount, steps: fetchedSteps } =
          await apiGetRequest(
            `/api/executions/accounts?executionId=${executionId}&address=${address}`,
            {
              next: { revalidate: 2 },
            }
          );
        setAccount(fetchedAccount);
        setSteps(fetchedSteps);
      } catch (error) {
        console.error("Error fetching execution data:", error);
      }
    }

    fetchExecutionData();
  }, [executionId, address]);

  return (
    <div className="container">
      {account && <ExAccountHeader account={account} />}

      <div className="flex flex-col gap-4">
        {account && <ExAccountCardHeader account={account} />}

        {steps.map((step, i) => (
          <ExAccountStepCard
            key={`STEP-CARD-${i}`}
            step={step}
            account={account as IExecutionAccount}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
