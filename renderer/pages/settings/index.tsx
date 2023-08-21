import { useEffect, useState } from "react";
import { ProviderContainer } from "@/components/settings/providerContainer";
import { EChains, IProvider } from "@/types";
import { apiGetRequest, apiMethodRequest } from "@/utils/apiRequest";

import SettingsLayout from "./SettingsLayout";

async function fetchProviders(): Promise<Array<IProvider>> {
  return await apiGetRequest("/api/settings/providers");
}

export default function Setting() {
  const [providers, setProviders] = useState<Array<IProvider>>([]);
  useEffect(() => {
    async function loadProviders() {
      let fetchedProviders = await fetchProviders();

      if (!fetchedProviders?.length) {
        fetchedProviders = await apiMethodRequest(
          "/api/settings/providers",
          "POST",
          [
            { chain: EChains.ETH, url: "https://mainnet.infura.io/v3/API_KEY" },
            { chain: EChains.ZKSYNC, url: "https://mainnet.era.zksync.io" },
          ]
        );
      }

      setProviders(fetchedProviders);
    }

    loadProviders();
  }, []);

  return (
    <SettingsLayout>
      <ProviderContainer providers={providers} />
    </SettingsLayout>
  );
}
