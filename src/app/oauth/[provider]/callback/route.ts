import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
	buildAppUrl,
	buildProfileOnboardingUrl,
	COOKIE_DOMAIN,
	COOKIE_MAX_AGE_SECONDS,
	COOKIE_NAME,
	COOKIE_SAME_SITE,
	IS_PROD,
	isOAuthProvider,
	OAUTH_CTX_COOKIE_NAME,
	type OAuthProvider,
	ROUTES,
} from "@/lib/constants";
import { buildErrorRoute } from "@/lib/error-route";
import { getAuthRecordId, hasProfileForUser } from "@/lib/profile";
import { normalizeContinueUrl } from "@/lib/redirect";
import { getServerPb } from "@/lib/pocketbase";

type OAuthContext = {
	provider: OAuthProvider;
	codeVerifier: string;
	continueUrl: string;
	redirectUri: string;
};

type OAuthAuthData = {
	record: Record<string, unknown>;
	meta?: {
		isNew?: boolean;
	};
};

const USERNAME_PATTERN = /^[a-z0-9_.]{3,64}$/;

function sanitizeUsername(raw: unknown): string {
	if (typeof raw !== "string") return "";
	return raw.toLowerCase().replace(/[^a-z0-9_.]/g, "");
}

function randomUsername(): string {
	return `user_${Math.random().toString(36).slice(2, 14)}`;
}

function buildOAuthCreateData(provider: OAuthProvider): {
	username: string;
	role: "user";
} {
	return {
		username: `${provider}_${randomUsername()}`.slice(0, 64),
		role: "user",
	};
}

function buildUsernameCandidates(record: Record<string, unknown>): string[] {
	const oauthUsername = sanitizeUsername(record.oauth_username).slice(0, 64);
	const email = typeof record.email === "string" ? record.email : "";
	const emailLocal = sanitizeUsername(email.split("@")[0] ?? "").slice(0, 64);
	const oauthId = sanitizeUsername(record.oauth_id);
	const oauthWithId = sanitizeUsername(
		oauthUsername && oauthId ? `${oauthUsername}.${oauthId}` : "",
	).slice(0, 64);

	const candidates = [oauthUsername, emailLocal, oauthWithId].filter(
		(value) => USERNAME_PATTERN.test(value),
	);

	return Array.from(new Set(candidates));
}

async function setUsernameIfAvailable(
	pb: ReturnType<typeof getServerPb>,
	userId: string,
	candidate: string,
): Promise<boolean> {
	try {
		await pb.collection("users").update(userId, { username: candidate });
		return true;
	} catch {
		return false;
	}
}

function isNewOAuthUser(authData: OAuthAuthData): boolean {
	return authData.meta?.isNew === true;
}

function hasPlaceholderOAuthUsername(
	record: Record<string, unknown>,
	provider: OAuthProvider,
): boolean {
	const username = typeof record.username === "string" ? record.username : "";
	return username.startsWith(`${provider}_user_`);
}

async function resolveOAuthUsername(
	pb: ReturnType<typeof getServerPb>,
	record: Record<string, unknown>,
): Promise<void> {
	const id = getAuthRecordId(record);
	if (!id) return;

	const candidates = buildUsernameCandidates(record);
	for (const candidate of candidates) {
		const updated = await setUsernameIfAvailable(pb, id, candidate);
		if (updated) return;
	}
}

function serializeAuthCookie(pb: ReturnType<typeof getServerPb>): string {
	const record = (pb.authStore.record as Record<string, unknown> | null) ??
		{};
	return JSON.stringify({ token: pb.authStore.token, record });
}

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
						"The callback used an unknown provider. Start sign-in again.",
					primaryHref: ROUTES.signInIdentifier,
					primaryLabel: "Back to sign in",
				}),
			),
		);
	}

	const code = request.nextUrl.searchParams.get("code");
	if (!code) {
		return NextResponse.redirect(
			buildAppUrl(
				buildErrorRoute({
					code: "oauth-missing-code",

					title: "OAuth callback is missing code",

					message:
						"The provider response didn't include an authorization code.",
					primaryHref: ROUTES.signInIdentifier,
					primaryLabel: "Try sign in again",
				}),
			),
		);
	}

	const cookieStore = await cookies();
	const rawCtx = cookieStore.get(OAUTH_CTX_COOKIE_NAME)?.value;
	if (!rawCtx) {
		return NextResponse.redirect(
			buildAppUrl(
				buildErrorRoute({
					code: "oauth-missing-context",
					title: "OAuth session expired",
					message:
						"Your OAuth session context was not found. Please start sign-in again.",
					primaryHref: ROUTES.signInIdentifier,
					primaryLabel: "Start sign in again",
				}),
			),
		);
	}

	let oauthCtx: OAuthContext;
	try {
		oauthCtx = JSON.parse(rawCtx) as OAuthContext;
	} catch {
		cookieStore.delete(OAUTH_CTX_COOKIE_NAME);
		return NextResponse.redirect(
			buildAppUrl(
				buildErrorRoute({
					code: "oauth-invalid-context",
					title: "Invalid OAuth session",
					message:
						"The stored OAuth context is invalid. Please restart sign-in.",
					primaryHref: ROUTES.signInIdentifier,
					primaryLabel: "Start sign in again",
				}),
			),
		);
	}

	if (oauthCtx.provider !== provider) {
		cookieStore.delete(OAUTH_CTX_COOKIE_NAME);
		return NextResponse.redirect(
			buildAppUrl(
				buildErrorRoute({
					code: "oauth-provider-mismatch",
					title: "OAuth provider mismatch",
					message:
						"The callback provider doesn't match your started sign-in flow.",
					primaryHref: ROUTES.signInIdentifier,
					primaryLabel: "Start sign in again",
				}),
			),
		);
	}

	try {
		const pb = getServerPb();
		const authData = await pb.collection("users").authWithOAuth2Code(
			oauthCtx.provider,
			code,
			oauthCtx.codeVerifier,
			oauthCtx.redirectUri,
			buildOAuthCreateData(oauthCtx.provider),
		) as OAuthAuthData;

		if (!authData.record.verified) {
			return NextResponse.redirect(
				buildAppUrl(
					`/signin/v1/identifier?status=verify-required&continue=${
						encodeURIComponent(oauthCtx.continueUrl)
					}`,
				),
			);
		}

		if (
			isNewOAuthUser(authData) ||
			hasPlaceholderOAuthUsername(authData.record, oauthCtx.provider)
		) {
			await resolveOAuthUsername(pb, authData.record);
		}
		await pb.collection("users").authRefresh();

		cookieStore.set(COOKIE_NAME, serializeAuthCookie(pb), {
			domain: IS_PROD ? COOKIE_DOMAIN : undefined,
			secure: IS_PROD,
			httpOnly: true,
			sameSite: COOKIE_SAME_SITE,
			path: "/",
			maxAge: COOKIE_MAX_AGE_SECONDS,
		});
		cookieStore.delete(OAUTH_CTX_COOKIE_NAME);

		const userId = getAuthRecordId(authData.record);
		const hasProfile = userId ? await hasProfileForUser(pb, userId) : false;
		if (!hasProfile && userId) {
			return NextResponse.redirect(
				buildAppUrl(
					`/redirect?to=${
						buildProfileOnboardingUrl(
							normalizeContinueUrl(oauthCtx.continueUrl),
						)
					}`,
				),
			);
		}

		return NextResponse.redirect(
			buildAppUrl(
				`/redirect?to=${normalizeContinueUrl(oauthCtx.continueUrl)}`,
			),
		);
	} catch (error) {
		console.error("OAuth callback failed", {
			provider,
			message: error instanceof Error ? error.message : String(error),
		});
		cookieStore.delete(OAUTH_CTX_COOKIE_NAME);
		return NextResponse.redirect(
			buildAppUrl(
				buildErrorRoute({
					code: "oauth-failed",
					title: "OAuth sign-in failed",
					message:
						"We couldn't complete OAuth sign-in. Please try again or use another sign-in method.",
					primaryHref: ROUTES.signInIdentifier,
					primaryLabel: "Back to sign in",
					secondaryHref: "/",
					secondaryLabel: "Go to homepage",
				}),
			),
		);
	}
}
