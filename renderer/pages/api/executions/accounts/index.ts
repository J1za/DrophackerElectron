import { prisma } from "@/db";
import {
  EExecutionAccountsMethods,
  EStatuses,
} from "@/types";
import {
  ExecutionAccount,
  ExecutionStep,
} from "@prisma/client";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { revalidate } from "@/pages/api/utils/revalidate";
import {
  includeAllExecutionAccount,
  includeAllExecutionStep,
  includeAllStepState,
} from "../include";

const tag = "executions"; // for revalidation

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const executionId = req.query.executionId;
      const address = req.query.address;

      if (executionId && address) {
        const account = await prisma.executionAccount.findFirst({
          where: { executionId, address },
          select: {
            ...includeAllExecutionAccount,
            account: true,
            execution: true,
          },
        });

        const steps = await prisma.executionStep.findMany({
          where: {
            executionId,
          },
          select: {
            ...includeAllExecutionStep,

            states: {
              where: { accountExecutionId: account?.id },
              select: {
                ...includeAllStepState,
                actions: true,
              },
            },
          },
        });

        return res.status(200).json({ account, steps });
      }
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "An error occurred", error: getErrorMessage(e) });
    } finally {
      await prisma.$disconnect();
    }
  } else if (req.method === "PUT") {
    try {
      // todo Transaction
      const method = req.query.method;
      const body = await req.body;
      const { accounts, status } = body as {
        status: EStatuses;
        accounts: Array<ExecutionAccount>;
      };
      const newAccounts = [];

      revalidate(req, tag);

      switch (method) {
        case EExecutionAccountsMethods.UPDATE_STATUS:
          for (const acc of accounts) {
            const newAcc = await prisma.executionAccount.update({
              where: { id: acc.id },
              data: { status },
            });
            try {
              const step = await prisma.executionStep.findFirst({ where: { executionId: acc.executionId, stepNumber: acc.currentStep } });
              if (step) {
                const stepState = await prisma.stepState.findFirst({ where: { stepId: step.id, accountExecutionId: acc.id } });
                await prisma.stepState.update({
                  where: { id: stepState?.id },
                  data: { status },
                });
                const action = await prisma.stepActionState.findFirst({ where: { stepStateId: stepState!.id, actionNumber: stepState?.currentAction } });
                await prisma.stepActionState.update({
                  where: { id: action?.id },
                  data: { status },
                });
              }
            } catch (e) { }
            newAccounts.push(newAcc);
          }
          break;
        case EExecutionAccountsMethods.RESTART_ACTION:
          for (const acc of accounts) {
            await prisma.executionAccount.update({
              where: { id: acc.id },
              data: { status: EStatuses.PENDING },
            });
            const step = await prisma.executionStep.findFirst({ where: { executionId: acc.executionId, stepNumber: acc.currentStep } });
            const stepState = await prisma.stepState.findFirst({
              where: { accountExecutionId: acc.id, stepId: step?.id },
              select: { actions: true, id: true },
            });
            await prisma.stepState.update({
              where: { id: stepState?.id },
              data: { status: EStatuses.PENDING },
            });
            for (const action of stepState?.actions || []) {
              await prisma.stepActionState.delete({ where: { id: action.id } });
            }
          }
          break;
        case EExecutionAccountsMethods.SKIP_CURRENT_STEP:
          for (const acc of accounts) {
            await prisma.executionAccount.update({
              where: { id: acc.id },
              data: { currentStep: acc.currentStep + 1 },
            });
          }
          break;
        default:
          throw new Error(`Unknown Method ${method}`);
      }

      revalidate(req, tag);
      return res.status(200).json({ success: true, accounts: newAccounts });
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
    [key]: JSON.parse(step["args"]), // todo change. type conflict
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
