const express = require("express");
const router = express.Router();
const RoomService = require("../services/RoomService");

/**
 * @swagger
 * /api/rooms:
 *   post:
 *     summary: Cria uma nova sala
 *     tags: [Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: Nome da sala
 *     responses:
 *       200:
 *         description: Sala criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 room_id:
 *                   type: string
 *                   description: ID único da sala
 */
router.post("/rooms", (req, res) => {
	const { name } = req.body;
	const room = RoomService.createRoom(name);
	res.json({ room_id: room.id });
});

module.exports = router;
