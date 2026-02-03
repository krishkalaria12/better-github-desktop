import { open } from "@tauri-apps/plugin-dialog";

export async function openFolderSelector() {
  const folder = await open({
    multiple: false,
    directory: true,
  });

  return folder;
}
