CREATE TABLE "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "stripe_checkout_session_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "pix_qr_code" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "pix_qr_code_base64" text;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "pix_payment_id" text;--> statement-breakpoint
ALTER TABLE "store" ADD COLUMN "fixed_shipping_fee_in_cents" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "store" ADD COLUMN "free_shipping_threshold_in_cents" integer;--> statement-breakpoint
ALTER TABLE "store" ADD COLUMN "pix_discount_percent" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "store" ADD COLUMN "enable_online_payments" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "store" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "store" ADD COLUMN "stripe_public_key" text;--> statement-breakpoint
ALTER TABLE "store" ADD COLUMN "stripe_secret_key" text;--> statement-breakpoint
ALTER TABLE "store" ADD COLUMN "stripe_webhook_secret" text;--> statement-breakpoint
ALTER TABLE "store" ADD COLUMN "mp_access_token" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'customer' NOT NULL;--> statement-breakpoint
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;