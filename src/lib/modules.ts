import type { Model } from '@stack-init/schema';

export interface LibraryModule {
  id: string;
  name: string;
  icon: string;
  description: string;
  models: Model[];
}

const DEFAULT_GENERATE = {
  migration: true, controller: true, resource: true, request: true,
  seeder: false, factory: true, policy: false, service: false,
  tests: true, routes: true, swagger: false, softDelete: false, repository: false,
};

const M = { primary_key: 'id' as const, timestamps: true, softDeletes: false };

export const MODULE_LIBRARY: LibraryModule[] = [
  /* ── Auth ───────────────────────────────────────────────────────── */
  {
    id: 'auth',
    name: 'Auth',
    icon: '🔐',
    description: 'Full authentication — users, sessions, password resets.',
    models: [
      {
        name: 'User',
        table: 'users',
        fields: [
          { name: 'name',               type: 'string',        nullable: false },
          { name: 'email',              type: 'string',        nullable: false, unique: true },
          { name: 'password',           type: 'string',        nullable: false },
          { name: 'email_verified_at',  type: 'timestamp',     nullable: true },
          { name: 'avatar',             type: 'string',        nullable: true },
          { name: 'role',               type: 'enum', values: ['admin', 'user', 'moderator'], nullable: false },
          { name: 'remember_token',     type: 'rememberToken', nullable: true },
        ],
        relations: [
          { type: 'hasMany', model: 'PasswordReset' },
          { type: 'hasMany', model: 'Session' },
        ],
        generate: { ...DEFAULT_GENERATE },
        migration: { ...M },
      },
      {
        name: 'Session',
        table: 'sessions',
        fields: [
          { name: 'user_id',     type: 'foreignId', nullable: false, references: 'users' },
          { name: 'token',       type: 'string',    nullable: false, unique: true },
          { name: 'ip_address',  type: 'string',    nullable: true },
          { name: 'user_agent',  type: 'string',    nullable: true },
          { name: 'expires_at',  type: 'timestamp', nullable: false },
          { name: 'last_used_at',type: 'timestamp', nullable: true },
        ],
        relations: [
          { type: 'belongsTo', model: 'User' },
        ],
        generate: { ...DEFAULT_GENERATE, controller: false, routes: false },
        migration: { ...M },
      },
      {
        name: 'PasswordReset',
        table: 'password_reset_tokens',
        fields: [
          { name: 'email',      type: 'string',    nullable: false },
          { name: 'user_id',    type: 'foreignId', nullable: true, references: 'users' },
          { name: 'token',      type: 'string',    nullable: false },
          { name: 'expires_at', type: 'timestamp', nullable: false },
        ],
        relations: [
          { type: 'belongsTo', model: 'User' },
        ],
        generate: { ...DEFAULT_GENERATE, controller: false, routes: false },
        migration: { primary_key: 'id', timestamps: false, softDeletes: false },
      },
    ],
  },

  /* ── Blog ───────────────────────────────────────────────────────── */
  {
    id: 'blog',
    name: 'Blog',
    icon: '✍️',
    description: 'Full blog engine — posts, categories, tags and comments.',
    models: [
      {
        name: 'Post',
        table: 'posts',
        fields: [
          { name: 'title',        type: 'string',    nullable: false },
          { name: 'slug',         type: 'string',    nullable: false, unique: true },
          { name: 'content',      type: 'text',      nullable: false },
          { name: 'excerpt',      type: 'text',      nullable: true },
          { name: 'status',       type: 'enum', values: ['draft', 'published', 'archived'], nullable: false },
          { name: 'published_at', type: 'timestamp', nullable: true },
          { name: 'image_url',    type: 'string',    nullable: true },
          { name: 'category_id',  type: 'foreignId', nullable: true, references: 'categories' },
        ],
        relations: [
          { type: 'belongsTo',    model: 'Category' },
          { type: 'hasMany',      model: 'Comment' },
          { type: 'belongsToMany', model: 'Tag' },
        ],
        generate: { ...DEFAULT_GENERATE },
        migration: { ...M },
      },
      {
        name: 'Category',
        table: 'categories',
        fields: [
          { name: 'name',        type: 'string', nullable: false },
          { name: 'slug',        type: 'string', nullable: false, unique: true },
          { name: 'description', type: 'text',   nullable: true },
          { name: 'parent_id',   type: 'foreignId', nullable: true, references: 'categories' },
        ],
        relations: [
          { type: 'hasMany', model: 'Post' },
        ],
        generate: { ...DEFAULT_GENERATE },
        migration: { ...M },
      },
      {
        name: 'Tag',
        table: 'tags',
        fields: [
          { name: 'name', type: 'string', nullable: false },
          { name: 'slug', type: 'string', nullable: false, unique: true },
          { name: 'color', type: 'string', nullable: true },
        ],
        relations: [
          { type: 'belongsToMany', model: 'Post' },
        ],
        generate: { ...DEFAULT_GENERATE },
        migration: { ...M },
      },
      {
        name: 'Comment',
        table: 'comments',
        fields: [
          { name: 'post_id',     type: 'foreignId', nullable: false, references: 'posts' },
          { name: 'author_name', type: 'string',    nullable: false },
          { name: 'content',     type: 'text',      nullable: false },
          { name: 'is_approved', type: 'boolean',   nullable: false },
          { name: 'parent_id',   type: 'foreignId', nullable: true, references: 'comments' },
        ],
        relations: [
          { type: 'belongsTo', model: 'Post' },
        ],
        generate: { ...DEFAULT_GENERATE },
        migration: { ...M },
      },
    ],
  },

  /* ── E-commerce ─────────────────────────────────────────────────── */
  {
    id: 'ecommerce',
    name: 'E-commerce',
    icon: '🛒',
    description: 'Store-ready — products, categories, orders, order items.',
    models: [
      {
        name: 'Product',
        table: 'products',
        fields: [
          { name: 'name',        type: 'string',  nullable: false },
          { name: 'slug',        type: 'string',  nullable: false, unique: true },
          { name: 'sku',         type: 'string',  nullable: false, unique: true },
          { name: 'price',       type: 'decimal', nullable: false },
          { name: 'compare_at_price', type: 'decimal', nullable: true },
          { name: 'stock',       type: 'integer', nullable: false },
          { name: 'description', type: 'text',    nullable: true },
          { name: 'image_url',   type: 'string',  nullable: true },
          { name: 'is_active',   type: 'boolean', nullable: false },
        ],
        relations: [
          { type: 'belongsToMany', model: 'Category' },
          { type: 'hasMany',       model: 'OrderItem' },
        ],
        generate: { ...DEFAULT_GENERATE },
        migration: { ...M },
      },
      {
        name: 'Category',
        table: 'categories',
        fields: [
          { name: 'name',      type: 'string',    nullable: false },
          { name: 'slug',      type: 'string',    nullable: false, unique: true },
          { name: 'parent_id', type: 'foreignId', nullable: true, references: 'categories' },
          { name: 'image_url', type: 'string',    nullable: true },
        ],
        relations: [
          { type: 'belongsToMany', model: 'Product' },
        ],
        generate: { ...DEFAULT_GENERATE },
        migration: { ...M },
      },
      {
        name: 'Order',
        table: 'orders',
        fields: [
          { name: 'order_number',  type: 'string',    nullable: false, unique: true },
          { name: 'status',        type: 'enum', values: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'], nullable: false },
          { name: 'total_amount',  type: 'decimal',   nullable: false },
          { name: 'currency',      type: 'string',    nullable: false },
          { name: 'shipping_address', type: 'json',   nullable: true },
          { name: 'notes',         type: 'text',      nullable: true },
        ],
        relations: [
          { type: 'hasMany', model: 'OrderItem' },
        ],
        generate: { ...DEFAULT_GENERATE },
        migration: { ...M },
      },
      {
        name: 'OrderItem',
        table: 'order_items',
        fields: [
          { name: 'order_id',   type: 'foreignId', nullable: false, references: 'orders' },
          { name: 'product_id', type: 'foreignId', nullable: false, references: 'products' },
          { name: 'quantity',   type: 'integer',   nullable: false },
          { name: 'unit_price', type: 'decimal',   nullable: false },
          { name: 'subtotal',   type: 'decimal',   nullable: false },
        ],
        relations: [
          { type: 'belongsTo', model: 'Order' },
          { type: 'belongsTo', model: 'Product' },
        ],
        generate: { ...DEFAULT_GENERATE },
        migration: { ...M },
      },
    ],
  },

  /* ── SaaS ───────────────────────────────────────────────────────── */
  {
    id: 'saas',
    name: 'SaaS',
    icon: '🚀',
    description: 'Multi-tenant SaaS — teams, members, subscriptions, invoices.',
    models: [
      {
        name: 'Team',
        table: 'teams',
        fields: [
          { name: 'name',            type: 'string',  nullable: false },
          { name: 'slug',            type: 'string',  nullable: false, unique: true },
          { name: 'logo_url',        type: 'string',  nullable: true },
          { name: 'plan',            type: 'string',  nullable: false },
          { name: 'trial_ends_at',   type: 'timestamp', nullable: true },
        ],
        relations: [
          { type: 'hasMany', model: 'TeamMember' },
          { type: 'hasOne',  model: 'Subscription' },
          { type: 'hasMany', model: 'Invoice' },
        ],
        generate: { ...DEFAULT_GENERATE },
        migration: { ...M },
      },
      {
        name: 'TeamMember',
        table: 'team_members',
        fields: [
          { name: 'team_id',   type: 'foreignId', nullable: false, references: 'teams' },
          { name: 'user_id',   type: 'foreignId', nullable: false, references: 'users' },
          { name: 'role',      type: 'enum', values: ['owner', 'admin', 'member', 'viewer'], nullable: false },
          { name: 'joined_at', type: 'timestamp', nullable: true },
        ],
        relations: [
          { type: 'belongsTo', model: 'Team' },
        ],
        generate: { ...DEFAULT_GENERATE },
        migration: { ...M },
      },
      {
        name: 'Subscription',
        table: 'subscriptions',
        fields: [
          { name: 'team_id',             type: 'foreignId', nullable: false, references: 'teams' },
          { name: 'plan',                type: 'string',    nullable: false },
          { name: 'status',              type: 'enum', values: ['active', 'trialing', 'cancelled', 'past_due'], nullable: false },
          { name: 'trial_ends_at',       type: 'timestamp', nullable: true },
          { name: 'current_period_end',  type: 'timestamp', nullable: false },
          { name: 'stripe_id',           type: 'string',    nullable: true },
        ],
        relations: [
          { type: 'belongsTo', model: 'Team' },
          { type: 'hasMany',   model: 'Invoice' },
        ],
        generate: { ...DEFAULT_GENERATE },
        migration: { ...M },
      },
      {
        name: 'Invoice',
        table: 'invoices',
        fields: [
          { name: 'team_id',         type: 'foreignId', nullable: false, references: 'teams' },
          { name: 'subscription_id', type: 'foreignId', nullable: true,  references: 'subscriptions' },
          { name: 'number',          type: 'string',    nullable: false, unique: true },
          { name: 'amount',          type: 'decimal',   nullable: false },
          { name: 'currency',        type: 'string',    nullable: false },
          { name: 'status',          type: 'enum', values: ['open', 'paid', 'uncollectible'], nullable: false },
          { name: 'paid_at',         type: 'timestamp', nullable: true },
          { name: 'pdf_url',         type: 'string',    nullable: true },
        ],
        relations: [
          { type: 'belongsTo', model: 'Team' },
          { type: 'belongsTo', model: 'Subscription' },
        ],
        generate: { ...DEFAULT_GENERATE },
        migration: { ...M },
      },
    ],
  },

  /* ── Media ──────────────────────────────────────────────────────── */
  {
    id: 'media',
    name: 'Media',
    icon: '🖼️',
    description: 'File & media management — uploads, folders, metadata.',
    models: [
      {
        name: 'MediaFolder',
        table: 'media_folders',
        fields: [
          { name: 'name',      type: 'string',    nullable: false },
          { name: 'parent_id', type: 'foreignId', nullable: true, references: 'media_folders' },
          { name: 'path',      type: 'string',    nullable: false },
        ],
        relations: [
          { type: 'hasMany', model: 'Media' },
        ],
        generate: { ...DEFAULT_GENERATE },
        migration: { ...M },
      },
      {
        name: 'Media',
        table: 'media',
        fields: [
          { name: 'folder_id', type: 'foreignId', nullable: true, references: 'media_folders' },
          { name: 'filename',  type: 'string',    nullable: false },
          { name: 'disk',      type: 'string',    nullable: false },
          { name: 'path',      type: 'string',    nullable: false },
          { name: 'url',       type: 'string',    nullable: false },
          { name: 'mime_type', type: 'string',    nullable: false },
          { name: 'size',      type: 'integer',   nullable: false },
          { name: 'alt',       type: 'string',    nullable: true },
          { name: 'metadata',  type: 'json',      nullable: true },
        ],
        relations: [
          { type: 'belongsTo', model: 'MediaFolder' },
        ],
        generate: { ...DEFAULT_GENERATE },
        migration: { ...M },
      },
    ],
  },

  /* ── Notifications ──────────────────────────────────────────────── */
  {
    id: 'notifications',
    name: 'Notifications',
    icon: '🔔',
    description: 'In-app & email notifications with preferences per channel.',
    models: [
      {
        name: 'Notification',
        table: 'notifications',
        fields: [
          { name: 'user_id',   type: 'foreignId', nullable: false, references: 'users' },
          { name: 'type',      type: 'string',    nullable: false },
          { name: 'title',     type: 'string',    nullable: false },
          { name: 'body',      type: 'text',      nullable: true },
          { name: 'data',      type: 'json',      nullable: true },
          { name: 'action_url',type: 'string',    nullable: true },
          { name: 'read_at',   type: 'timestamp', nullable: true },
        ],
        relations: [],
        generate: { ...DEFAULT_GENERATE, softDelete: false },
        migration: { ...M },
      },
      {
        name: 'NotificationPreference',
        table: 'notification_preferences',
        fields: [
          { name: 'user_id', type: 'foreignId', nullable: false, references: 'users' },
          { name: 'type',    type: 'string',    nullable: false },
          { name: 'channel', type: 'enum', values: ['email', 'push', 'sms', 'in_app'], nullable: false },
          { name: 'enabled', type: 'boolean',   nullable: false },
        ],
        relations: [],
        generate: { ...DEFAULT_GENERATE, controller: false, routes: false },
        migration: { ...M },
      },
    ],
  },

  /* ── Messaging ──────────────────────────────────────────────────── */
  {
    id: 'messaging',
    name: 'Messaging',
    icon: '💬',
    description: 'Direct & group conversations with read receipts.',
    models: [
      {
        name: 'Conversation',
        table: 'conversations',
        fields: [
          { name: 'name',       type: 'string',  nullable: true },
          { name: 'type',       type: 'enum', values: ['direct', 'group'], nullable: false },
          { name: 'is_archived',type: 'boolean', nullable: false },
          { name: 'last_message_at', type: 'timestamp', nullable: true },
        ],
        relations: [
          { type: 'hasMany', model: 'Message' },
          { type: 'hasMany', model: 'Participant' },
        ],
        generate: { ...DEFAULT_GENERATE },
        migration: { ...M },
      },
      {
        name: 'Message',
        table: 'messages',
        fields: [
          { name: 'conversation_id', type: 'foreignId', nullable: false, references: 'conversations' },
          { name: 'sender_id',       type: 'foreignId', nullable: false, references: 'users' },
          { name: 'body',            type: 'text',      nullable: true },
          { name: 'type',            type: 'enum', values: ['text', 'image', 'file', 'system'], nullable: false },
          { name: 'attachment_url',  type: 'string',    nullable: true },
          { name: 'read_at',         type: 'timestamp', nullable: true },
        ],
        relations: [
          { type: 'belongsTo', model: 'Conversation' },
        ],
        generate: { ...DEFAULT_GENERATE },
        migration: { ...M, softDeletes: true },
      },
      {
        name: 'Participant',
        table: 'participants',
        fields: [
          { name: 'conversation_id', type: 'foreignId', nullable: false, references: 'conversations' },
          { name: 'user_id',         type: 'foreignId', nullable: false, references: 'users' },
          { name: 'role',            type: 'enum', values: ['admin', 'member'], nullable: false },
          { name: 'last_read_at',    type: 'timestamp', nullable: true },
          { name: 'muted_at',        type: 'timestamp', nullable: true },
        ],
        relations: [
          { type: 'belongsTo', model: 'Conversation' },
        ],
        generate: { ...DEFAULT_GENERATE, controller: false, routes: false },
        migration: { ...M },
      },
    ],
  },

  /* ── Audit Log ──────────────────────────────────────────────────── */
  {
    id: 'audit',
    name: 'Audit Log',
    icon: '📋',
    description: 'Immutable activity trail — who changed what and when.',
    models: [
      {
        name: 'AuditLog',
        table: 'audit_logs',
        fields: [
          { name: 'user_id',     type: 'foreignId', nullable: true, references: 'users' },
          { name: 'action',      type: 'string',    nullable: false },
          { name: 'model_type',  type: 'string',    nullable: false },
          { name: 'model_id',    type: 'bigInteger', nullable: false },
          { name: 'old_values',  type: 'json',      nullable: true },
          { name: 'new_values',  type: 'json',      nullable: true },
          { name: 'ip_address',  type: 'string',    nullable: true },
          { name: 'user_agent',  type: 'string',    nullable: true },
          { name: 'tags',        type: 'json',      nullable: true },
        ],
        relations: [],
        generate: {
          ...DEFAULT_GENERATE,
          controller: false, routes: false,
          resource: false, request: false, factory: false,
        },
        migration: { primary_key: 'id', timestamps: true, softDeletes: false },
      },
    ],
  },
];
