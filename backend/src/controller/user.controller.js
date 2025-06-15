import { db } from "../lib/db.js"; // Pastikan ini mengimpor `db` langsung dari drizzle instance
import { users, messages } from "../db/schema.js"; // Impor skema users dan messages
import { ne, and, or, asc, eq } from "drizzle-orm"; // Impor operator Drizzle yang diperlukan

export const getAllUsers = async (req, res, next) => {
	try {
		const currentUserId = req.auth.userId;
		// Menggunakan Drizzle ORM untuk query
		const allUsers = await db.query.users.findMany({
			where: ne(users.clerk_id, currentUserId), // Menggunakan operator 'not equal' dari Drizzle
		});
		// --- TAMBAHKAN LOG INI ---
		console.log(`[Backend] getAllUsers: User ID requesting: ${currentUserId}`);
		console.log("[Backend] Users returned (excluding self):", allUsers.map(u => u.fullName));
		// -------------------------
		res.status(200).json(allUsers);
	} catch (error) {
		console.error("Error in getAllUsers:", error); // Logging error untuk debugging
		next(error);
	}
};

export const getMessages = async (req, res, next) => {
	try {
		const myId = req.auth.userId;
		const { userId } = req.params;

		// Menggunakan Drizzle ORM untuk query pesan
		const userMessages = await db.query.messages.findMany({
			where: or( // Menggunakan operator 'or' dari Drizzle
				and(eq(messages.sender_id, userId), eq(messages.receiver_id, myId)), // Menggunakan operator 'and' dan 'equal'
				and(eq(messages.sender_id, myId), eq(messages.receiver_id, userId))
			),
			orderBy: asc(messages.createdAt), // Mengurutkan berdasarkan createdAt secara ascending
		});

		res.status(200).json(userMessages);
	} catch (error) {
		console.error("Error in getMessages:", error); // Logging error untuk debugging
		next(error);
	}
};