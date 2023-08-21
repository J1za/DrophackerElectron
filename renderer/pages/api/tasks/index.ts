import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/db';
import { IStep, ITask } from "@/types";
import { getErrorMessage } from '@/utils/getErrorMessage';
import { TaskStep } from '@prisma/client';

async function parseStep(step: TaskStep) {
    return {
        ...step,
        args: JSON.parse(step.args),
    };
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        if (req.method === 'GET') {
            const tasksResult = [];
            const tasks = await prisma.task.findMany({});

            for (const task of tasks) {
                const steps = await prisma.taskStep.findMany({
                    where: {
                        taskId: task.id,
                    },
                    orderBy: {
                        stepNumber: 'asc',
                    },
                });

                const parsedSteps = await Promise.all(steps.map(parseStep));

                tasksResult.push({
                    ...task,
                    steps: parsedSteps,
                });
            }

            res.status(200).json(tasksResult);
        } else if (req.method === 'POST') {
            const { name, steps = [] } = req.body as ITask; // Assuming ITask is a type

            const newTask = await prisma.task.create({
                data: {
                    name,
                },
            });

            const path = req.query.path as string | undefined || '/';

            const newSteps: TaskStep[] = [];
            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];

                const newStep = await createStep(step, newTask.id, i);
                newSteps.push(newStep);
            }

            res.status(200).json({ ...newTask, steps: newSteps });
        } else if (req.method === 'PUT') {
            const { id, name, steps = [] } = req.body as ITask; // Assuming ITask is a type

            const updatedTask = await prisma.task.update({
                where: { id },
                data: { name },
            });

            if (!updatedTask.id) throw new Error('Invalid Task Id');

            const path = req.query.path as string | undefined || '/';

            const updatedSteps: TaskStep[] = [];
            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                let resStep: TaskStep;

                if (step.id) {
                    resStep = await updateStep(step, updatedTask.id, i);
                } else {
                    resStep = await createStep(step, updatedTask.id, i);
                }
                updatedSteps.push(resStep);
            }

            res.status(200).json({ ...updatedTask, steps: updatedSteps });
        } else if (req.method === 'DELETE') {
            const { id } = req.query;

            if (id) {
                const taskSteps = await prisma.taskStep.findMany({
                    where: {
                        taskId: id as string,
                    },
                });

                for (const step of taskSteps) {
                    await prisma.taskStep.delete({
                        where: {
                            id: step.id,
                        },
                    });
                }

                const delTask = await prisma.task.delete({
                    where: {
                        id: id as string,
                    },
                });

                if (!delTask.id) throw new Error('Invalid Task Id');
            } else {
                const steps = req.query.steps as string | undefined;

                if (steps) {
                    const stepIds: string[] = JSON.parse(steps);

                    for (const stepId of stepIds) {
                        await prisma.taskStep.delete({
                            where: {
                                id: stepId,
                            },
                        });
                    }
                } else {
                    throw new Error("'steps' array was not provided");
                }
            }

            res.status(200).json(true);
        } else {
            res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (e) {
        console.error(e);
        res.status(500).json({
            error: 'An error occurred',
            statusText: getErrorMessage(e),
        });
    } finally {
        await prisma.$disconnect();
    }
}


async function createStep(step: TaskStep, taskId: string, stepNumber: number) {
    const newStep = await prisma.taskStep.create({
        data: {
            ...step,
            stepNumber,
            args: JSON.stringify(step.args),
            taskId,
        },
    });

    return parseStep(newStep);
}

async function updateStep(step: TaskStep, taskId: string, stepNumber: number) {
    const updatedStep = await prisma.taskStep.update({
        where: {
            id: step.id,
        },
        data: {
            ...step,
            stepNumber,
            args: JSON.stringify(step.args),
            taskId,
        },
    });
    return parseStep(updatedStep);
}