ALTER TABLE "store" RENAME COLUMN "banner1_url" TO "banner1_desktop_url";--> statement-breakpoint
ALTER TABLE "store" RENAME COLUMN "banner2_url" TO "banner2_desktop_url";--> statement-breakpoint
ALTER TABLE "store" ADD COLUMN "banner1_mobile_url" text;--> statement-breakpoint
ALTER TABLE "store" ADD COLUMN "banner2_mobile_url" text;