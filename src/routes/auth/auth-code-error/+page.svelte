<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { AlertCircle } from 'lucide-svelte';
</script>

<div class="container flex min-h-screen items-center justify-center py-12">
	<Card class="w-full max-w-md">
		<CardHeader class="space-y-1 text-center">
			<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
				<AlertCircle class="h-6 w-6 text-red-600" />
			</div>
			<CardTitle class="text-2xl">Authentication Error</CardTitle>
			<CardDescription>
				There was a problem completing your sign-in. This could happen for several reasons:
			</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="text-muted-foreground space-y-2 text-sm">
				<p>• The authentication code was invalid or expired</p>
				<p>• You may have already used this sign-in link</p>
				<p>• There was a network issue during sign-in</p>
			</div>

			<div class="space-y-3 pt-4">
				<Button class="w-full" onclick={() => (window.location.href = '/auth/login')}>
					Try Again
				</Button>
				<Button class="w-full" variant="outline" onclick={() => (window.location.href = '/')}>
					Go Home
				</Button>
			</div>

			<div class="pt-4 text-center">
				<p class="text-muted-foreground text-sm">
					If you continue to experience issues, please contact support.
				</p>
			</div>
		</CardContent>
	</Card>
</div>
