import type PocketBase from "pocketbase";

export function getAuthRecordId(record: Record<string, unknown>): string {
    return typeof record.id === "string" ? record.id : "";
}

export async function hasProfileForUser(
    pb: PocketBase,
    userId: string,
): Promise<boolean> {
    const list = await pb.collection("profiles").getList(1, 1, {
        filter: `user = \"${userId}\"`,
        fields: "id",
    });

    return list.totalItems > 0;
}
