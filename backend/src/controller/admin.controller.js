import { db } from "../lib/db.js";
import { songs, albums } from "../db/schema.js";
import { eq, inArray } from "drizzle-orm"; // Pastikan inArray diimpor jika diperlukan
import path from "path";
import fs from "fs/promises";
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.resolve();

const saveFileLocally = async (file, type) => {
	try {
		const extension = path.extname(file.name);
		const newFileName = `${uuidv4()}${extension}`;
		const folder = type === 'audio' ? 'audio' : 'images';
		const newPath = path.join(__dirname, 'public', folder, newFileName);

		await fs.rename(file.tempFilePath, newPath);

		return `/${folder}/${newFileName}`;

	} catch (error) {
		console.log("Error in saveFileLocally", error);
		throw new Error("Error saving file locally");
	}
}

const deleteLocalFile = async (filePath) => {
	try {
		const fullPath = path.join(__dirname, 'public', filePath);
		await fs.unlink(fullPath);
	} catch (error) {
		if (error.code !== 'ENOENT') {
			console.log("Error deleting local file", error);
		}
	}
}


export const createSong = async (req, res, next) => {
	try {
		if (!req.files || !req.files.audioFile || !req.files.imageFile) {
			return res.status(400).json({ message: "Please upload all files" });
		}

		const { title, artist, album_id, duration, lyrics } = req.body; // <-- Tambahkan 'lyrics' di sini
		const audioFile = req.files.audioFile;
		const imageFile = req.files.imageFile;

		const audioUrl = await saveFileLocally(audioFile, 'audio');
		const imageUrl = await saveFileLocally(imageFile, 'image');

		const newSong = {
			title,
			artist,
			audioUrl: `${process.env.BASE_URL}${audioUrl}`,
			imageUrl: `${process.env.BASE_URL}${imageUrl}`,
			duration: parseInt(duration, 10),
			album_id: album_id && album_id !== 'none' ? parseInt(album_id, 10) : null,
			lyrics: lyrics || null, // <-- Tambahkan ini, pastikan default ke null jika kosong
		};

		const [createdSong] = await db.insert(songs).values(newSong).returning();

		res.status(201).json(createdSong);
	} catch (error) {
		console.log("Error in createSong", error);
		next(error);
	}
};

export const deleteSong = async (req, res, next) => {
	try {
		const { id } = req.params;
		const songId = parseInt(id, 10);

		const song = await db.query.songs.findFirst({ where: eq(songs.id, songId) });

		if (song) {
			await deleteLocalFile(song.audioUrl.replace(process.env.BASE_URL, ''));
			await deleteLocalFile(song.imageUrl.replace(process.env.BASE_URL, ''));
		}

		await db.delete(songs).where(eq(songs.id, songId));

		res.status(200).json({ message: "Song deleted successfully" });
	} catch (error) {
		console.log("Error in deleteSong", error);
		next(error);
	}
};

export const createAlbum = async (req, res, next) => {
	try {
		const { title, artist, releaseYear } = req.body;

		if (!req.files || !req.files.imageFile) {
			return res.status(400).json({ message: "Please upload an image file" });
		}
		const { imageFile } = req.files;

		const imageUrl = await saveFileLocally(imageFile, 'image');

		const newAlbum = {
			title,
			artist,
			imageUrl: `${process.env.BASE_URL}${imageUrl}`,
			releaseYear: parseInt(releaseYear, 10),
		};

		const [createdAlbum] = await db.insert(albums).values(newAlbum).returning();

		res.status(201).json(createdAlbum);
	} catch (error) {
		console.log("Error in createAlbum", error);
		next(error);
	}
};

export const deleteAlbum = async (req, res, next) => {
	try {
		const { id } = req.params;
		const album_id = parseInt(id, 10);

		const albumToDelete = await db.query.albums.findFirst({
			where: eq(albums.id, album_id),
			with: {
				songs: true
			}
		});

		if (albumToDelete) {
			for (const song of albumToDelete.songs) {
				await deleteLocalFile(song.audioUrl.replace(process.env.BASE_URL, ''));
				await deleteLocalFile(song.imageUrl.replace(process.env.BASE_URL, ''));
			}
			await deleteLocalFile(albumToDelete.imageUrl.replace(process.env.BASE_URL, ''));
		}

		await db.delete(songs).where(eq(songs.album_id, album_id));
		await db.delete(albums).where(eq(albums.id, album_id));

		res.status(200).json({ message: "Album and associated songs deleted successfully" });
	} catch (error) {
		console.log("Error in deleteAlbum", error);
		next(error);
	}
};

export const checkAdmin = async (req, res, next) => {
	res.status(200).json({ admin: true });
};