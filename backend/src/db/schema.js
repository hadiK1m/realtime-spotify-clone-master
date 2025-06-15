import { pgTable, serial, text, varchar, timestamp, integer, foreignKey } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    clerk_id: varchar("clerk_id", { length: 256 }).notNull().unique(),
    fullName: text("full_name").notNull(),
    imageUrl: text("image_url").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    sender_id: varchar("sender_id", { length: 256 }).notNull(),
    receiver_id: varchar("receiver_id", { length: 256 }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const albums = pgTable("albums", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 256 }).notNull(),
    artist: varchar("artist", { length: 256 }).notNull(),
    imageUrl: text("image_url").notNull(),
    releaseYear: integer("release_year").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


export const songs = pgTable("songs", {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 256 }).notNull(),
    artist: varchar("artist", { length: 256 }).notNull(),
    imageUrl: text("image_url").notNull(),
    audioUrl: text("audio_url").notNull(),
    duration: integer("duration").notNull(),
    album_id: integer("album_id"),
    lyrics: text("lyrics"), // <-- TAMBAHKAN KOLOM INI
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
    return {
        albumFk: foreignKey({
            columns: [table.album_id],
            foreignColumns: [albums.id]
        }).onDelete('set null'),
    }
});


export const albumRelations = relations(albums, ({ many }) => ({
    songs: many(songs),
}));

export const songRelations = relations(songs, ({ one }) => ({
    album: one(albums, {
        fields: [songs.album_id],
        references: [albums.id],
    }),
}));