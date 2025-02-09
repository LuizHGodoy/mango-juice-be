const swaggerJsdoc = require("swagger-jsdoc");

const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: "Planning Poker API",
			version: "1.0.0",
			description: "API REST e WebSocket para o Planning Poker",
		},
		servers: [
			{
				url: "http://localhost:8000",
				description: "Servidor de desenvolvimento",
			},
		],
	},
	apis: ["./src/routes/*.js", "./src/models/*.js"],
};

module.exports = swaggerJsdoc(options);
