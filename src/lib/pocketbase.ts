import PocketBase from "pocketbase";
import { PB_URL } from "@/lib/constants";

// Browser-safe singleton (one instance per browser tab)
let _clientPb: PocketBase | null = null;

export function getClientPb(): PocketBase {
	if (!_clientPb) {
		_clientPb = new PocketBase(PB_URL);
		_clientPb.autoCancellation(false);
	}
	return _clientPb;
}

// Server-side: fresh instance per request (no shared state between SSR requests)
export function getServerPb(): PocketBase {
	return new PocketBase(PB_URL);
}
