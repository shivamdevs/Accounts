import { NextRequest, NextResponse } from "next/server";
import { buildAppUrl } from "@/lib/constants";

export async function GET(
	request: NextRequest,
) {
	const to = request.nextUrl.searchParams.get("to");
	if (!to) {
		return NextResponse.redirect(
			buildAppUrl("/"),
		);
	}

	const continueUrl = new URL(to);
	if (!continueUrl.origin || !continueUrl.pathname) {
		return NextResponse.redirect(
			buildAppUrl("/"),
		);
	}

	return NextResponse.redirect(continueUrl);
}
