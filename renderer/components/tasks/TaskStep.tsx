import { UseNestedObject } from "@/hooks/useNestedObject";
import { IStep } from "@/types";
import { StepMainInput } from "./parts/StepMainInput";
import { useDefaultStepValue } from "@/hooks/useDefaultStepValue";
import { StepArgsInput } from "./parts/StepArgsInput";
import BtnMove from "@/components/btns/btnIcons/btnMove";
import BtnDropdown from "@/components/btns/btnDropdown";
import { EColors } from "../../types/enums/colors";

export function TaskStep({
  step,
  setStep,
  index,
  options,
  onClickDelete,
  onClickChangeName,
  onClickMove,
}: {
  step: IStep;
  setStep: UseNestedObject;
  index: number;
  options: any;
  onClickDelete: (index: number) => any;
  onClickChangeName: (index: number) => any;
  onClickMove: (index: number) => any;
}) {
  useDefaultStepValue(step, setStep, options);

  // const [opt, setOpt] = useState({});
  return (
    <>
      <div className="step">
        <div className="step-devider" />
        <div className="step-progress circle">
          {index + 1}
          {/* {step.stepNumber}  */}
        </div>
        <div
          className="flex flex-inline items-center"
          style={{ justifyContent: "space-between" }}
        >
          <h3 className="text-lg text-gray-600 font-bold flex items-center">
            {step.stepName}
          </h3>
          <div className="flex flex-inline gap-2">
            {/* <BtnDelete onClick={() => onClickDelete(index)} /> */}
            <BtnMove onClick={() => onClickMove(index)} />
            <BtnDropdown
              text="Step Actions"
              btnType="btn-regular"
              color={EColors.YELLOW}
              btns={[
                {
                  text: "Delete",
                  color: EColors.RED,
                  onClick: () => onClickDelete(index),
                },
                {
                  text: "Change Name",
                  onClick: () => onClickChangeName(index),
                },
              ]}
            />
          </div>
        </div>
        <StepMainInput
          step={step}
          setStep={setStep}
          options={options}
          index={index}
        />
        <StepArgsInput
          step={step}
          setStep={setStep}
          options={options}
          index={index}
        />
      </div>
    </>
  );
}
