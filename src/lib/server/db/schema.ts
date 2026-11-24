import { sql } from 'drizzle-orm';
import {
	boolean,
	date,
	index,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	smallint,
	text,
	timestamp,
	uniqueIndex,
	uuid
} from 'drizzle-orm/pg-core';

const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();

/** Structured settings: one row per group (company, hero, seo, about, trust, theme). */
export const siteSettings = pgTable('site_settings', {
	key: text().primaryKey(),
	value: jsonb().notNull(),
	updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow()
});

export const services = pgTable(
	'services',
	{
		id: uuid().primaryKey().defaultRandom(),
		title: text().notNull(),
		slug: text().notNull(),
		shortDescription: text().notNull(),
		fullDescription: text().notNull().default(''),
		iconName: text().notNull().default('bolt'),
		coverImageUrl: text(),
		coverImageKey: text(),
		sortOrder: integer().notNull().default(0),
		isActive: boolean().notNull().default(true),
		createdAt: createdAt()
	},
	(t) => [uniqueIndex('services_slug_idx').on(t.slug), index('services_sort_idx').on(t.sortOrder)]
);

export const projects = pgTable(
	'projects',
	{
		id: uuid().primaryKey().defaultRandom(),
		title: text().notNull(),
		slug: text().notNull(),
		category: text().notNull(),
		location: text(),
		clientType: text(),
		summary: text().notNull().default(''),
		description: text().notNull().default(''),
		completionDate: date(),
		featured: boolean().notNull().default(false),
		sortOrder: integer().notNull().default(0),
		createdAt: createdAt()
	},
	(t) => [uniqueIndex('projects_slug_idx').on(t.slug), index('projects_sort_idx').on(t.sortOrder)]
);

export const projectImages = pgTable(
	'project_images',
	{
		id: uuid().primaryKey().defaultRandom(),
		projectId: uuid()
			.notNull()
			.references(() => projects.id, { onDelete: 'cascade' }),
		imageUrl: text().notNull(),
		storageKey: text().notNull(),
		thumbUrl: text(),
		thumbKey: text(),
		width: integer(),
		height: integer(),
		caption: text().notNull().default(''),
		isCover: boolean().notNull().default(false),
		sortOrder: integer().notNull().default(0)
	},
	(t) => [index('project_images_project_idx').on(t.projectId, t.sortOrder)]
);

export const testimonials = pgTable('testimonials', {
	id: uuid().primaryKey().defaultRandom(),
	clientName: text().notNull(),
	companyOrCity: text(),
	rating: smallint().notNull().default(5),
	quote: text().notNull(),
	projectId: uuid().references(() => projects.id, { onDelete: 'set null' }),
	isPublished: boolean().notNull().default(false),
	createdAt: createdAt()
});

export const inquiryStatus = pgEnum('inquiry_status', ['new', 'contacted', 'quoted', 'archived']);

export const inquiries = pgTable(
	'inquiries',
	{
		id: uuid().primaryKey().defaultRandom(),
		fullName: text().notNull(),
		email: text().notNull(),
		phone: text(),
		city: text(),
		serviceType: text(),
		message: text().notNull(),
		attachmentUrl: text(),
		attachmentKey: text(),
		attachmentName: text(),
		status: inquiryStatus().notNull().default('new'),
		createdAt: createdAt()
	},
	(t) => [index('inquiries_status_idx').on(t.status, t.createdAt)]
);

export const adminUsers = pgTable(
	'admin_users',
	{
		id: uuid().primaryKey().defaultRandom(),
		email: text().notNull(),
		passwordHash: text().notNull(),
		name: text().notNull(),
		createdAt: createdAt()
	},
	(t) => [uniqueIndex('admin_users_email_idx').on(sql`lower(${t.email})`)]
);

/** Sessions: the cookie holds a random token; only its HMAC is stored. */
export const adminSessions = pgTable(
	'admin_sessions',
	{
		id: text().primaryKey(),
		userId: uuid()
			.notNull()
			.references(() => adminUsers.id, { onDelete: 'cascade' }),
		expiresAt: timestamp({ withTimezone: true }).notNull(),
		createdAt: createdAt()
	},
	(t) => [index('admin_sessions_user_idx').on(t.userId)]
);

/** Sliding-window rate limiting (login attempts, quote form) keyed by a hashed IP. */
export const rateLimitEvents = pgTable(
	'rate_limit_events',
	{
		id: uuid().primaryKey().defaultRandom(),
		bucket: text().notNull(),
		key: text().notNull(),
		createdAt: createdAt()
	},
	(t) => [index('rate_limit_lookup_idx').on(t.bucket, t.key, t.createdAt)]
);

export type Service = typeof services.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type ProjectImage = typeof projectImages.$inferSelect;
export type Testimonial = typeof testimonials.$inferSelect;
export type Inquiry = typeof inquiries.$inferSelect;
export type AdminUser = typeof adminUsers.$inferSelect;
