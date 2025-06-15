export interface Song {
	id: string; // ID dari MongoDB, atau ID dari Drizzle (misalnya, number jika serial)
	title: string;
	artist: string;
	album_id: number | null; // Sesuaikan dengan tipe Drizzle (integer)
	imageUrl: string;
	audioUrl: string;
	duration: number;
	lyrics?: string; // <-- PASTIKAN BARIS INI ADA
	createdAt: string;
	updatedAt: string;
}

export interface Album {
	id: string; // Atau 'id: number;' jika menggunakan Drizzle serial ID
	title: string;
	artist: string;
	imageUrl: string;
	releaseYear: number;
	songs: Song[]; // Pastikan ini mengacu pada interface Song yang sudah diperbarui
}

export interface Stats {
	totalSongs: number;
	totalAlbums: number;
	totalUsers: number;
	totalArtists: number;
}

export interface Message {
	id: string; // Atau 'id: number;'
	sender_id: string;
	receiver_id: string;
	content: string;
	createdAt: string;
	updatedAt: string;
}

export interface User {
	id: string; // Atau 'id: number;'
	clerk_id: string;
	fullName: string;
	imageUrl: string;
}