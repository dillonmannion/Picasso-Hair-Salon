import { writable, derived } from 'svelte/store';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
	id: string;
	type: NotificationType;
	title: string;
	message?: string;
	duration?: number;
	actions?: Array<{
		label: string;
		action: () => void;
	}>;
}

function createNotificationStore() {
	const { subscribe, update } = writable<Notification[]>([]);

	function add(notification: Omit<Notification, 'id'>) {
		const id = crypto.randomUUID();
		const newNotification: Notification = {
			id,
			duration: 5000,
			...notification
		};

		update(notifications => [...notifications, newNotification]);

		if (newNotification.duration && newNotification.duration > 0) {
			setTimeout(() => {
				remove(id);
			}, newNotification.duration);
		}

		return id;
	}

	function remove(id: string) {
		update(notifications => notifications.filter(n => n.id !== id));
	}

	function clear() {
		update(() => []);
	}

	return {
		subscribe,
		add,
		remove,
		clear,
		success: (title: string, message?: string, duration?: number) =>
			add({ type: 'success', title, message, duration }),
		error: (title: string, message?: string, duration?: number) =>
			add({ type: 'error', title, message, duration }),
		warning: (title: string, message?: string, duration?: number) =>
			add({ type: 'warning', title, message, duration }),
		info: (title: string, message?: string, duration?: number) =>
			add({ type: 'info', title, message, duration })
	};
}

export const notifications = createNotificationStore();