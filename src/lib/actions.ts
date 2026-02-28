"use server";

import { cookies } from "next/headers";
import { getServerPb } from "@/lib/pocketbase";
import {
	buildProfileOnboardingUrl,
	COOKIE_DOMAIN,
	COOKIE_MAX_AGE_SECONDS,
	COOKIE_NAME,
	COOKIE_SAME_SITE,
	getDefaultAvatarUrl,
	IS_PROD,
} from "@/lib/constants";
import { getAuthRecordId, hasProfileForUser } from "@/lib/profile";
import { normalizeContinueUrl } from "@/lib/redirect";

export type AuthResult =
	| { ok: true; redirectTo: string }
	| { ok: false; error: string; code?: "EMAIL_NOT_VERIFIED" };

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
	const token = pb.authStore.token;
	return JSON.stringify({ token, record });
}

function setAuthCookie(
	cookieStore: Awaited<ReturnType<typeof cookies>>,
	pb: ReturnType<typeof getServerPb>,
) {
	cookieStore.set(COOKIE_NAME, serializeAuthCookie(pb), {
		domain: IS_PROD ? COOKIE_DOMAIN : undefined,
		secure: IS_PROD,
		httpOnly: true,
		sameSite: COOKIE_SAME_SITE,
		path: "/",
		maxAge: COOKIE_MAX_AGE_SECONDS,
	});
}

export async function signIn(
	identifier: string,
	password: string,
	continueUrl: string | null,
): Promise<AuthResult> {
	try {
		const pb = getServerPb();
		const authData = await pb
			.collection("users")
			.authWithPassword(identifier, password);

		if (!authData.record.verified) {
			pb.authStore.clear();
			return {
				ok: false,
				error: "Verify your email before signing in.",
				code: "EMAIL_NOT_VERIFIED",
			};
		}

		const cookieStore = await cookies();
		setAuthCookie(cookieStore, pb);

		const userId = getAuthRecordId(
			authData.record as Record<string, unknown>,
		);
		const hasProfile = userId ? await hasProfileForUser(pb, userId) : false;

		if (!hasProfile && userId) {
			const nextContinue = normalizeContinueUrl(continueUrl);
			return {
				ok: true,
				redirectTo: buildProfileOnboardingUrl(nextContinue),
			};
		}

		return { ok: true, redirectTo: normalizeContinueUrl(continueUrl) };
	} catch (err: unknown) {
		const message = err instanceof Error
			? err.message
			: "Authentication failed.";
		return {
			ok: false,
			error: message.replace(
				"Failed to authenticate.",
				"Invalid email or password.",
			),
		};
	}
}

export async function signUp(
	email: string,
	password: string,
	username: string,
	name: string,
	continueUrl: string | null,
): Promise<AuthResult> {
	try {
		if (!name.trim()) {
			return { ok: false, error: "Name is required." };
		}

		const pb = getServerPb();

		const created = (await pb.collection("users").create({
			email,
			username,
			password,
			passwordConfirm: password,
			name,
			role: "user",
			avatar_url: "https://avatars.shivamdevs.com",
		})) as {
			id: string;
			username: string;
		};

		const avatarUrl = getDefaultAvatarUrl(created.id, created.username);
		await pb.collection("users").update(created.id, {
			avatar_url: avatarUrl,
		});

		await pb.collection("users").requestVerification(email);

		const continueTo = encodeURIComponent(
			normalizeContinueUrl(continueUrl),
		);
		return {
			ok: true,
			redirectTo:
				`/signin/v1/identifier?status=verify-sent&continue=${continueTo}`,
		};
	} catch (err: unknown) {
		const message = err instanceof Error
			? err.message
			: "Registration failed.";
		return { ok: false, error: message };
	}
}

// ── OTP actions ────────────────────────────────────────────────────────────

export type OtpRequestResult =
	| { ok: true; otpId: string }
	| { ok: false; error: string };

export async function requestOtp(email: string): Promise<OtpRequestResult> {
	try {
		const pb = getServerPb();
		const result = await pb.collection("users").requestOTP(email);
		return { ok: true, otpId: result.otpId };
	} catch (err: unknown) {
		// Surface a generic message — do not reveal whether email exists
		const message = err instanceof Error
			? err.message
			: "Failed to send OTP.";
		return { ok: false, error: message };
	}
}

export async function verifyOtp(
	otpId: string,
	otp: string,
	continueUrl: string | null,
): Promise<AuthResult> {
	try {
		const pb = getServerPb();
		const authData = await pb.collection("users").authWithOTP(otpId, otp);

		if (!authData.record.verified) {
			pb.authStore.clear();
			return {
				ok: false,
				error: "Verify your email before signing in.",
				code: "EMAIL_NOT_VERIFIED",
			};
		}

		const cookieStore = await cookies();
		setAuthCookie(cookieStore, pb);

		const userId = getAuthRecordId(
			authData.record as Record<string, unknown>,
		);
		const hasProfile = userId ? await hasProfileForUser(pb, userId) : false;

		if (!hasProfile && userId) {
			const nextContinue = normalizeContinueUrl(continueUrl);
			return {
				ok: true,
				redirectTo: buildProfileOnboardingUrl(nextContinue),
			};
		}

		return { ok: true, redirectTo: normalizeContinueUrl(continueUrl) };
	} catch (err: unknown) {
		const message = err instanceof Error
			? err.message
			: "OTP verification failed.";
		return {
			ok: false,
			error: message.replace(
				"Failed to authenticate.",
				"Invalid or expired OTP.",
			),
		};
	}
}

export async function signOut(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.delete({
		name: COOKIE_NAME,
		domain: IS_PROD ? COOKIE_DOMAIN : undefined,
		path: "/",
	});
}
