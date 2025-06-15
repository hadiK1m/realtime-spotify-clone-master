import { db } from "../lib/db.js"; // Pastikan ini mengimpor `db` langsung dari drizzle instance
import { songs } from "../db/schema.js"; // Impor skema songs
import { sql, desc } from "drizzle-orm"; // Impor operator dan helper `sql` dari Drizzle

export const getAllSongs = async (req, res, next) => {
	try {
		// Menggunakan Drizzle ORM untuk mengambil semua lagu, diurutkan berdasarkan createdAt secara descending
		const allSongs = await db.query.songs.findMany({
			orderBy: desc(songs.createdAt) // Mengurutkan descending
		});
		res.json(allSongs);
	} catch (error) {
		console.error("Error in getAllSongs:", error); // Logging error untuk debugging
		next(error);
	}
};

// Fungsi helper untuk mengambil lagu secara acak
const getRandomSongs = async (size, res, next) => {
	try {
		// Drizzle secara default akan mengembalikan semua kolom jika tidak ada 'columns' yang ditentukan.
		// Jadi, lirik akan otomatis disertakan.
		const result = await db.query.songs.findMany({
			orderBy: sql`RANDOM()`,
			limit: size, // Batasi jumlah hasil
		});
		res.json(result);
	} catch (error) {
		console.error(`Error in getRandomSongs (size: ${size}):`, error); // Logging error untuk debugging
		next(error);
	}
}

export const getFeaturedSongs = (req, res, next) => getRandomSongs(6, res, next);
export const getMadeForYouSongs = (req, res, next) => getRandomSongs(4, res, next); // <-- BARIS INI SUDAH DIPERBAIKI
export const getTrendingSongs = (req, res, next) => getRandomSongs(4, res, next);