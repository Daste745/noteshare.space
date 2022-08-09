import type { EncryptedNote } from '$lib/model/EncryptedNote';
import type { RequestHandler } from '@sveltejs/kit';

export const get: RequestHandler = async ({ request, clientAddress, params }) => {
	const ip = (request.headers.get('cd-connecting-ip') ||
		request.headers.get('x-forwarded-for') ||
		clientAddress) as string;
	const url = `${import.meta.env.VITE_SERVER_INTERNAL}/api/note/${params.id}`;
	const response = await fetch(url, {
		headers: {
			'x-forwarded-for': ip
		}
	});

	if (response.ok) {
		try {
			const note: EncryptedNote = await response.json();
			note.insert_time = new Date(note.insert_time as unknown as string);
			note.expire_time = new Date(note.expire_time as unknown as string);
			const maxage = Math.floor((note.expire_time.valueOf() - note.insert_time.valueOf()) / 1000);
			return {
				status: response.status,
				headers: {
					'Cache-Control': `public, max-age=${maxage}`
				},
				cache: {
					maxage: maxage,
					private: false
				},
				body: { note }
			};
		} catch {
			return {
				status: 500,
				error: response.statusText
			};
		}
	} else {
		return {
			status: response.status,
			error: response.statusText
		};
	}
};
