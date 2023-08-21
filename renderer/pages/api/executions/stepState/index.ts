import { prisma } from "@/db";
import {
  EExecutionStepStateMethods,
  EStatuses,
} from "@/types";
import { ExecutionAccount, ExecutionStep } from "@prisma/client";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { revalidate } from "../../utils/revalidate";

const tag = "executions"; // for revalidation

export default async function handler(req, res) {
  if (req.method === "PUT") {
    try {
      const method = req.query.method;
      const body = await req.body;
      const { accounts, status, stepId } = body as {
        status: EStatuses;
        accounts: Array<ExecutionAccount>;
        stepId: string;
      };

      revalidate(req, tag);

      switch (method) {
        case EExecutionStepStateMethods.UPDATE_STATUS:
          for (const acc of accounts) {
            try {
              const stepState = await prisma.stepState.findFirst({
                where: { accountExecutionId: acc.id, stepId },
              });

              if (stepState) {
                await prisma.stepState.update({ where: { id: stepState.id }, data: { status } });
              }
            } catch (e) { }
          }
          break;
        default:
          throw new Error(`Unknown Method ${method}`);
      }

      revalidate(req, tag);
      return res.status(200).json({ success: true });
    } catch (e) {
      console.error(e);
      console.error(getErrorMessage(e));
      return res.status(500).json({ message: "An error occurred", error: getErrorMessage(e) });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    return res.status(405).send("Method Not Allowed");
  }
}

// Utils function.
function parseStep(step: ExecutionStep, key = "args") {
  return {
    ...step,
    [key]: JSON.parse(step["args"]),
  };
}

async function createStep(
  step: ExecutionStep,
  executionId: string,
  stepNumber: number
) {
  const newStep = await prisma.executionStep.create({
    data: {
      ...step,
      stepNumber,
      args: JSON.stringify(step.args),
      executionId,
    },
  });

  return parseStep(newStep);
}

async function updateStep(
  step: ExecutionStep,
  executionId: string,
  stepNumber: number
) {
  const updatedStep = await prisma.executionStep.update({
    where: {
      id: step.id,
    },
    data: {
      ...step,
      stepNumber,
      args: JSON.stringify(step.args),
      executionId,
    },
  });
  return parseStep(updatedStep);
}
