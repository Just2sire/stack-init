export const COMMUNITY_TEMPLATES = [
  {
    id: 'ecommerce-basic',
    name: 'E-commerce',
    icon: '🛒',
    description: 'Users · Products · Orders · Categories',
    models: [
      { name: 'User', fields: [{ name: 'email', type: 'string' }, { name: 'password', type: 'string' }], relations: [], generate: { controller: true, migration: true } },
      { name: 'Product', fields: [{ name: 'name', type: 'string' }, { name: 'price', type: 'decimal' }, { name: 'stock', type: 'integer' }], relations: [], generate: { controller: true, migration: true } },
      { name: 'Category', fields: [{ name: 'name', type: 'string' }, { name: 'slug', type: 'string' }], relations: [], generate: { controller: true, migration: true } },
      { name: 'Order', fields: [{ name: 'total', type: 'decimal' }, { name: 'status', type: 'string' }], relations: [], generate: { controller: true, migration: true } },
    ]
  },
  {
    id: 'saas-minimal',
    name: 'SaaS Starter',
    icon: '🚀',
    description: 'Users · Teams · Subscriptions · Invoices',
    models: [
      { name: 'User', fields: [{ name: 'email', type: 'string' }, { name: 'name', type: 'string' }], relations: [], generate: { controller: true, migration: true } },
      { name: 'Team', fields: [{ name: 'name', type: 'string' }, { name: 'slug', type: 'string' }], relations: [], generate: { controller: true, migration: true } },
      { name: 'Subscription', fields: [{ name: 'plan', type: 'string' }, { name: 'status', type: 'string' }], relations: [], generate: { controller: true, migration: true } },
      { name: 'Invoice', fields: [{ name: 'amount', type: 'decimal' }, { name: 'paid_at', type: 'timestamp', nullable: true }], relations: [], generate: { controller: true, migration: true } },
    ]
  },
  {
    id: 'blog',
    name: 'Blog',
    icon: '✍️',
    description: 'Users · Posts · Comments · Tags',
    models: [
      { name: 'User', fields: [{ name: 'email', type: 'string' }, { name: 'name', type: 'string' }], relations: [], generate: { controller: true, migration: true } },
      { name: 'Post', fields: [{ name: 'title', type: 'string' }, { name: 'slug', type: 'string' }, { name: 'content', type: 'text' }, { name: 'published_at', type: 'timestamp', nullable: true }], relations: [], generate: { controller: true, migration: true } },
      { name: 'Comment', fields: [{ name: 'content', type: 'text' }, { name: 'is_approved', type: 'boolean' }], relations: [], generate: { controller: true, migration: true } },
      { name: 'Tag', fields: [{ name: 'name', type: 'string' }, { name: 'slug', type: 'string' }], relations: [], generate: { controller: true, migration: true } },
    ]
  },
  {
    id: 'api-only',
    name: 'API Starter',
    icon: '⚡',
    description: 'Clean API — no predefined models',
    models: []
  },
];
