const express = require("express");
const http = require("node:http");
const cors = require("cors");
const setupSocket = require("./config/socket");
const apiRoutes = require("./routes/api");
const logger = require("./config/logger");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();
const server = http.createServer(app);

app.use(
	cors({
		origin: process.env.FRONTEND_URL || "http://localhost:3000",
	}),
);
app.use(express.json());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api", apiRoutes);

setupSocket(server);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
	logger.info("Servidor iniciado", { port: PORT });
});
