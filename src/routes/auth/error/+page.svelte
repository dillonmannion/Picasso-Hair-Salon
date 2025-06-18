<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
</script>

<div class="container flex items-center justify-center min-h-screen py-12">
	<Card class="w-full max-w-md">
		<CardHeader class="space-y-1">
			<CardTitle class="text-2xl text-center text-destructive">Authentication Error</CardTitle>
			<CardDescription class="text-center">
				We encountered an issue during the sign-in process
			</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="bg-destructive/10 p-4 rounded-lg border border-destructive/20">
				<p class="text-sm text-center">
					Something went wrong while signing you in. This could be due to a cancelled sign-in, network issue, or temporary service interruption.
				</p>
			</div>

			<div class="space-y-2">
				<Button href="/auth/login" class="w-full">
					Try Again
				</Button>
				<Button href="/" variant="outline" class="w-full">
					Return Home
				</Button>
			</div>

			<div class="text-center">
				<p class="text-xs text-muted-foreground">
					If this problem persists, please contact our support team.
				</p>
			</div>
		</CardContent>
	</Card>
</div>