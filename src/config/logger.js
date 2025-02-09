const logger = {
	info: (message, meta = {}) => {
		const logData = {
			level: "info",
			timestamp: new Date().toISOString(),
			message,
			...meta,
		};
		process.stdout.write(`${JSON.stringify(logData)}\n`);
	},
	error: (message, meta = {}) => {
		const logData = {
			level: "error",
			timestamp: new Date().toISOString(),
			message,
			...meta,
		};
		process.stderr.write(`${JSON.stringify(logData)}\n`);
	},
};

module.exports = logger;
