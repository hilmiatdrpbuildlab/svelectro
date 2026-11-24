CREATE TYPE "public"."inquiry_status" AS ENUM('new', 'contacted', 'quoted', 'archived');--> statement-breakpoint
CREATE TABLE "admin_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "inquiries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"city" text,
	"service_type" text,
	"message" text NOT NULL,
	"attachment_url" text,
	"attachment_key" text,
	"attachment_name" text,
	"status" "inquiry_status" DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"image_url" text NOT NULL,
	"storage_key" text NOT NULL,
	"thumb_url" text,
	"thumb_key" text,
	"width" integer,
	"height" integer,
	"caption" text DEFAULT '' NOT NULL,
	"is_cover" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"category" text NOT NULL,
	"location" text,
	"client_type" text,
	"summary" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"completion_date" date,
	"featured" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rate_limit_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"bucket" text NOT NULL,
	"key" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"short_description" text NOT NULL,
	"full_description" text DEFAULT '' NOT NULL,
	"icon_name" text DEFAULT 'bolt' NOT NULL,
	"cover_image_url" text,
	"cover_image_key" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_name" text NOT NULL,
	"company_or_city" text,
	"rating" smallint DEFAULT 5 NOT NULL,
	"quote" text NOT NULL,
	"project_id" uuid,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "admin_sessions" ADD CONSTRAINT "admin_sessions_user_id_admin_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."admin_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_images" ADD CONSTRAINT "project_images_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_sessions_user_idx" ON "admin_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "admin_users_email_idx" ON "admin_users" USING btree (lower("email"));--> statement-breakpoint
CREATE INDEX "inquiries_status_idx" ON "inquiries" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "project_images_project_idx" ON "project_images" USING btree ("project_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "projects_slug_idx" ON "projects" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "projects_sort_idx" ON "projects" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "rate_limit_lookup_idx" ON "rate_limit_events" USING btree ("bucket","key","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "services_sort_idx" ON "services" USING btree ("sort_order");