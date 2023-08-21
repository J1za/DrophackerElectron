import { useEffect, useState } from "react";
import { apiGetRequest } from "@/utils/apiRequest";
import { TaskContainer } from "@/components/tasks/taskContainer";
import AddTaskBtn from "@/components/tasks/btnAddTask";

export default function Tasks() {
  const [data, setData] = useState({
    tasks: [],
    options: [],
    groups: [],
  });
  console.log(data);
  useEffect(() => {
    async function fetchData() {
      const [tasksData, optionsData, groupsData] = await Promise.all([
        apiGetRequest("/api/tasks"),
        apiGetRequest("/api/tasks/options"),
        apiGetRequest("/api/accounts"),
      ]);

      setData({
        tasks: tasksData,
        options: optionsData,
        groups: groupsData,
      });
    }

    fetchData();
  }, []);

  return (
    <div className="container">
      <div className="flex items-end justify-between flex-inline overflow-none">
        <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-4xl">
          TASKS
        </h1>
        <AddTaskBtn />
      </div>

      <div className="flex flex-col-reverse gap-8">
        {data &&
          data.tasks?.map((task) => (
            <TaskContainer
              key={task.id}
              task={task}
              options={data.options}
              groups={data.groups}
              index={data.tasks.length - data.tasks.indexOf(task)}
            />
          ))}
      </div>
    </div>
  );
}
