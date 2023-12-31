import React from "react";
import { useNestedArrayObject } from "@/hooks/useNestedObjectArray";
import { BtnPrimary } from "@/components/btns/btnPrimary";
import { useObjectBool } from "@/hooks/useObjectBool";
import Spinner from "@/components/spinner";
import { apiMethodRequest } from "@/utils/apiRequest";
import { Exchange } from "@prisma/client";
import { ExchangeCard } from "./exchangeCard";

export function ExchangesContainer({
  exchanges,
}: {
  exchanges: Array<Exchange>;
}) {
  const exchangesFns = useNestedArrayObject(exchanges);
  const [bools, setBools] = useObjectBool([["inProgress", false]]);
  console.log(exchanges);
  return (
    <div className="flex gap-4 flex-col">
      {exchanges.map((exchange, i) => {
        return (
          <ExchangeCard
            key={i}
            exchange={exchange as any}
            setExchange={exchangesFns.setIndex(i)}
            index={i}
          />
        );
      })}

      <div>
        <BtnPrimary
          prefix={bools.inProgress && <Spinner fill="#fff" color="#fff0" />}
          inProgress={bools.inProgress}
          text="Save"
          onClick={async () => {
            setBools.inProgress(true);

            console.log("exchangesFns.getValue()", exchangesFns.getValue());
            const newExchanges = await apiMethodRequest(
              "/api/settings/exchanges",
              "POST",
              exchangesFns.getValue()
            );
            console.log("newExchanges", newExchanges);

            exchangesFns.setValue(newExchanges);
            setBools.inProgress(false);
          }}
        />
      </div>
    </div>
  );
}
