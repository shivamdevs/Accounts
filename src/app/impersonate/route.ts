import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
    buildProfileOnboardingUrl,
    COOKIE_DOMAIN,
    COOKIE_MAX_AGE_SECONDS,
    COOKIE_NAME,
    COOKIE_SAME_SITE,
    DEFAULT_CONTINUE,
    getDefaultAvatarUrl,
    IS_PROD,
    ROUTES,
} from "@/lib/constants";
import { buildErrorRoute } from "@/lib/error-route";
import { getAuthRecordId, hasProfileForUser } from "@/lib/profile";
import { normalizeContinueUrl } from "@/lib/redirect";
import { getServerPb } from "@/lib/pocketbase";

function getImpersonationToken(request: NextRequest): string | null {
    const params = request.nextUrl.searchParams;
    const explicit = params.get("impersonate_token");
    if (explicit) return explicit;

    for (const [key, value] of params.entries()) {
        if (key && !value) return key;
    }
    return null;
}

function serializeAuthCookie(pb: ReturnType<typeof getServerPb>): string {
    const baseRecord =
        (pb.authStore.record as Record<string, unknown> | null) ?? {};
    const id = typeof baseRecord.id === "string" ? baseRecord.id : "";
    const username = typeof baseRecord.username === "string"
        ? baseRecord.username
        : "";
    const record = id && username
        ? {
            ...baseRecord,
            avatarUrl: getDefaultAvatarUrl(id, username),
        }
        : baseRecord;
    return JSON.stringify({ token: pb.authStore.token, record });
}

export async function GET(request: NextRequest) {
    const token = getImpersonationToken(request);
    if (!token) {
        return NextResponse.redirect(
            new URL(
                buildErrorRoute({
                    code: "impersonate-missing-token",
                    title: "Impersonation token missing",
                    message:
                        "The impersonation link is incomplete. Request a new link from the admin panel.",
                    primaryHref: ROUTES.signInIdentifier,
                    primaryLabel: "Back to sign in",
                    secondaryHref: "/",
                    secondaryLabel: "Go to homepage",
                }),
                request.url,
            ),
        );
    }

    const continueParam = request.nextUrl.searchParams.get("continue") ??
        DEFAULT_CONTINUE;
    const continueUrl = normalizeContinueUrl(continueParam);

    try {
        const pb = getServerPb();
        pb.authStore.save(token, null);
        const refreshed = await pb.collection("users").authRefresh();

        const cookieStore = await cookies();
        cookieStore.set(COOKIE_NAME, serializeAuthCookie(pb), {
            domain: IS_PROD ? COOKIE_DOMAIN : undefined,
            secure: IS_PROD,
            httpOnly: true,
            sameSite: COOKIE_SAME_SITE,
            path: "/",
            maxAge: COOKIE_MAX_AGE_SECONDS,
        });

        const userId = getAuthRecordId(
            refreshed.record as Record<string, unknown>,
        );
        const hasProfile = userId ? await hasProfileForUser(pb, userId) : false;
        if (!hasProfile && userId) {
            return NextResponse.redirect(
                buildProfileOnboardingUrl(continueUrl),
            );
        }

        return NextResponse.redirect(continueUrl);
    } catch {
        return NextResponse.redirect(
            new URL(
                buildErrorRoute({
                    code: "impersonate-failed",
                    title: "Impersonation failed",
                    message:
                        "This impersonation token is invalid or expired. Request a fresh token and try again.",
                    primaryHref: ROUTES.signInIdentifier,
                    primaryLabel: "Back to sign in",
                    secondaryHref: "/",
                    secondaryLabel: "Go to homepage",
                }),
                request.url,
            ),
        );
    }
}
