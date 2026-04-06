import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
	buildAppUrl,
	buildOAuthRedirectUri,
	COOKIE_DOMAIN,
	DEFAULT_CONTINUE,
	IS_PROD,
	isOAuthProvider,
	OAUTH_CTX_COOKIE_NAME,
	OAUTH_CTX_COOKIE_SAME_SITE,
	ROUTES,
} from "@/lib/constants";
import { buildErrorRoute } from "@/lib/error-route";
import { normalizeContinueUrl } from "@/lib/redirect";
import { getServerPb } from "@/lib/pocketbase";

export async function GET(
	request: NextRequest,
	context: { params: Promise<{ provider: string }> },
) {
	const { provider } = await context.params;
	if (!isOAuthProvider(provider)) {
		return NextResponse.redirect(
			buildAppUrl(
				buildErrorRoute({
					code: "oauth-provider-not-found",
					title: "Unsupported OAuth provider",
					message:
						"The requested sign-in provider is not available in this app.",
					primaryHref: ROUTES.signInIdentifier,
					primaryLabel: "Back to sign in",
					secondaryHref: "/",
					secondaryLabel: "Go to homepage",
				}),
			),
		);
	}
	const redirectUri = buildOAuthRedirectUri(provider);

	const continueParam = request.nextUrl.searchParams.get("continue") ??
		DEFAULT_CONTINUE;
	const continueUrl = normalizeContinueUrl(continueParam);

	let oauthAuthUrl = "";
	let codeVerifier = "";

	try {
		const pb = getServerPb();
		const methods = await pb.collection("users").listAuthMethods();
		const oauth = methods.oauth2?.providers?.find((item) =>
			item.name === provider
		);

		if (!oauth) {
			return NextResponse.redirect(
				buildAppUrl(
					buildErrorRoute({
						code: "oauth-provider-unavailable",
						title: "Provider unavailable",
						message:
							"This OAuth provider is not enabled in the identity service right now.",
						primaryHref: ROUTES.signInIdentifier,
						primaryLabel: "Try another sign-in method",
						secondaryHref: "/",
						secondaryLabel: "Go to homepage",
					}),
				),
			);
		}

		oauthAuthUrl = oauth.authURL;
		codeVerifier = oauth.codeVerifier;
	} catch {
		return NextResponse.redirect(
			buildAppUrl(
				buildErrorRoute({
					code: "oauth-start-failed",
					title: "Couldn't start OAuth sign-in",
					message:
						"We couldn't contact the identity provider configuration. Please try again.",
					primaryHref: ROUTES.signInIdentifier,
					primaryLabel: "Back to sign in",
					secondaryHref: "/",
					secondaryLabel: "Go to homepage",
				}),
			),
		);
	}

	const cookieStore = await cookies();
	cookieStore.set(
		OAUTH_CTX_COOKIE_NAME,
		JSON.stringify({
			provider,
			codeVerifier,
			continueUrl,
			redirectUri,
		}),
		{
			domain: IS_PROD ? COOKIE_DOMAIN : undefined,
			secure: IS_PROD,
			httpOnly: true,
			sameSite: OAUTH_CTX_COOKIE_SAME_SITE,
			path: "/",
			maxAge: 60 * 10,
		},
	);

	return NextResponse.redirect(
		oauthAuthUrl + encodeURIComponent(redirectUri),
	);
}
