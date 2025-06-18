// eslint.config.js
import typescriptParser from '@typescript-eslint/parser';
import n8nNodesBase from 'eslint-plugin-n8n-nodes-base';

export default [
	// 기본 설정
	{
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				project: ['./tsconfig.json'],
				sourceType: 'module',
				extraFileExtensions: ['.json'],
			},
			globals: {
				browser: true,
				es6: true,
				node: true,
			},
		},
		ignores: ['.eslintrc.js', '**/*.js', '**/node_modules/**', '**/dist/**'],
	},

	// package.json 파일 설정
	{
		files: ['package.json'],
		plugins: {
			'n8n-nodes-base': n8nNodesBase,
		},
		rules: {
			...n8nNodesBase.configs.community.rules,
			'n8n-nodes-base/community-package-json-name-still-default': 'off',
		},
	},

	// credentials 파일 설정
	{
		files: ['./credentials/**/*.ts'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				project: ['./tsconfig.json'],
				sourceType: 'module',
			},
		},
		plugins: {
			'n8n-nodes-base': n8nNodesBase,
		},
		rules: {
			...n8nNodesBase.configs.credentials.rules,
			'n8n-nodes-base/cred-class-field-documentation-url-missing': 'off',
			'n8n-nodes-base/cred-class-field-documentation-url-miscased': 'off',
		},
	},

	// nodes 파일 설정
	{
		files: ['./nodes/**/*.ts'],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				project: ['./tsconfig.json'],
				sourceType: 'module',
			},
		},
		plugins: {
			'n8n-nodes-base': n8nNodesBase,
		},
		rules: {
			...n8nNodesBase.configs.nodes.rules,
			'n8n-nodes-base/node-execute-block-missing-continue-on-fail': 'off',
			'n8n-nodes-base/node-resource-description-filename-against-convention': 'off',
			'n8n-nodes-base/node-param-fixed-collection-type-unsorted-items': 'off',
		},
	},
];
