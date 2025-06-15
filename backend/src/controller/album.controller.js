import { db } from "../lib/db.js";
import { albums } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const getAllAlbums = async (req, res, next) => {
	try {
		const allAlbums = await db.query.albums.findMany({
			with: {
				songs: {
					columns: {
						id: true
					}
				}
			}
		});
		res.status(200).json(allAlbums);
	} catch (error) {
		next(error);
	}
};

export const getAlbumById = async (req, res, next) => {
	try {
		const { album_id } = req.params;
		const id = parseInt(album_id, 10);

		const album = await db.query.albums.findFirst({
			where: eq(albums.id, id),
			with: {
				songs: true, // Ini akan "populate" lagu-lagu berkat relasi di schema.js
			},
		});

		if (!album) {
			return res.status(404).json({ message: "Album not found" });
		}

		res.status(200).json(album);
	} catch (error) {
		next(error);
	}
};