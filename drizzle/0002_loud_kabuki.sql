CREATE TABLE "store" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"logo_url" text,
	"color_primary" text DEFAULT '#8B5CF6' NOT NULL,
	"owner_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "store_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "category" DROP CONSTRAINT "category_slug_unique";--> statement-breakpoint
ALTER TABLE "product" DROP CONSTRAINT "product_slug_unique";--> statement-breakpoint
ALTER TABLE "product_variant" DROP CONSTRAINT "product_variant_slug_unique";--> statement-breakpoint
ALTER TABLE "cart" DROP CONSTRAINT "cart_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "cart" DROP CONSTRAINT "cart_shipping_address_id_shipping_address_id_fk";
--> statement-breakpoint
ALTER TABLE "order_item" DROP CONSTRAINT "order_item_product_variant_id_product_variant_id_fk";
--> statement-breakpoint
ALTER TABLE "order" DROP CONSTRAINT "order_user_id_user_id_fk";
--> statement-breakpoint
ALTER TABLE "order" DROP CONSTRAINT "order_shipping_address_id_shipping_address_id_fk";
--> statement-breakpoint
ALTER TABLE "product" DROP CONSTRAINT "product_category_id_category_id_fk";
--> statement-breakpoint
ALTER TABLE "cart_item" ALTER COLUMN "quantity" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "order" ALTER COLUMN "status" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "cart_item" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "cart" ADD COLUMN "store_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "cart" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "store_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "category" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "order_item" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "store_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "stripe_checkout_session_id" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "store_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "product" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variant" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "shipping_address" ADD COLUMN "full_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "shipping_address" ADD COLUMN "cpf" text NOT NULL;--> statement-breakpoint
ALTER TABLE "shipping_address" ADD COLUMN "zip_code" text NOT NULL;--> statement-breakpoint
ALTER TABLE "shipping_address" ADD COLUMN "address" text NOT NULL;--> statement-breakpoint
ALTER TABLE "store" ADD CONSTRAINT "store_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cart" ADD CONSTRAINT "cart_shipping_address_id_shipping_address_id_fk" FOREIGN KEY ("shipping_address_id") REFERENCES "public"."shipping_address"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_item" ADD CONSTRAINT "order_item_product_variant_id_product_variant_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variant"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_shipping_address_id_shipping_address_id_fk" FOREIGN KEY ("shipping_address_id") REFERENCES "public"."shipping_address"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_store_id_store_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."store"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product" ADD CONSTRAINT "product_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" DROP COLUMN "recipientName";--> statement-breakpoint
ALTER TABLE "order" DROP COLUMN "street";--> statement-breakpoint
ALTER TABLE "order" DROP COLUMN "number";--> statement-breakpoint
ALTER TABLE "order" DROP COLUMN "complement";--> statement-breakpoint
ALTER TABLE "order" DROP COLUMN "city";--> statement-breakpoint
ALTER TABLE "order" DROP COLUMN "state";--> statement-breakpoint
ALTER TABLE "order" DROP COLUMN "neighborhood";--> statement-breakpoint
ALTER TABLE "order" DROP COLUMN "zipCode";--> statement-breakpoint
ALTER TABLE "order" DROP COLUMN "country";--> statement-breakpoint
ALTER TABLE "order" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "order" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "order" DROP COLUMN "cpfOrCnpj";--> statement-breakpoint
ALTER TABLE "shipping_address" DROP COLUMN "recipientName";--> statement-breakpoint
ALTER TABLE "shipping_address" DROP COLUMN "street";--> statement-breakpoint
ALTER TABLE "shipping_address" DROP COLUMN "zipCode";--> statement-breakpoint
ALTER TABLE "shipping_address" DROP COLUMN "country";--> statement-breakpoint
ALTER TABLE "shipping_address" DROP COLUMN "cpfOrCnpj";--> statement-breakpoint
ALTER TABLE "shipping_address" DROP COLUMN "created_at";--> statement-breakpoint
DROP TYPE "public"."order_status";