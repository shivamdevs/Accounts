import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export async function GET(request: Request) {
	const url = new URL(request.url);
	url.pathname = ROUTES.auth;
	redirect(url.toString());
}
