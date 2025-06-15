import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import { albums, songs } from "./schema.js";

const seedData = [
    {
        album: {
            title: "Urban Nights",
            artist: "Various Artists",
            releaseYear: 2024,
            imageUrl: `${process.env.BASE_URL}/albums/1.jpg`,
        },
        songs: [
            {
                title: "City Rain",
                artist: "Urban Echo",
                imageUrl: `${process.env.BASE_URL}/cover-images/7.jpg`,
                audioUrl: `${process.env.BASE_URL}/songs/7.mp3`,
                duration: 39,
            },
            {
                title: "Neon Lights",
                artist: "Night Runners",
                imageUrl: `${process.env.BASE_URL}/cover-images/5.jpg`,
                audioUrl: `${process.env.BASE_URL}/songs/5.mp3`,
                duration: 36,
            },
            // Tambahkan lagu lain untuk album ini jika ada
        ],
    },
    {
        album: {
            title: "Coastal Dreaming",
            artist: "Various Artists",
            releaseYear: 2024,
            imageUrl: `${process.env.BASE_URL}/albums/2.jpg`,
        },
        songs: [
            {
                title: "Summer Daze",
                artist: "Coastal Kids",
                imageUrl: `${process.env.BASE_URL}/cover-images/4.jpg`,
                audioUrl: `${process.env.BASE_URL}/songs/4.mp3`,
                duration: 24,
            },
            {
                title: "Ocean Waves",
                artist: "Coastal Drift",
                imageUrl: `${process.env.BASE_URL}/cover-images/9.jpg`,
                audioUrl: `${process.env.BASE_URL}/songs/9.mp3`,
                duration: 28,
            },
        ],
    },
    // Anda bisa menambahkan lebih banyak data album dan lagu di sini
];

async function main() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });
    await client.connect();
    const db = drizzle(client);

    console.log("⏳ Seeding database...");
    const start = Date.now();

    // Hapus data lama untuk memastikan seeding yang bersih
    await db.delete(songs);
    await db.delete(albums);

    console.log(" emptied existing tables.");

    for (const item of seedData) {
        // Masukkan album dan dapatkan ID-nya
        const [createdAlbum] = await db
            .insert(albums)
            .values(item.album)
            .returning({ id: albums.id });

        console.log(`- Inserted album: ${item.album.title}`);

        // Siapkan data lagu dengan album_id yang benar
        const songsToInsert = item.songs.map((song) => ({
            ...song,
            album_id: createdAlbum.id,
        }));

        // Masukkan semua lagu untuk album tersebut
        if (songsToInsert.length > 0) {
            await db.insert(songs).values(songsToInsert);
            console.log(`  - Inserted ${songsToInsert.length} songs for this album.`);
        }
    }

    const end = Date.now();
    console.log("✅ Seeding completed in", end - start, "ms");

    await client.end();
}

main().catch((err) => {
    console.error("❌ Error during seeding:", err);
    process.exit(1);
});