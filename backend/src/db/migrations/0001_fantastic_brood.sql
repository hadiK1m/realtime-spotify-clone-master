ALTER TABLE "messages" RENAME COLUMN "sender_id" TO "sender_id";--> statement-breakpoint
ALTER TABLE "messages" RENAME COLUMN "receiver_id" TO "receiver_id";--> statement-breakpoint
ALTER TABLE "songs" RENAME COLUMN "album_id" TO "album_id";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "clerk_id" TO "clerk_id";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_clerk_id_unique";--> statement-breakpoint
ALTER TABLE "songs" DROP CONSTRAINT "songs_album_id_albumsid_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "songs" ADD CONSTRAINT "songs_album_id_albumsid_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id");