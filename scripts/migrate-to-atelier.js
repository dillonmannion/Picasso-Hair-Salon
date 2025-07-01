#!/usr/bin/env node

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Component mapping
const componentMap = {
	// UI Components
	Button: 'AtelierButton',
	Card: 'AtelierCard',
	CardHeader: 'AtelierCard',
	CardContent: 'AtelierCard',
	CardFooter: 'AtelierCard',
	Badge: 'AtelierBadge',
	Modal: 'AtelierModal',
	Tooltip: 'AtelierTooltip',

	// Form Components
	Input: 'AtelierInput',
	Select: 'AtelierSelect',
	Textarea: 'AtelierTextarea',

	// Layout Components
	Header: 'AtelierHeader',
	Sidebar: 'AtelierSidebar',
	Tabs: 'AtelierTabs',
	TabsList: 'AtelierTabs',
	TabsTrigger: 'AtelierTabs',
	TabsContent: 'AtelierTabs',
	Accordion: 'AtelierAccordion',
	AccordionItem: 'AtelierAccordion',
	AccordionTrigger: 'AtelierAccordion',
	AccordionContent: 'AtelierAccordion'
};

// Import path mapping
const importPathMap = {
	'$lib/components/ui/button': '$lib/components/atelier/AtelierButton.svelte',
	'$lib/components/ui/card': '$lib/components/atelier/AtelierCard.svelte',
	'$lib/components/ui/badge': '$lib/components/atelier/AtelierBadge.svelte',
	'$lib/components/ui/modal': '$lib/components/atelier/AtelierModal.svelte',
	'$lib/components/ui/tooltip': '$lib/components/atelier/AtelierTooltip.svelte',
	'$lib/components/ui/input': '$lib/components/atelier/forms/AtelierInput.svelte',
	'$lib/components/ui/select': '$lib/components/atelier/forms/AtelierSelect.svelte',
	'$lib/components/ui/textarea': '$lib/components/atelier/forms/AtelierTextarea.svelte',
	'$lib/components/ui/tabs': '$lib/components/atelier/interactive/AtelierTabs.svelte',
	'$lib/components/ui/accordion': '$lib/components/atelier/interactive/AtelierAccordion.svelte'
};

// Event handler mapping
const eventHandlerMap = {
	'on:click': 'onclick',
	'on:input': 'oninput',
	'on:change': 'onchange',
	'on:focus': 'onfocus',
	'on:blur': 'onblur',
	'on:keydown': 'onkeydown',
	'on:keyup': 'onkeyup',
	'on:submit': 'onsubmit'
};

async function getAllFiles(dir, ext = '.svelte') {
	const files = [];
	const items = await readdir(dir, { withFileTypes: true });

	for (const item of items) {
		const path = join(dir, item.name);
		if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
			files.push(...(await getAllFiles(path, ext)));
		} else if (item.isFile() && extname(item.name) === ext) {
			files.push(path);
		}
	}

	return files;
}

function updateImports(content) {
	let updated = content;

	// Update import statements
	for (const [oldPath, newPath] of Object.entries(importPathMap)) {
		const importRegex = new RegExp(`from\\s+['"]${oldPath}(?:/[^'"]*)?['"]`, 'g');
		updated = updated.replace(importRegex, `from '${newPath}'`);
	}

	// Update component imports in the import statement
	for (const [oldName, newName] of Object.entries(componentMap)) {
		const namedImportRegex = new RegExp(`\\b${oldName}\\b(?=.*from)`, 'g');
		updated = updated.replace(namedImportRegex, newName);
	}

	return updated;
}

function updateComponentUsage(content) {
	let updated = content;

	// Update component tags
	for (const [oldName, newName] of Object.entries(componentMap)) {
		// Opening tags
		const openTagRegex = new RegExp(`<${oldName}(?=\\s|>|/)`, 'g');
		updated = updated.replace(openTagRegex, `<${newName}`);

		// Closing tags
		const closeTagRegex = new RegExp(`</${oldName}>`, 'g');
		updated = updated.replace(closeTagRegex, `</${newName}>`);
	}

	return updated;
}

function updateEventHandlers(content) {
	let updated = content;

	// Update event handlers
	for (const [oldHandler, newHandler] of Object.entries(eventHandlerMap)) {
		const handlerRegex = new RegExp(`\\b${oldHandler}=`, 'g');
		updated = updated.replace(handlerRegex, `${newHandler}=`);
	}

	return updated;
}

function updateCardStructure(content) {
	// Convert Card structure to new format
	let updated = content;

	// Replace CardHeader with slot
	updated = updated.replace(
		/<CardHeader>\s*<CardTitle>(.*?)<\/CardTitle>\s*<\/CardHeader>/gs,
		'<h3 slot="header">$1</h3>'
	);

	// Remove CardContent wrapper
	updated = updated.replace(/<CardContent>(.*?)<\/CardContent>/gs, '$1');

	// Handle CardFooter
	updated = updated.replace(/<CardFooter>(.*?)<\/CardFooter>/gs, '<div slot="footer">$1</div>');

	return updated;
}

async function processFile(filePath) {
	try {
		const content = await readFile(filePath, 'utf-8');
		let updated = content;

		// Skip if already using Atelier components
		if (content.includes('Atelier')) {
			console.log(`⏭️  Skipping ${filePath} (already migrated)`);
			return;
		}

		// Apply transformations
		updated = updateImports(updated);
		updated = updateComponentUsage(updated);
		updated = updateEventHandlers(updated);
		updated = updateCardStructure(updated);

		// Only write if changes were made
		if (updated !== content) {
			await writeFile(filePath, updated, 'utf-8');
			console.log(`✅ Migrated ${filePath}`);
			return true;
		}

		return false;
	} catch (error) {
		console.error(`❌ Error processing ${filePath}:`, error.message);
		return false;
	}
}

async function addThemeProvider() {
	const layoutPath = join(projectRoot, 'src/routes/+layout.svelte');

	try {
		let content = await readFile(layoutPath, 'utf-8');

		// Check if already added
		if (content.includes('AtelierThemeProvider')) {
			console.log('⏭️  Theme provider already added');
			return;
		}

		// Add imports
		const importStatement = `import AtelierThemeProvider from '$lib/components/atelier/AtelierThemeProvider.svelte';
import AtelierPageTransition from '$lib/components/atelier/utils/AtelierPageTransition.svelte';
import AtelierNotification from '$lib/components/atelier/feedback/AtelierNotification.svelte';`;

		// Add to script section
		if (content.includes('<script>')) {
			content = content.replace('<script>', `<script>\n${importStatement}`);
		} else {
			content = `<script>\n${importStatement}\n</script>\n${content}`;
		}

		// Wrap slot with theme provider
		content = content.replace(
			'<slot />',
			`<AtelierThemeProvider>
  <AtelierPageTransition />
  <AtelierNotification />
  <slot />
</AtelierThemeProvider>`
		);

		await writeFile(layoutPath, content, 'utf-8');
		console.log('✅ Added theme provider to layout');
	} catch (error) {
		console.error('❌ Error adding theme provider:', error.message);
	}
}

async function addAtelierStyles() {
	const appCssPath = join(projectRoot, 'src/app.css');

	try {
		let content = await readFile(appCssPath, 'utf-8');

		// Check if already added
		if (content.includes('atelier.css')) {
			console.log('⏭️  Atelier styles already imported');
			return;
		}

		// Add import at the beginning
		content = `@import '$lib/styles/atelier.css';\n\n${content}`;

		await writeFile(appCssPath, content, 'utf-8');
		console.log('✅ Added Atelier styles import');
	} catch (error) {
		console.error('❌ Error adding styles:', error.message);
	}
}

async function createMigrationSummary(filesUpdated) {
	const summary = `# Atelier Migration Summary

Date: ${new Date().toISOString()}
Files Updated: ${filesUpdated}

## Next Steps:

1. Review the changes in your version control
2. Test the migrated components
3. Update any custom styling
4. Run tests to ensure functionality

## Manual Tasks:

- Update form validation to use new validation utilities
- Review and update any custom event handlers
- Test dark mode functionality
- Update any component-specific props

## Resources:

- Migration Guide: /docs/atelier-migration-guide.md
- Demo Page: /atelier-demo
- Component Documentation: /src/lib/components/atelier/

Happy coding with Atelier! ✨
`;

	await writeFile(join(projectRoot, 'MIGRATION_SUMMARY.md'), summary, 'utf-8');
	console.log('\n📄 Migration summary saved to MIGRATION_SUMMARY.md');
}

// Main migration function
async function migrate() {
	console.log('🚀 Starting Atelier Design System Migration...\n');

	// Add theme provider to layout
	await addThemeProvider();

	// Add Atelier styles
	await addAtelierStyles();

	// Process all Svelte files
	const srcDir = join(projectRoot, 'src');
	const files = await getAllFiles(srcDir);

	console.log(`\n📁 Found ${files.length} Svelte files to process\n`);

	let filesUpdated = 0;

	for (const file of files) {
		const updated = await processFile(file);
		if (updated) filesUpdated++;
	}

	console.log(`\n✨ Migration complete! ${filesUpdated} files updated.`);

	// Create summary
	await createMigrationSummary(filesUpdated);
}

// Run migration
migrate().catch(console.error);
