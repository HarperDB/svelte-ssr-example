import config from '@harperdb/code-guidelines/prettier';

export default {
	...config,
	plugins: ['prettier-plugin-svelte'],
	overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }],
};
