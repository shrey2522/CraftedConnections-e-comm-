const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const app = express();

// Simple CORS middleware (add this before other middleware)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false
});

// Models
const User = sequelize.define('User', {
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING
});

const Product = sequelize.define('Product', {
  name: DataTypes.STRING,
  description: DataTypes.STRING,
  price: DataTypes.FLOAT,
  category: DataTypes.STRING,
  imageUrl: DataTypes.STRING,
  rating: DataTypes.FLOAT,
  stock: DataTypes.INTEGER
});

const Order = sequelize.define('Order', {
  totalAmount: DataTypes.FLOAT,
  status: { type: DataTypes.STRING, defaultValue: 'pending' }
});

const OrderItem = sequelize.define('OrderItem', {
  quantity: DataTypes.INTEGER,
  price: DataTypes.FLOAT
});

// Relationships
User.hasMany(Order);
Order.belongsTo(User);
Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);
OrderItem.belongsTo(Product);

// Auth middleware (enhanced with better error handling)
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Missing token' });

    // Use a default JWT secret if not in environment
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.userId);
    if (!user) throw new Error();

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'All fields are required' });

    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 8);
    const user = await User.create({ name, email, password: hashed });
    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.status(201).json({ user: { id: user.id, name, email }, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Invalid credentials' });

    const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
    const token = jwt.sign({ userId: user.id }, JWT_SECRET);
    res.json({ user: { id: user.id, name: user.name, email }, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user info for persistent login
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Product routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.findAll();
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/products', auth, async (req, res) => {
  try {
    const { name, description, price, category, imageUrl, rating, stock } = req.body;
    if (!name || !price || !category) return res.status(400).json({ error: "Missing fields" });

    const product = await Product.create({ name, description, price, category, imageUrl, rating, stock });
    res.status(201).json(product);
  } catch (err) {
    console.error("Error adding product:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Order route
app.post('/api/orders', auth, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;
    if (!items?.length) return res.status(400).json({ error: 'Cart is empty' });

    const order = await Order.create({ UserId: req.user.id, totalAmount });
    for (let item of items) {
      await OrderItem.create({
        OrderId: order.id,
        ProductId: item.productId,
        quantity: item.quantity,
        price: item.price
      });
    }

    res.status(201).json({ message: 'Order placed successfully' });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files
app.use(express.static(__dirname));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    await sequelize.sync();
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🛍️  Products: http://localhost:${PORT}/api/products`);
    
    // Check if products exist
    const productCount = await Product.count();
    if (productCount === 0) {
      console.log('⚠️  No products found. Run the seeder: node seed.js');
    } else {
      console.log(`📦 ${productCount} products loaded`);
    }
  } catch (error) {
    console.error('Server startup error:', error);
  }
});