ALTER TABLE "product_variant" ADD COLUMN "size" text DEFAULT 'Única' NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variant" ADD COLUMN "stock" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "store" ADD COLUMN "banner1_url" text;--> statement-breakpoint
ALTER TABLE "store" ADD COLUMN "banner2_url" text;--> statement-breakpoint
ALTER TABLE "store" ADD COLUMN "instagram_url" text;--> statement-breakpoint
ALTER TABLE "store" ADD COLUMN "whatsapp" text;