ALTER TABLE "songs" DROP CONSTRAINT "songs_album_id_albumsid_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "songs" ADD CONSTRAINT "songs_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
