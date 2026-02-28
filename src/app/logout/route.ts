import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
    COOKIE_DOMAIN,
    COOKIE_NAME,
    DEFAULT_CONTINUE,
    IS_PROD,
} from "@/lib/constants";
import { normalizeContinueUrl } from "@/lib/redirect";

export async function GET(request: NextRequest) {
    const continueParam = request.nextUrl.searchParams.get("continue") ??
        DEFAULT_CONTINUE;
    const continueUrl = normalizeContinueUrl(continueParam);

    const cookieStore = await cookies();
    cookieStore.delete({
        name: COOKIE_NAME,
        domain: IS_PROD ? COOKIE_DOMAIN : undefined,
        path: "/",
    });

    return NextResponse.redirect(continueUrl);
}
