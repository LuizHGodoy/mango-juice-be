module.exports = {
	env: {
		node: true,
		es2021: true,
		jest: true,
	},
	extends: ["eslint:recommended", "prettier"],
	plugins: ["jest"],
	parserOptions: {
		ecmaVersion: "latest",
		sourceType: "module",
	},
	rules: {
		"no-console": "warn",
		"no-unused-vars": "warn",
	},
};
