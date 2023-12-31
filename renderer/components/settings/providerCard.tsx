import { InputTextDropDown } from "@/components/inputs/inputTextDropDown";
import { EStatuses, IProvider } from "@/types";
import { BigNumber, ethers, utils } from "ethers";
import React, { useEffect, useState } from "react";
import { debounce } from "lodash";
import { UseNestedObject } from "@/hooks/useNestedObject";
import BtnStatusColor from "@/components/btns/btnStatusColor";

export function ProviderCard({
  provider,
  setProvider,
  index,
}: {
  provider: IProvider;
  setProvider: UseNestedObject;
  index: number;
}) {
  const [status, setStatus] = useState(EStatuses.PENDING);
  const [blockNumber, setBlockNumber] = useState(0);
  const [ping, setPing] = useState(0);
  const [gasPrice, setGasPrice] = useState("");
  const [loading, setLoading] = useState(false);

  const devounceProvider = debounce(
    async () => {
      try {
        const _provider = new ethers.providers.JsonRpcProvider(provider?.url);
        const now = Date.now();

        const _blockNumber = await _provider.getBlockNumber();
        const timePast = Date.now();
        const _gasPrice = await _provider.getGasPrice();

        const gasPriceStr = utils.formatUnits(_gasPrice, 9);
        const gasPriceNum = Number(gasPriceStr).toFixed(2);
        console.log(_gasPrice);

        setBlockNumber(_blockNumber);
        setStatus(EStatuses.SUCCESS);
        setGasPrice(gasPriceNum);

        setPing((timePast - now) / 1000);
      } catch (e) {
        console.log("CATCH ERROR", e);
        setBlockNumber(0);
        setPing(999);
        setStatus(EStatuses.FAILED);
        setGasPrice("0");
      } finally {
        setLoading(false);
      }
    },
    1000
    // { loading: true, trailing: true }
  );

  useEffect(() => {
    if (!provider?.url) return;
    setLoading(true);

    devounceProvider();

    return () => {
      devounceProvider.cancel();
    };
  }, [devounceProvider, provider?.url]);

  const calculateGasOnGasPercent = () => {
    // console.log("GAS PRICE:", gasPrice)
    const gasBn = utils.parseUnits(gasPrice || "0", "gwei");
    // const _gasPrice = Number(gasPrice || 0)
    let numberGas = Math.ceil(Number(provider?.gasPrice));
    numberGas = 100 + numberGas;

    const resultGas = gasBn?.mul(numberGas).div(100).toString();

    return utils.formatUnits(resultGas, "gwei");
    // return (_gasPrice * numberGas).toFixed(2)
  };
  return (
    <div className="card-container settings drop-shadow-lg">
      <div className="relative flex items-center justify-between flex-inline">
        <h3 className="text-xl font-bold">{provider?.chain}</h3>
        <div className="absolute text-gray-600 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
          <span className="font-semibold">LastBlock:</span>
          <span className="ml-1">{blockNumber}</span>
        </div>

        <div className="text-gray-600">
          <span className="font-semibold">Ping:</span>
          <span className="ml-1">{ping}s</span>
        </div>
      </div>

      {/* MAINET */}
      <div className="flex items-end justify-between gap-4 flex-inline">
        <InputTextDropDown
          value={provider?.url}
          setValue={setProvider.setKey("url").setValue}
          width="100%"
        />

        {/* <InputTextDropDown
          value={provider?.gasPrice!}
          placeHolder=""
          prefix={"gwei"}
          inputStyles={{ paddingLeft: "2.85rem", minWidth: "100px", fontWeight: 600 }}
          type="number"
          setValue={setProvider.setKey("gasPrice").setValue}
        /> */}

        <InputTextDropDown
          value={provider?.gasPrice!}
          placeHolder=""
          prefix={"%"}
          inputStyles={{
            paddingLeft: "1.85rem",
            width: "100px",
            fontWeight: 600,
          }}
          type="number"
          setValue={setProvider.setKey("gasPrice").setValue}
        />

        <BtnStatusColor
          text={
            <>
              <span className="mr-1" style={{ fontWeight: 200 }}>
                gwei
              </span>{" "}
              {calculateGasOnGasPercent()}
            </>
          }
          status={provider?.gasPrice ? EStatuses.IN_PROGRESS : status}
          btnStyle={{ minWidth: "110px" }}
        />
        <BtnStatusColor
          inProgress={loading}
          status={status}
          btnStyle={{ minWidth: "110px" }}
        />
      </div>
    </div>
  );
}
