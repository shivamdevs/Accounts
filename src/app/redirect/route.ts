import { NextRequest, NextResponse } from "next/server";

export async function GET(
	request: NextRequest,
) {
	const to = request.nextUrl.searchParams.get("to");
	if (!to) {
		return NextResponse.redirect(
			new URL("/", request.url),
		);
	}

	const continueUrl = new URL(to);
	if (!continueUrl.origin || !continueUrl.pathname) {
		return NextResponse.redirect(
			new URL("/", request.url),
		);
	}

	return NextResponse.redirect(continueUrl);
}
