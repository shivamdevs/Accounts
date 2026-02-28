import { NextRequest, NextResponse } from "next/server";

import { normalizeContinueUrl } from "@/lib/redirect";

/**
 * GET /onboarding/complete?continue=<url>
 *
 * Called by the external profile app once the user finishes onboarding.
 * Redirects back to the requested continue destination.
 */
export async function GET(request: NextRequest) {
    const continueUrl = request.nextUrl.searchParams.get("continue");
    return NextResponse.redirect(normalizeContinueUrl(continueUrl));
}
