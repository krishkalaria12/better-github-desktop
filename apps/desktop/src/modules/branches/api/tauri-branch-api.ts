import { invoke } from "@tauri-apps/api/core";

enum typeOfBranch {
  "Remote",
  "Local"
}

export interface BranchType {
  name: string,
  type_of: typeOfBranch | "Local" | "Remote",
  is_head: boolean,
}

export async function getBranches(): Promise<BranchType[]> {
  const response: BranchType[] = await invoke("list_branches");
  console.log(response)
  return response;
}
