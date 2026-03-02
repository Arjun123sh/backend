const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./src/models/User");
const Product = require("./src/models/Product");
const connectDB = require("./src/config/db");

dotenv.config();
connectDB();

const productsData = [
  // ... your existing 3 products
  {
    title: "Aura RGB Mechanical Keyboard",
    description: "Hot-swappable mechanical switches with customizable RGB backlighting and a sleek aluminum frame.",
    price: 159.0,
    category: "Tech Accessories",
    stockQuantity: 25,
    productImage: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=800&q=80",
  },
  {
    title: "Zen Wood Monitor Riser",
    description: "Handcrafted solid walnut monitor stand that creates extra storage space while improving posture.",
    price: 85.0,
    category: "Desk Organizers",
    stockQuantity: 12,
    productImage: "https://images.unsplash.com/photo-1585791780658-f3279165cc3d?w=800&q=80",
  },
  {
    title: "SonicFlow Noise-Cancelling Headphones",
    description: "Over-ear wireless headphones with active noise cancellation and 40-hour battery life.",
    price: 299.0,
    category: "Audio",
    stockQuantity: 20,
    productImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80",
  },
  {
    title: "Orbit 360 Wireless Mouse",
    description: "Ergonomic vertical mouse designed to reduce wrist strain. Features 6 programmable buttons.",
    price: 65.0,
    category: "Tech Accessories",
    stockQuantity: 40,
    productImage: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&q=80",
  },
  {
    title: "Titan Mesh Office Chair",
    description: "High-back ergonomic chair with 4D armrests and lumbar support for maximum comfort.",
    price: 450.0,
    category: "Furniture",
    stockQuantity: 8,
    productImage: "https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=800&q=80",
  },
  {
    title: "Vertex 4K Web Camera",
    description: "Ultra-HD streaming camera with dual microphones and privacy shutter.",
    price: 110.0,
    category: "Tech Accessories",
    stockQuantity: 18,
    productImage: "https://images.unsplash.com/photo-1626125345510-4603468ecd18?w=800&q=80",
  },
  {
    title: "Prism Glass Water Bottle",
    description: "BPA-free borosilicate glass bottle with a silicone protective sleeve for the workspace.",
    price: 28.0,
    category: "Lifestyle",
    stockQuantity: 60,
    productImage: "https://images.unsplash.com/photo-1602143307185-8a155ca53b4a?w=800&q=80",
  },
  {
    title: "Sync Pro USB-C Hub",
    description: "8-in-1 adapter featuring 4K HDMI, SD card reader, and 100W Power Delivery.",
    price: 55.0,
    category: "Tech Accessories",
    stockQuantity: 35,
    productImage: "https://images.unsplash.com/photo-1586776977607-310e9c725c37?w=800&q=80",
  },
  {
    title: "Lunar Grey Felt Coasters",
    description: "Set of 4 absorbent felt coasters with a non-slip cork base.",
    price: 15.0,
    category: "Desk Organizers",
    stockQuantity: 100,
    productImage: "https://images.unsplash.com/photo-1530262923921-52434da5d00a?w=800&q=80",
  },
  {
    title: "Core Bamboo Cable Tray",
    description: "Under-desk cable management system to hide messy wires and power strips.",
    price: 40.0,
    category: "Desk Organizers",
    stockQuantity: 22,
    productImage: "https://images.unsplash.com/photo-1591485423007-7c53d0bb1956?w=800&q=80",
  },
  {
    title: "Pulse Desktop Speakers",
    description: "Compact 2.0 channel speakers with rich bass and minimalist wood aesthetics.",
    price: 95.0,
    category: "Audio",
    stockQuantity: 14,
    productImage: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80",
  },
  {
    title: "Grid Magnetic Whiteboard",
    description: "Frameless glass whiteboard for brainstorming and weekly scheduling.",
    price: 70.0,
    category: "Office Supplies",
    stockQuantity: 10,
    productImage: "https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?w=800&q=80",
  },
  {
    title: "Nova Wireless Charger",
    description: "15W fast-charging pad wrapped in premium gray fabric.",
    price: 35.0,
    category: "Tech Accessories",
    stockQuantity: 55,
    productImage: "https://images.unsplash.com/photo-1586816832793-1344fc2be3c4?w=800&q=80",
  },
  {
    title: "Drift Walnut Headphone Stand",
    description: "A sculptural stand to display and protect your premium audio gear.",
    price: 42.0,
    category: "Desk Organizers",
    stockQuantity: 20,
    productImage: "https://images.unsplash.com/photo-1524670497765-53342fde0b8b?w=800&q=80",
  },
  {
    title: "Apex Sit-Stand Desk",
    description: "Motorized standing desk with dual motors and 4 height presets.",
    price: 599.0,
    category: "Furniture",
    stockQuantity: 5,
    productImage: "https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&q=80",
  },
  {
    title: "Studio Soundproofing Panels",
    description: "Set of 12 acoustic foam panels for reducing echoes in home offices.",
    price: 48.0,
    category: "Office Supplies",
    stockQuantity: 30,
    productImage: "https://images.unsplash.com/photo-1596495573826-3946d001146d?w=800&q=80",
  },
  {
    title: "Flow Ceramic Coffee Mug",
    description: "Matte-finish 12oz ceramic mug with an insulated lid for long mornings.",
    price: 22.0,
    category: "Lifestyle",
    stockQuantity: 45,
    productImage: "https://images.unsplash.com/photo-1514228742587-6b1558fbed39?w=800&q=80",
  },
  {
    title: "Keycap Artisan Set",
    description: "Custom hand-painted resin keycaps for cherry-MX style keyboards.",
    price: 40.0,
    category: "Tech Accessories",
    stockQuantity: 15,
    productImage: "https://images.unsplash.com/photo-1618384881928-bb2832560ceb?w=800&q=80",
  },
  {
    title: "Eclipse Desk Fan",
    description: "Bladeless USB-powered fan with quiet-operation technology.",
    price: 38.0,
    category: "Lifestyle",
    stockQuantity: 28,
    productImage: "https://images.unsplash.com/photo-1619362280286-f1f8fd5032ed?w=800&q=80",
  },
  {
    title: "Nano Leaf Accent Lights",
    description: "Modular smart light panels that sync with your computer screen colors.",
    price: 180.0,
    category: "Lighting",
    stockQuantity: 12,
    productImage: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
  },
  {
    title: "Graphite Pencil Holder",
    description: "Concrete-molded minimalist pen cup for a brutalist aesthetic.",
    price: 18.0,
    category: "Desk Organizers",
    stockQuantity: 40,
    productImage: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=800&q=80",
  },
  {
    title: "Atlas World Map Blotter",
    description: "Large desk pad featuring a vintage topographical world map print.",
    price: 35.0,
    category: "Desk Organizers",
    stockQuantity: 19,
    productImage: "https://images.unsplash.com/photo-1532153322601-0c7702cd1b5f?w=800&q=80",
  },
  {
    title: "Stellar Tablet Stand",
    description: "Multi-angle foldable stand compatible with all tablets and smartphones.",
    price: 25.0,
    category: "Tech Accessories",
    stockQuantity: 50,
    productImage: "https://images.unsplash.com/photo-1586105251261-72a756657c11?w=800&q=80",
  },
  {
    title: "Drafting Task Chair",
    description: "Armless swivel chair with height-adjustable foot ring for drafting tables.",
    price: 185.0,
    category: "Furniture",
    stockQuantity: 7,
    productImage: "https://images.unsplash.com/photo-1505797149-43b007664976?w=800&q=80",
  },
  {
    title: "Omni Microfiber Cloths",
    description: "Pack of 5 ultra-soft cloths for screen cleaning and dust removal.",
    price: 12.0,
    category: "Office Supplies",
    stockQuantity: 150,
    productImage: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&q=80",
  },
  {
    title: "Focus Sand Timer",
    description: "Elegant 30-minute glass sand timer for Pomodoro productivity sessions.",
    price: 24.0,
    category: "Lifestyle",
    stockQuantity: 25,
    productImage: "https://images.unsplash.com/photo-1543167666-3fe676e10787?w=800&q=80",
  },
  {
    title: "Breeze Air Purifier",
    description: "HEPA filter desktop air purifier for removing dust and allergens.",
    price: 115.0,
    category: "Tech Accessories",
    stockQuantity: 10,
    productImage: "https://images.unsplash.com/photo-1585771724684-252702b64428?w=800&q=80",
  }
];

const seedProducts = async () => {
  try {
    // 🔥 Find existing admin
    const adminUser = await User.findOne({ role: "admin" });

    if (!adminUser) {
      console.log("No admin user found. Please create admin first.");
      process.exit(1);
    }

    // 🧹 Clear old products only
    await Product.deleteMany();

    // 🛍 Attach admin ID to each product
    const productsWithUser = productsData.map((product) => ({
      ...product,
      user: adminUser._id,
    }));

    await Product.insertMany(productsWithUser);

    console.log("✅ Products seeded successfully!");
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

seedProducts();