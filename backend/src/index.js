import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import fs from "fs/promises"; // Mengubah dari 'fs' biasa menjadi 'fs/promises'
import { createServer } from "http";
import cron from "node-cron";

import { clerkMiddleware } from "@clerk/express"; // <-- PASTI ADA
import fileUpload from "express-fileupload";     // <-- PASTI ADA

import { initializeSocket } from "./lib/socket.js";
import { db } from "./lib/db.js"; // Pastikan ini mengimpor `db` langsung

// Impor rute Anda
import userRoutes from "./routes/user.route.js";
import adminRoutes from "./routes/admin.route.js";
import authRoutes from "./routes/auth.route.js";
import songRoutes from "./routes/song.route.js";
import albumRoutes from "./routes/album.route.js";
import statRoutes from "./routes/stat.route.js";

dotenv.config();
console.log('Loaded BASE_URL:', process.env.BASE_URL); // Tambahkan baris ini untuk debugging
console.log('Loaded DATABASE_URL:', process.env.DATABASE_URL); // Tambahkan juga ini

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT || 5000;

const httpServer = createServer(app);
initializeSocket(httpServer);

app.use(
	cors({
		origin: ["http://deepify.local:3000", "http://192.168.1.227:3000"],
		credentials: true,
	})
);

app.use(express.json()); // Middleware untuk parsing JSON body
app.use(cookieParser()); // Middleware untuk parsing cookie

// Middleware untuk menangani upload file. HARUS ditempatkan DI SINI.
app.use(
	fileUpload({
		useTempFiles: true, // Gunakan file sementara
		tempFileDir: path.join(__dirname, "tmp"), // Direktori untuk file sementara
		createParentPath: true, // Buat direktori induk jika tidak ada
		limits: {
			fileSize: 50 * 1024 * 1024, // Batas ukuran file 50MB (sesuaikan jika perlu)
		},
	})
);

// Middleware Clerk. HARUS ditempatkan DI SINI, sebelum rute yang dilindungi.
app.use(clerkMiddleware()); // <-- Ini akan mengisi `req.auth`

// Sajikan file statis dari folder 'public'
// File media yang diunggah akan diakses melalui URL ini
app.use(express.static("public"));

// cron jobs untuk membersihkan folder tmp
const tempDir = path.join(process.cwd(), "tmp");
cron.schedule("0 * * * *", () => {
	// Menggunakan fs.existsSync yang tidak memerlukan async/await
	if (fs.existsSync(tempDir)) {
		// Menggunakan fs.readdir (callback-based) karena cron.schedule tidak async
		fs.readdir(tempDir, (err, files) => {
			if (err) {
				console.log("Error reading temp dir:", err);
				return;
			}
			for (const file of files) {
				// Menggunakan fs.unlink (callback-based)
				fs.unlink(path.join(tempDir, file), (err) => {
					if (err) console.log("Error deleting temp file:", err);
				});
			}
		});
	}
});

// Gunakan Rute API. Middleware protectRoute akan bekerja setelah clerkMiddleware().
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statRoutes);

// Penanganan serving frontend di mode produksi
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "../frontend/dist")));
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "../frontend", "dist", "index.html"));
	});
}

// Error handler (harus paling terakhir)
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ message: process.env.NODE_ENV === "production" ? "Internal server error" : err.message });
});

// Mulai server
httpServer.listen(PORT, async () => { // Menggunakan async karena ada await di dalam
	console.log(`Server is running on port ${PORT}`);

	// Membuat folder public/audio dan public/images jika belum ada
	const publicDir = path.join(__dirname, 'public');
	const audioDir = path.join(publicDir, 'audio');
	const imagesDir = path.join(publicDir, 'images');
	const albumsDir = path.join(publicDir, 'albums'); // Jika Anda menggunakannya
	const coverImagesDir = path.join(publicDir, 'cover-images'); // Jika Anda menggunakannya

	try {
		await fs.mkdir(audioDir, { recursive: true });
		await fs.mkdir(imagesDir, { recursive: true });
		await fs.mkdir(albumsDir, { recursive: true });
		await fs.mkdir(coverImagesDir, { recursive: true });
		console.log('Public media directories created or already exist.');
	} catch (err) {
		console.error('Failed to create public media directories:', err);
		process.exit(1); // Keluar jika gagal membuat direktori
	}

	console.log("Database connection pool initialized."); // Ini akan dieksekusi setelah folder dibuat
});

