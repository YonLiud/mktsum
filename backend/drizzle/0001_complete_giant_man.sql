CREATE TABLE "tickers" (
	"symbol" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text
);
--> statement-breakpoint
ALTER TABLE "watchlist" ADD CONSTRAINT "watchlist_ticker_tickers_symbol_fk" FOREIGN KEY ("ticker") REFERENCES "public"."tickers"("symbol") ON DELETE no action ON UPDATE no action;