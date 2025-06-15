import { db } from "../lib/db.js"; // Pastikan ini mengimpor `db` langsung dari drizzle instance
import { albums, songs, users } from "../db/schema.js"; // Impor semua skema yang dibutuhkan
import { sql, count } from "drizzle-orm"; // Impor helper `sql` dan `count` dari Drizzle

export const getStats = async (req, res, next) => {
	try {
		// Menjalankan beberapa query secara paralel menggunakan Promise.all
		const totalSongsPromise = db.select({ value: count() }).from(songs);
		const totalAlbumsPromise = db.select({ value: count() }).from(albums);
		const totalUsersPromise = db.select({ value: count() }).from(users);

		// Query untuk menghitung total artis unik dari kedua tabel (songs dan albums)
		const totalArtistsPromise = db.execute(sql`
            SELECT COUNT(*) FROM (
                SELECT artist FROM ${songs}
                UNION
                SELECT artist FROM ${albums}
            ) as unique_artists
        `);

		const [
			songStats,
			albumStats,
			userStats,
			totalArtistsResult
		] = await Promise.all([
			totalSongsPromise,
			totalAlbumsPromise,
			totalUsersPromise,
			totalArtistsPromise,
		]);

		// Mengambil nilai dari hasil query
		const totalSongs = songStats[0].value;
		const totalAlbums = albumStats[0].value;
		const totalUsers = userStats[0].value;
		// Hasil dari `db.execute()` mengembalikan array of objects, akses properti `count`
		const totalArtists = parseInt(totalArtistsResult.rows[0].count, 10) || 0;

		res.status(200).json({
			totalAlbums,
			totalSongs,
			totalUsers,
			totalArtists,
		});

	} catch (error) {
		console.error("Error in getStats:", error); // Logging error untuk debugging
		next(error);
	}
};