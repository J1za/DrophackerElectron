import { useEffect, useState } from "react";
import { ExchangesContainer } from "@/components/settings/exchangesContainer";
import { Exchange } from "@prisma/client";
import { EExchanges } from "@/types";
import { apiGetRequest, apiMethodRequest } from "@/utils/apiRequest";
import SettingsLayout from "../SettingsLayout";

async function fetchExchanges(): Promise<Array<Exchange>> {
  return await apiGetRequest("/api/settings/exchanges");
}

export default function Exchanges() {
  const [exchanges, setExchanges] = useState<Array<Exchange>>([]);

  useEffect(() => {
    async function loadExchanges() {
      let fetchedExchanges = await fetchExchanges();

      if (!fetchedExchanges?.length) {
        fetchedExchanges = await apiMethodRequest(
          "/api/settings/exchanges",
          "POST",
          [
            {
              name: EExchanges.OKEX,
              url: "https://www.okx.com",
              credentials: {
                apiKey: "apiKey",
                secretKey: "secretKey",
                passphrase: "passphrase",
              },
            },
          ]
        );
      }

      setExchanges(fetchedExchanges);
    }

    loadExchanges();
  }, []);

  return (
    <SettingsLayout>
      <ExchangesContainer exchanges={exchanges} />
    </SettingsLayout>
  );
}

{
  /* <div className="card-container settings drop-shadow-lg">
        <h3 className="text-2xl font-bold">Providers</h3>

        <div className="flex items-center gap-4 flex-inline">
          <label
            className="font-bold"
            style={{ minWidth: "120px", fontSize: "1rem" }}
          >
            Mainet
          </label>
          <InputTextDropDown
            value={mainetProvider?.url}
            setValue={setMainetFns.editByKey("url")}
            width="40%"
          />
        </div>

        <div className="flex items-center gap-4 flex-inline">
          <label
            className="font-bold"
            style={{ minWidth: "120px", fontSize: "1rem" }}
          >
            zkSync
          </label>
          <InputTextDropDown
            value={zkSyncProvider?.url}
            setValue={setZkSyncFns.editByKey("url")}
            width="40%"
          />
        </div>

        <div style={{ display: "flex", marginTop: "1rem" }}>
          <BtnPrimary
            prefix={bools.inProgress && <Spinner />}
            inProgress={bools.inProgress}
            text="Save"
            onClick={saveHandler}
          />
        </div>
      </div> */
}
