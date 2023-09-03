import { EColors, IExecution } from "@/types";
import { ExecutionCardHeader } from "./ExecutionCardHeader";
import { ExecutionStep } from "./ExecutionStep";
import { useState } from "react";
import { ExecutionAccount } from "./ExecutionAccount";
import { BtnRegular } from "@/components/btns/BtnRegular";
import { ExecutionAccounts } from "./ExecutionAccounts";

export function ExecutionCard({
  execution,
  index,
}: {
  execution: IExecution;
  index: number;
}) {
  const [isStep, setIsStep] = useState(true);
  console.log(execution);
  return (
    <div className="card-container execution drop-shadow-lg">
      {/* CARD HEADER */}
      <ExecutionCardHeader execution={execution} />
      <div className="pb-2">
        <BtnRegular
          text={isStep ? "Steps" : "Accounts"}
          onClick={() => setIsStep((oldValue) => !oldValue)}
          btnClass="sm"
          color={EColors.CYAN}
        />
      </div>

      {isStep ? (
        <>
          <ExecutionAccounts execution={execution} setIsStep={setIsStep} />

          {execution.steps?.map((step, i) => {
            return (
              <ExecutionStep
                key={i}
                execution={execution}
                step={step}
                exIndex={i}
              />
            );
          })}
        </>
      ) : (
        <>
          {execution.accounts?.map((account, i) => {
            return (
              <ExecutionAccount
                key={i}
                execution={execution}
                account={account}
                index={i}
              />
            );
          })}
        </>
      )}
    </div>
  );
}
