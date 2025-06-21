import { deLocalizeUrl } from '$lib/paraglide/runtime';
import type { Reroute } from '@sveltejs/kit';

export const reroute: Reroute = (request) => {
	const delocalized = deLocalizeUrl(new URL(request.url));
	return delocalized.pathname;
};
