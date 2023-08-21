import React, { useEffect, useState } from "react";
import { IStep } from "@/types";
import { apiGetRequest, apiMethodRequest } from "@/utils/apiRequest";
import { useObjectBool } from "@/hooks/useObjectBool";
import { useNestedObject } from "@/hooks/useNestedObject";
import { TaskStep } from "@/components/tasks/TaskStep";
import ModalStepName from "@/components/tasks/modalStepName";
import { EColors } from "../../../types/enums/colors";
import { useNestedArrayObject } from "@/hooks/useNestedObjectArray";
import SpinnerCenter from "@/components/spinnerCenter";
import { InputTextDropDown } from "@/components/inputs/inputTextDropDown";
import { BtnPrimary } from "@/components/btns/btnPrimary";
import Spinner from "@/components/spinner";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";

export default function Tasks() {
  const router = useRouter();
  const taskFns = useNestedObject();
  const stepsFns = useNestedArrayObject([]);
  const optionsFns = useNestedObject();
  const [bools, setBools] = useObjectBool([
    ["loading", true],
    ["displayStep", false],
    ["inProgress", false],
  ]);

  // # Step Modal
  const [stepModalFn, setStepModalFn] = useState(() => (values: any) => {});
  const [stepModalTittle, setStepModalTittle] = useState("");
  const [initialModalStepValues, setInitialModalStepValues] = useState({});

  // ## ## Fetch Options
  useEffect(() => {
    async function fetchData() {
      const _options = await apiGetRequest("/api/tasks/options");
      optionsFns.setValue(_options);
    }
    fetchData().finally(() => setBools.loading(false));
  }, []);

  if (bools.loading) {
    return <SpinnerCenter />;
  }

  const onCLickCreate = async () => {
    try {
      if (bools.inProgress) return;
      setBools.inProgress(true);
      const task = taskFns.getValue();
      let steps = stepsFns.getValue();

      await apiMethodRequest("/api/tasks", "POST", { ...task, steps });
      setBools.inProgress(false);
      router.push("/tasks");
    } catch (e) {
      console.error(e);
    } finally {
      setBools.inProgress(false);
    }
  };
  //# # CREATE ONE STEP
  const onClickAdd = () => {
    setInitialModalStepValues({});
    setBools.displayStep(true);

    setStepModalTittle("Create Step");
    setStepModalFn(() => (values: any) => {
      stepsFns.push({
        stepName: values.stepName,
      });
    });
  };

  //# # Change Step Name
  const onClickStepChangeName = (index: number) => {
    setInitialModalStepValues(stepsFns.setIndex(index).getValue());
    setBools.displayStep(true);
    setStepModalTittle("Change Step Name");
    setStepModalFn(() => (values: any) => {
      stepsFns.setIndex(index).setKey("stepName").setValue(values.stepName);
      // stepsFns.push({ stepName: values.stepName, stepNumber: stepsFns.getValue().length + 1 });
    });
  };

  // # # Delete Step
  const onClickStepDelete = (index: number) => {
    stepsFns.remove(index);
  };

  return (
    <div className="container">
      {/* PAGE TITLE */}
      <div className="flex items-center justify-between">
        <button className="pl-2 hover:scale-125" onClick={() => router.back()}>
          <FontAwesomeIcon size="xl" icon={faArrowLeftLong} />
        </button>
        <h1 className="text-4xl font-black">CREATE TASK</h1>
        <BtnPrimary
          color={EColors.GREEN}
          btnClass="sm"
          text="Create Task" // ADD STEP
          prefix={bools.inProgress && <Spinner />}
          inProgress={bools.inProgress}
          onClick={onCLickCreate}
        />
      </div>

      {/* TASK CONTAINER */}
      <div className="card-container task drop-shadow-lg">
        <div className="pl-8 header">
          {/* TASK NAME */}
          <div className="flex items-center gap-4 flex-inline">
            <h3 className="mt-2 text-xl font-bold text-gray-600">TaskName</h3>
            <InputTextDropDown
              label=""
              value={taskFns.setKey("name").getValue()}
              setValue={taskFns.setKey("name").setValue}
            />
          </div>

          {/*//* TASK BTNS */}
          <div className="flex items-center gap-2 flex-inline">
            <BtnPrimary
              color={EColors.CYAN}
              btnClass="sm"
              text="Add Step" // ADD STEP
              onClick={onClickAdd}
            />
          </div>
        </div>

        {/*//** STEPS */}
        {!stepsFns.getValue().length ? (
          <></>
        ) : (
          stepsFns.getValue().map((step, i) => {
            return (
              <TaskStep
                key={i}
                step={step as IStep}
                setStep={stepsFns.setIndex(i)}
                index={i}
                options={optionsFns.getValue()}
                onClickDelete={onClickStepDelete}
                onClickChangeName={onClickStepChangeName}
                onClickMove={(index) => {
                  console.log("Task Container MOVING", index);
                }}
              />
            );
          })
        )}
      </div>

      {/* Modal for Step Name (Crate and Edit) */}
      {bools.displayStep && (
        <ModalStepName
          title={stepModalTittle}
          display={bools.displayStep}
          setDisplay={setBools.displayStep}
          onClick={stepModalFn}
          initialValues={initialModalStepValues}
        />
      )}
    </div>
  );
}
