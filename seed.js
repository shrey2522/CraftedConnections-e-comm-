const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false,
});

// Define Models
const User = sequelize.define('User', {
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING,
});

const Product = sequelize.define('Product', {
  name: DataTypes.STRING,
  description: DataTypes.STRING,
  price: DataTypes.FLOAT,
  category: DataTypes.STRING,
  imageUrl: DataTypes.STRING,
  rating: DataTypes.FLOAT,
  stock: DataTypes.INTEGER,
});

const Order = sequelize.define('Order', {
  totalAmount: DataTypes.FLOAT,
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
});

const OrderItem = sequelize.define('OrderItem', {
  quantity: DataTypes.INTEGER,
  price: DataTypes.FLOAT,
});

// Define Relationships
User.hasMany(Order);
Order.belongsTo(User);
Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);
OrderItem.belongsTo(Product);

// Seeder Function
async function seed() {
  try {
    await sequelize.sync({ force: true }); // Drops & recreates tables

    console.log('📦 Database synced.');

    // Add dummy user
    const hashedPassword = await bcrypt.hash('test1234', 8);
    await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword,
    });

    console.log('👤 Dummy user created: test@example.com / test1234');

    // Add products
   const products = [
  {
    name: 'Modern Corner Sofa',
    description: 'Elegant and spacious L-shaped sofa for your living room. Crafted with premium fabric, solid frame, and plush cushioning for unmatched comfort. Perfect for hosting guests or relaxing with family.',
    price: 15999,
    category: 'Sofas',
    imageUrl: 'https://images.unsplash.com/photo-1705028877408-209f583a5008?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4,
    stock: 10,
  },
  {
  name: 'Velvet Luxe Sofa Set',
  description: '3-seater plush velvet sofa with premium stitching.',
  longDescription: 'Sink into comfort with our Velvet Luxe Sofa Set. This 3-seater features deep cushioning, smooth velvet upholstery, and stylish button tufting. The mid-century wooden legs provide sturdy support while enhancing elegance.',
  price: 22999,
  category: 'Sofas',
  imageUrl: 'https://images.unsplash.com/photo-1658500353815-4d22b7cc6dd3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  rating: 4.5,
  stock: 8
},
{
  name: 'Scandinavian Wooden Sofa',
  description: 'Minimalistic wooden-framed sofa with grey cushions.',
  longDescription: 'A timeless addition to any home, this Scandinavian Wooden Sofa is known for its sleek lines, ergonomic back support, and removable cushion covers. Made from sustainably sourced teak wood.',
  price: 17999,
  category: 'Sofas',
  imageUrl: 'https://images.unsplash.com/photo-1562606795-1a23df4e65c5?q=80&w=688&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  rating: 3.5,
  stock: 5
},
  {
    name: 'Minimalist Ceiling Light',
    description: 'Flush mount LED ceiling light that brings elegance and energy efficiency to your space. Long-lasting, glare-free lighting ideal for bedrooms and hallways.',
    price: 12499,
    category: 'Lighting',
    imageUrl: 'https://i.pinimg.com/736x/04/87/94/04879493fd1edb91f1b8625f275f1c0c.jpg',
    rating: 4.2,
    stock: 15,
  },
  {
    name: 'Metal Wall Art',
    description: '3-piece modern metal wall decor. Adds depth and luxury to your walls, hand-finished in rustic gold-black shades. A statement piece for living rooms and offices.',
    price: 8999,
    category: 'Wall Decor',
    imageUrl: 'https://rukminim2.flixcart.com/image/850/1000/xif0q/wall-decoration/w/p/x/metal-wall-decor-wall-arts-for-home-living-room-hotel-decoration-original-imagqhzbtq8qhy4s.jpeg?q=90&crop=false',
    rating: 4.5,
    stock: 20,
  },
  {
    name: 'Luxury King Bed Set',
    description: 'Comfortable king-sized bed with padded headboard and storage drawers. Crafted with engineered wood and premium upholstery. The ultimate sleep experience.',
    price: 24999,
    category: 'Beds',
    imageUrl: 'https://www.ikea.com/images/a-dunvik-divan-bed-with-white-nattjasmin-bed-linen-stands-in-546f300088dddceb8aff9d7b9597401a.jpg?f=s',
    rating: 5,
    stock: 8,
  },
  {
    name: 'Wardrobe with Mirror',
    description: 'Sleek 3-door wardrobe with full-length mirror. Includes hanging space, drawers, and adjustable shelves. Designed for functionality and elegance.',
    price: 18999,
    category: 'Storage',
    imageUrl: 'https://www.ikea.com/ext/ingkadam/m/1a0bf090813a9481/original/PH193642-crop002.jpg?f=s',
    rating: 4,
    stock: 12,
  },
  {
    name: 'Bohemian Area Rug',
    description: 'Handwoven multicolor rug crafted with natural fibers. Adds warmth and vibrancy to your living room or bedroom. Anti-skid backing for safety.',
    price: 7499,
    category: 'Rugs',
    imageUrl:'https://images.unsplash.com/photo-1631466882094-d4af58ef7025?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 3,
    stock: 18,
  },
  {
    name: 'Rustic Coffee Table',
    description: 'Solid mango wood coffee table with open shelf. Rustic finish that pairs beautifully with industrial and vintage decor. Durable and easy to maintain.',
    price: 8499,
    category: 'Tables',
    imageUrl: 'https://images.unsplash.com/photo-1579173361852-eea884c0c480?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4.5,
    stock: 10,
  },
  {
    name: 'Floating Wall Shelves',
    description: 'Set of 3 wall-mounted shelves. Made from engineered wood with matte finish. Ideal for books, plants, or decor. Easy to install.',
    price: 3299,
    category: 'Wall Decor',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1700502418297-535c711d63c6?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 3.5,
    stock: 25,
  },
  {
    name: 'Nordic Dining Set',
    description: '6-seater wooden dining table with cushioned chairs. Scandinavian design meets Indian comfort. Scratch-resistant and water-repellent surface.',
    price: 31999,
    category: 'Dining',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1673214881759-4bd60b76acae?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4,
    stock: 7,
  },
  {
    name: 'Artisan Clay Vase',
    description: 'Handcrafted terracotta vase for side tables, consoles, or centerpieces. Matte earthy finish with natural patterns. Supports local artisans.',
    price: 1299,
    category: 'Decor',
    imageUrl: 'https://images.unsplash.com/photo-1529079091004-2b0ed179f9f2?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 4,
    stock: 30,
  },
  {
    name: 'Macrame Wall Hanging',
    description: 'Boho-style cotton rope wall hanging with wooden dowel. Perfect for bedrooms, balconies or cafes. Eco-friendly and handmade.',
    price: 1999,
    category: 'Wall Decor',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1694289986113-874e1e48a1c1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 5,
    stock: 40,
  },
  {
    name: 'Velvet Accent Chair',
    description: 'Luxurious deep green velvet chair with gold legs. Adds a pop of color to your space. Great for reading corners and cozy nooks.',
    price: 11999,
    category: 'Seating',
    imageUrl: 'https://images.unsplash.com/photo-1520453714493-d85cdd7b033b?q=80&w=1144&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 3,
    stock: 9,
  },
  {
    name: 'Round Mirror with Frame',
    description: 'Minimalist round mirror with sleek black metal frame. Easy wall mounting, anti-rust. Ideal for bathrooms, entryways, or vanity.',
    price: 3499,
    category: 'Mirrors',
    imageUrl: 'https://images.unsplash.com/photo-1585033120874-0300a04ded70?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 3,
    stock: 17,
  },
  {
    name: 'Entryway Shoe Rack',
    description: 'Compact wooden shoe rack with cushioned seating. Holds up to 12 pairs. Blends functionality and style for modern entryways.',
    price: 4799,
    category: 'Storage',
    imageUrl: 'https://images.unsplash.com/photo-1686496895853-82012d536ef9?q=80&w=785&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 3,
    stock: 22,
  },
  {
    name: 'LED Pendant Lights (3pc)',
    description: 'Set of 3 modern pendant lights for kitchen or dining area. Warm white glow. Height adjustable and energy saving.',
    price: 8999,
    category: 'Lighting',
    imageUrl: 'https://images.unsplash.com/photo-1709205656333-aa54fd89560f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 3.5,
    stock: 14,
  },
  {
  name: 'Vintage Chandelier',
  description: 'Rustic metal chandelier with 6 candle-style bulbs.',
  longDescription: 'Bring timeless charm to your space with this black iron chandelier. The open-frame design supports 6 bulbs, ideal for farmhouse or classic interiors.',
  price: 14999,
  category: 'Lighting',
  imageUrl: 'https://images.unsplash.com/photo-1707128406519-75776c34102e?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  rating: 4,
  stock: 6
},
  {
    name: 'Modern Corner Study Set',
    description: 'Elevate your workspace with our sleek and functional Modern Corner Study Set. Features a spacious corner desk, built-in bookshelf with closed cabinets and open shelves, and two comfortable teal chairs. Ideal for students and professionals.',
    price: 7500,
    category: 'Study',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1732730224574-d05fc344b03c?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    rating: 3.5,
    stock: 6,
  }
];


    await Product.bulkCreate(products);
    console.log(`🛒 ${products.length} products seeded.`);

    console.log('✅ Seeding complete!');
    process.exit();
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
}

seed();
