import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const productsData = [
  // 1. Devi Traditional Temple Jhumka Earrings 22K (BLJ-ER-004)
  {
    sku: 'BLJ-ER-004',
    variants: [
      { sku: 'BLJ-ER-004-A', price: 1450, discountPrice: 1190 }
    ],
    priceBreakup: {
      metalAmount: 885,
      otherCharge: 150,
      makingCharge: 120,
      gstAmount: 35,
      grandTotal: 1190
    },
    studdedDetails: {
      styleName: 'Other Charges [H]',
      studSalesAmount: 150,
      salesAmount: 150,
      otherCharges: 150
    }
  },

  // 2. Auspicious Swarna Mangalsutra 22K Gold (BLJ-MS-002)
  {
    sku: 'BLJ-MS-002',
    variants: [
      { sku: 'BLJ-MS-002-16', price: 1550, discountPrice: 1280 },
      { sku: 'BLJ-MS-002-18', price: 1750, discountPrice: 1450 }
    ],
    priceBreakup: {
      metalAmount: 973,
      otherCharge: 150,
      makingCharge: 120,
      gstAmount: 37,
      grandTotal: 1280
    },
    studdedDetails: {
      styleName: 'Other Charges [H]',
      studSalesAmount: 150,
      salesAmount: 150,
      otherCharges: 150
    }
  },

  // 3. Eternity Solitaire Diamond Ring 18K Rose Gold (BLJ-RG-003)
  {
    sku: 'BLJ-RG-003',
    variants: [
      { sku: 'BLJ-RG-003-12', price: 1650, discountPrice: 1390 },
      { sku: 'BLJ-RG-003-14', price: 1850, discountPrice: 1580 }
    ],
    priceBreakup: {
      metalAmount: 1059,
      otherCharge: 160,
      makingCharge: 130,
      gstAmount: 41,
      grandTotal: 1390
    },
    studdedDetails: {
      styleName: 'Other Charges [H]',
      studSalesAmount: 160,
      salesAmount: 160,
      otherCharges: 160
    }
  },

  // 4. Noor Chandbali Earrings with Emerald Accents (BLJ-ER-008)
  {
    sku: 'BLJ-ER-008',
    variants: [
      { sku: 'BLJ-ER-008-A', price: 1850, discountPrice: 1550 }
    ],
    priceBreakup: {
      metalAmount: 1185,
      otherCharge: 180,
      makingCharge: 140,
      gstAmount: 45,
      grandTotal: 1550
    },
    studdedDetails: {
      styleName: 'Other Charges [H]',
      studSalesAmount: 180,
      salesAmount: 180,
      otherCharges: 180
    }
  },

  // 5. Lakshmi Kasu Mala Heritage Necklace 22K (BLJ-NK-007)
  {
    sku: 'BLJ-NK-007',
    variants: [
      { sku: 'BLJ-NK-007-A', price: 2050, discountPrice: 1690 }
    ],
    priceBreakup: {
      metalAmount: 1291,
      otherCharge: 200,
      makingCharge: 150,
      gstAmount: 49,
      grandTotal: 1690
    },
    studdedDetails: {
      styleName: 'Other Charges [H]',
      studSalesAmount: 200,
      salesAmount: 200,
      otherCharges: 200
    }
  },

  // 6. Maya Royal Kundan Choker Necklace (BLJ-NK-001)
  {
    sku: 'BLJ-NK-001',
    variants: [
      { sku: 'BLJ-NK-001-A', price: 2150, discountPrice: 1780 },
      { sku: 'BLJ-NK-001-B', price: 2400, discountPrice: 1990 }
    ],
    priceBreakup: {
      metalAmount: 1368,
      otherCharge: 200,
      makingCharge: 160,
      gstAmount: 52,
      grandTotal: 1780
    },
    studdedDetails: {
      styleName: 'Other Charges [H]',
      studSalesAmount: 200,
      salesAmount: 200,
      otherCharges: 200
    }
  },

  // 7. Celestial Diamond Tennis Bracelet 18K White Gold (BLJ-BR-006)
  {
    sku: 'BLJ-BR-006',
    variants: [
      { sku: 'BLJ-BR-006-7', price: 2250, discountPrice: 1850 }
    ],
    priceBreakup: {
      metalAmount: 1416,
      otherCharge: 220,
      makingCharge: 160,
      gstAmount: 54,
      grandTotal: 1850
    },
    studdedDetails: {
      styleName: 'Other Charges [H]',
      studSalesAmount: 220,
      salesAmount: 220,
      otherCharges: 220
    }
  },

  // 8. Royal Rajwadi Polki Kada Bangle 22K Gold (BLJ-BG-005)
  {
    sku: 'BLJ-BG-005',
    variants: [
      { sku: 'BLJ-BG-005-24', price: 2350, discountPrice: 1920 },
      { sku: 'BLJ-BG-005-26', price: 2500, discountPrice: 2050 }
    ],
    priceBreakup: {
      metalAmount: 1474,
      otherCharge: 220,
      makingCharge: 170,
      gstAmount: 56,
      grandTotal: 1920
    },
    studdedDetails: {
      styleName: 'Other Charges [H]',
      studSalesAmount: 220,
      salesAmount: 220,
      otherCharges: 220
    }
  }
];

async function update() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB Atlas:', mongoose.connection.name);

  const productsColl = mongoose.connection.collection('products');

  for (const item of productsData) {
    const product = await productsColl.findOne({ sku: item.sku });
    if (!product) {
      console.warn(`Product ${item.sku} not found`);
      continue;
    }

    const updatedVariants = product.variants.map((v) => {
      const match = item.variants.find((iv) => iv.sku === v.sku);
      if (match) {
        return {
          ...v,
          price: match.price,
          discountPrice: match.discountPrice
        };
      }
      return v;
    });

    await productsColl.updateOne(
      { _id: product._id },
      {
        $set: {
          gstPercent: 3,
          variants: updatedVariants,
          priceBreakup: {
            ...item.priceBreakup,
            gstPercent: 3
          },
          studdedDetails: item.studdedDetails
        }
      }
    );

    console.log(
      `✓ Updated ${product.name} (${item.sku}): ` +
      `Selling Price=₹${item.priceBreakup.grandTotal} (Metal: ₹${item.priceBreakup.metalAmount} + Other: ₹${item.priceBreakup.otherCharge} + Making: ₹${item.priceBreakup.makingCharge} + GST: ₹${item.priceBreakup.gstAmount} = ₹${item.priceBreakup.grandTotal})`
    );
  }

  await mongoose.disconnect();
  console.log('All products updated with accurate 1k-2k breakdown successfully!');
}

update().catch((err) => {
  console.error('Update error:', err);
  process.exit(1);
});
