export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  telegram: {
    botToken: process.env.BOT_TOKEN,
    adminIds: (process.env.ADMIN_TELEGRAM_IDS || '')
      .split(',')
      .filter(Boolean)
      .map(Number),
    miniAppUrl: process.env.MINIAPP_URL || '',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USER || 'intizom',
    password: process.env.DB_PASSWORD || 'intizom123',
    name: process.env.DB_NAME || 'intizom',
    synchronize: process.env.DB_SYNC === 'true' || process.env.NODE_ENV !== 'production',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'default_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
  },
  product: {
    price: parseInt(process.env.PRODUCT_PRICE, 10) || 49000,
  },
});
