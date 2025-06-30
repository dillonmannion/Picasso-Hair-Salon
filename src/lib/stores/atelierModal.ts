import { writable } from 'svelte/store';

export interface ModalState {
	isOpen: boolean;
	id?: string;
}

function createModalStore() {
	const { subscribe, set, update } = writable<ModalState>({
		isOpen: false
	});

	return {
		subscribe,
		open: (id?: string) => update((state) => ({ ...state, isOpen: true, id })),
		close: () => update((state) => ({ ...state, isOpen: false, id: undefined })),
		toggle: () => update((state) => ({ ...state, isOpen: !state.isOpen }))
	};
}

export const atelierModal = createModalStore();
