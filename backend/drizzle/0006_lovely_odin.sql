ALTER TABLE "briefings" DROP CONSTRAINT "briefings_user_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "watchlist" DROP CONSTRAINT "watchlist_user_id_users_user_id_fk";
--> statement-breakpoint
ALTER TABLE "briefings" ADD CONSTRAINT "briefings_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_user_id_users_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE cascade ON UPDATE no action;