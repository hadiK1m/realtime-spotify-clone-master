import { Server } from "socket.io";
// HAPUS: import { Message } from "../models/message.model.js";
// TAMBAH: Import Drizzle db instance dan skema messages
import { db } from "../lib/db.js";
import { messages } from "../db/schema.js";


export const initializeSocket = (server) => {
	const io = new Server(server, {
		cors: {
			origin: ["http://deepify.local:3000", "http://192.168.1.227:3000"],
			credentials: true,
		},
	});

	const userSockets = new Map(); // { userId: socketId}
	const userActivities = new Map(); // {userId: activity}

	io.on("connection", (socket) => {
		socket.on("user_connected", (userId) => {
			userSockets.set(userId, socket.id);
			userActivities.set(userId, "Idle");

			// --- TAMBAHKAN LOG INI ---
			console.log(`[Backend Socket] User <span class="math-inline">\{userId\} \(</span>{socket.id}) connected.`);
			console.log("[Backend Socket] Current online users (from userSockets):", Array.from(userSockets.keys()));
			// -------------------------

			io.emit("user_connected", userId);
			socket.emit("users_online", Array.from(userSockets.keys()));
			io.emit("activities", Array.from(userActivities.entries()));
		});

		socket.on("update_activity", ({ userId, activity }) => {
			console.log("activity updated", userId, activity);
			userActivities.set(userId, activity);
			io.emit("activity_updated", { userId, activity });
		});

		socket.on("send_message", async (data) => {
			try {
				const { sender_id, receiver_id, content } = data;

				// UBAH: Gunakan Drizzle untuk menyimpan pesan
				// const message = await Message.create({ sender_id, receiver_id, content });
				const [message] = await db.insert(messages).values({
					sender_id,
					receiver_id,
					content
				}).returning();


				const receiverSocketId = userSockets.get(receiver_id);
				if (receiverSocketId) {
					io.to(receiverSocketId).emit("receive_message", message);
				}

				socket.emit("message_sent", message);
			} catch (error) {
				console.error("Message error:", error);
				socket.emit("message_error", error.message);
			}
		});

		socket.on("disconnect", () => {
			let disconnectedUserId;
			for (const [userId, socketId] of userSockets.entries()) {
				if (socketId === socket.id) {
					disconnectedUserId = userId;
					userSockets.delete(userId);
					userActivities.delete(userId);
					break;
				}
			}
			if (disconnectedUserId) {
				console.log(`[Backend Socket] User <span class="math-inline">\{disconnectedUserId\} \(</span>{socket.id}) disconnected.`); // Log diskoneksi
				io.emit("user_disconnected", disconnectedUserId);
			}
		});
	});
};