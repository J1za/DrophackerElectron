import React, { useEffect, useState } from "react";
import { GroupContainer } from "@/components/accounts/GroupContainer";
import { IAccountGroup } from "@/types";
import { apiGetRequest } from "@/utils/apiRequest";
import AccountAddBtn from "@/components/accounts/accountAddBtn";

export default function Accounts() {
  const [groups, setGroups] = useState<IAccountGroup[]>([]);
  console.log(groups);
  useEffect(() => {
    async function fetchGroups() {
      try {
        const fetchedGroups = await apiGetRequest("/api/accounts", {
          next: { revalidate: 60 },
        });
        setGroups(fetchedGroups);
      } catch (error) {
        console.error("Error fetching account groups:", error);
      }
    }

    fetchGroups();
  }, []);

  return (
    <div className="container">
      <div className="flex flex-row items-center justify-between overflow-none">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">
          Accounts
        </h1>
        <AccountAddBtn />
      </div>

      <div
        className="flex gap-6 flex-column"
        style={{ flexDirection: "column-reverse" }}
      >
        {groups?.map((group: IAccountGroup, i: number) => (
          <GroupContainer key={i} group={group} index={groups.length - i} />
        ))}
      </div>
    </div>
  );
}
