import { IProvider } from "@/types";
import React from "react";
import { ProviderCard } from "./providerCard";
import { useNestedArrayObject } from "@/hooks/useNestedObjectArray";
import { BtnPrimary } from "@/components/btns/btnPrimary";
import { useObjectBool } from "@/hooks/useObjectBool";
import Spinner from "@/components/spinner";
import { apiMethodRequest } from "@/utils/apiRequest";

export function ProviderContainer({
  providers,
}: {
  providers: Array<IProvider>;
}) {
  const providersFns = useNestedArrayObject(providers);
  const [bools, setBools] = useObjectBool([["inProgress", false]]);
  console.log(providers);
  return (
    <div className="flex gap-4 flex-col">
      {providers?.map((provider, i) => {
        return (
          <ProviderCard
            key={i}
            provider={provider}
            setProvider={providersFns.setIndex(i)}
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

            console.log("providersFns.getValue()", providersFns.getValue());
            const newProviders = await apiMethodRequest(
              "/api/settings/providers",
              "POST",
              providersFns.getValue()
            );
            console.log("newProviders", newProviders);

            providersFns.setValue(newProviders);
            setBools.inProgress(false);
          }}
        />
      </div>
    </div>
  );
}
