import { db } from "../lib/db.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const authCallback = async (req, res, next) => {
	try {
		const { id, firstName, lastName, imageUrl } = req.body;

		// Cek apakah user sudah ada menggunakan Drizzle
		const existingUser = await db.query.users.findFirst({
			where: eq(users.clerk_id, id),
		});

		if (!existingUser) {
			// Jika tidak ada, buat user baru
			await db.insert(users).values({
				clerk_id: id,
				fullName: `${firstName || ""} ${lastName || ""}`.trim(),
				imageUrl,
			});
		}

		res.status(200).json({ success: true });
	} catch (error) {
		console.log("Error in auth callback", error);
		next(error);
	}
};