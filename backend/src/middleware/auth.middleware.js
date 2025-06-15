import { clerkClient } from "@clerk/express";

export const protectRoute = async (req, res, next) => {
	// PERBAIKAN: Panggil req.auth() untuk mendapatkan objek autentikasi
	if (!req.auth()?.userId) { // Menggunakan optional chaining (?) untuk keamanan
		return res.status(401).json({ message: "Unauthorized - you must be logged in" });
	}
	next();
};

export const requireAdmin = async (req, res, next) => {
	try {
		// PERBAIKAN: Panggil req.auth() untuk mendapatkan objek autentikasi
		const currentUser = await clerkClient.users.getUser(req.auth()?.userId); // Menggunakan optional chaining
		const isAdmin = process.env.ADMIN_EMAIL === currentUser.primaryEmailAddress?.emailAddress;

		if (!isAdmin) {
			return res.status(403).json({ message: "Unauthorized - you must be an admin" });
		}

		next();
	} catch (error) {
		console.error("Error in requireAdmin:", error); // Tambahkan logging di sini
		next(error);
	}
};