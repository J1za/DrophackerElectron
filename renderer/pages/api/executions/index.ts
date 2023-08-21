// pages/api/execution/index.js
import { prisma } from "@/db";
import { includeAllExecutionAccount, includeAllExecutionStep } from "./include";
import { revalidate } from "../utils/revalidate";
import { EStatuses } from "@/types";;

const tag = "executions"; // for revalidation

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const executionsResult = [];
      const executions = await prisma.execution.findMany({});

      for (let i = 0; i < executions.length; i++) {
        const execution = executions[i];

        const accounts = await prisma.executionAccount.findMany({
          where: {
            executionId: execution.id,
          },
          select: {
            ...includeAllExecutionAccount,
            account: {
              select: {
                name: true,
                address: true,
              }
            }
          }
        });

        const steps = await prisma.executionStep.findMany({
          where: {
            executionId: execution.id,
          },
          select: {
            ...includeAllExecutionStep,
            states: true
          },
          orderBy: {
            stepNumber: "asc",
          },
        });

        const parsedSteps = [];
        for (const step of steps) {
          parsedSteps.push(parseStep(step));
        }

        executionsResult.push({
          ...execution,
          steps: parsedSteps,
          accounts
        });
      }

      res.status(200).json(executionsResult);
    } catch (e) {
      console.error(e);
      res.status(500).send("An error occurred");
    } finally {
      await prisma.$disconnect();
    }
  } else if (req.method === "POST") {
    try {
      const { name, steps, accounts } = req.body;
      console.log(steps)
      if (!Array.isArray(steps) || !Array.isArray(accounts)) {
        throw new Error("Invalid Input");
      }

      const newExecution = await prisma.execution.create({
        data: {
          name,
          status: EStatuses.PENDING,
        },
      });

      revalidate(req, tag);

      const newSteps = [];
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        delete step.id;
        delete step.taskId;
        const newStep = await createStep(step, newExecution.id, i);
        newSteps.push(newStep);
      }

      const newExAccounts = [];
      for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];

        const newExAccount = await prisma.executionAccount.create({
          data: {
            address: account.address,
            status: EStatuses.PENDING,
            executionId: newExecution.id,
          }
        })
        newExAccounts.push(newExAccount);
      }

      res.status(200).json({ ...newExecution, steps: newSteps, accounts: newExAccounts });
    } catch (e) {
      console.error(e);
      res.status(500).send("An error occurred");
    } finally {
      await prisma.$disconnect();
    }
  }
}

function parseStep(step) {
  return {
    ...step,
    args: JSON.parse(step.args),
  };
}

async function createStep(step, executionId, stepNumber) {
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
