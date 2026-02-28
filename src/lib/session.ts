import { cookies } from "next/headers";

import { COOKIE_NAME } from "@/lib/constants";
import { getServerPb } from "@/lib/pocketbase";

type AuthCookiePayload = {
    token: string;
    record: Record<string, unknown>;
};

export async function getAuthPayloadFromCookie(): Promise<
    AuthCookiePayload | null
> {
    const cookieStore = await cookies();
    const raw = cookieStore.get(COOKIE_NAME)?.value;
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw) as AuthCookiePayload;
        if (!parsed?.token) return null;
        return parsed;
    } catch {
        return null;
    }
}

export async function hasValidSession(): Promise<boolean> {
    const auth = await getAuthPayloadFromCookie();
    if (!auth) return false;

    try {
        const pb = getServerPb();
        pb.authStore.save(auth.token, auth.record);
        await pb.collection("users").authRefresh();
        return true;
    } catch {
        return false;
    }
}
