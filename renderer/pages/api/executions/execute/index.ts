import { prisma } from "@/db";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { EStatuses } from "@/types";
import { execute } from "@/providers/execution/execute";
import { Execution } from "@prisma/client";

const tag = "executions"; // for revalidation
let isRunning = false;

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const path = req.query.path || "/";

      if (isRunning) {
        console.log("\n\nExecution is still running...\n\n\n");
        return res.status(200).json({ executed: 0, isRunning });
      }
      console.log("\n\nEXECUTING...\n\n\n");

      const executions = await prisma.execution.findMany({
        where: {
          status: EStatuses.IN_PROGRESS,
        },
      });

      if (!executions.length) {
        return res.status(200).json({ executed: 0 });
      }

      isRunning = true;
      for (const ex of executions) {
        await execute(ex);
      }

      return res.status(200).json({ executed: executions.length });
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "An error occurred", error: getErrorMessage(e) });
    } finally {
      isRunning = false;
    }
  } else if (req.method === "POST") {
    const statuses = [EStatuses.PENDING, EStatuses.FAILED, EStatuses.STOPED];
    try {
      const { id } = req.body;

      const path = req.query.path || "/";

      const newExecution = await prisma.execution.update({
        where: { id },
        data: { status: EStatuses.IN_PROGRESS },
      });

      return res.status(200).json(newExecution);
    } catch (e) {
      console.error(e);
      return res.status(500).json({ message: "An error occurred", error: getErrorMessage(e) });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    return res.status(405).send("Method Not Allowed");
  }
}
