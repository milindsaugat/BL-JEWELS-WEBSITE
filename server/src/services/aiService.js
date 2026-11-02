import { memoryStore } from '../config/memoryStore.js';

// Pre-crafted intelligent responses when OPENAI_API_KEY is not set or offline
const getFallbackPriyaResponse = (userMessage, context) => {
  const msg = (userMessage || '').toLowerCase();

  if (msg.includes('gold purity') || msg.includes('hallmark') || msg.includes('22k') || msg.includes('18k') || msg.includes('916')) {
    return "At BL Jewels, 'Purity with Auspiciousness' is our hallmark. 22K gold represents 91.6% pure gold (BIS 916), ideal for traditional handcrafted jewelry, while 18K gold (75% purity) offers enhanced structural strength, perfect for diamond solitaires and daily wear. Every piece is certified with the official government BIS Hallmark.";
  }

  if (msg.includes('wedding') || msg.includes('bridal') || msg.includes('dulhan') || msg.includes('shaadi')) {
    return "For weddings, our brides adore the 'Maya Royal Kundan Choker Necklace' set with syndicate uncut polki and emerald drops, paired with our 'Devi Traditional Temple Jhumkas'. Would you prefer a grand Rajputana jadau style or a classic South Indian temple collection?";
  }

  if (msg.includes('mangalsutra') || msg.includes('sacred')) {
    return "Our 'Auspicious Swarna Mangalsutra 22K Gold' is a customer favorite. It features hand-strung black onyx beads with a delicate brilliant-cut diamond floral pendant in hallmarked 916 gold. It is lightweight for daily grace yet sacred for ceremonial pride.";
  }

  if (msg.includes('budget') || msg.includes('price') || msg.includes('range') || msg.includes('under') || msg.includes('cheap') || msg.includes('cost')) {
    return "We have exquisite certified pieces starting from ₹80,000 for everyday gold bands and mangalsutras, up to ₹4,00,000+ for heavy polki bridal chokers and diamond tennis bracelets. Would you like me to filter pieces within a specific budget?";
  }

  if (msg.includes('gift') || msg.includes('anniversary') || msg.includes('birthday') || msg.includes('wife')) {
    return "For an unforgettable anniversary or gifting moment, our 'Eternity Solitaire Diamond Ring in 18K Rose Gold' or the 'Celestial Diamond Tennis Bracelet' are timeless choices that arrive in our signature velvet crimson-and-gold gift box.";
  }

  if (msg.includes('return') || msg.includes('exchange') || msg.includes('shipping') || msg.includes('delivery')) {
    return "We offer complimentary insured luxury delivery via Blue Dart Luxury Express across India. Every order comes with a 15-day return and exchange policy and 100% lifetime buyback assurance on gold weight.";
  }

  return "Namaste! 🙏 Welcome to BL Jewels. I am Priya, your jewelry stylist. Whether you are looking for BIS 916 hallmarked bridal sets, daily wear diamond rings, or custom gold sizing, I am here to guide you. What special occasion are we celebrating?";
};

export const chatWithPriya = async (messages, context = {}) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.startsWith('sk-')) {
    try {
      const systemPrompt = `You are Priya, a personal jewelry styling expert at BL Jewels — a premium Indian jewelry brand known for "Purity with Auspiciousness."
Help customers find the perfect jewelry piece.
Catalog highlights:
- 22K Maya Royal Kundan Choker (₹3,42,000)
- Auspicious Swarna Mangalsutra 22K (₹82,900)
- Eternity Solitaire Diamond Ring 18K (₹1,72,000)
- Devi Temple Jhumkas 22K (₹1,98,000)
- Royal Rajwadi Polki Kada 22K (₹2,89,000)
- Celestial Diamond Tennis Bracelet 18K (₹2,55,000)
Rules:
- Respond warmly in English, Hindi or Hinglish matching the customer's query.
- Emphasize BIS 916 Hallmark, lifetime buyback, and pure craftsmanship.
- Keep answers concise (2-4 sentences).`;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: systemPrompt }, ...messages],
          max_tokens: 350,
          temperature: 0.7,
        }),
      });

      const data = await response.json();
      if (data.choices?.[0]?.message?.content) {
        return data.choices[0].message.content;
      }
    } catch (err) {
      console.warn('OpenAI API call failed, falling back to local styling logic:', err.message);
    }
  }

  // Fallback to local intelligent rule-based stylist
  const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.content || '';
  return getFallbackPriyaResponse(lastUserMsg, context);
};

export const getSmartSearchSuggestions = async (query) => {
  const q = (query || '').toLowerCase().trim();
  if (!q) return [];

  const matched = memoryStore.products.filter(p => {
    return (
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.categorySlug.toLowerCase().includes(q) ||
      p.metal?.type.toLowerCase().includes(q) ||
      p.tags?.some(t => t.toLowerCase().includes(q)) ||
      p.occasion?.some(o => o.toLowerCase().includes(q))
    );
  });

  return matched.slice(0, 6).map(p => ({
    id: p._id,
    name: p.name,
    slug: p.slug,
    price: p.variants?.[0]?.discountPrice || p.variants?.[0]?.price,
    image: p.images?.[0]?.url,
    category: p.categorySlug,
    karat: p.metal?.karat,
    matchReason: p.occasion?.includes('wedding') ? 'Ideal for Bridal & Celebrations' : 'BIS 916 Certified Heirloom',
  }));
};

export const generateProductDescription = async (details) => {
  const { name, metal, karat, stone, occasion } = details;
  return {
    shortDescription: `Exquisite ${karat || '22K'} ${metal || 'gold'} ${name} featuring authentic Indian craftsmanship and official BIS Hallmark purity certification.`,
    longDescription: `Celebrate timeless majesty with the ${name}. Meticulously sculpted by BL Jewels' heritage master artisans, this jewel balances auspicious cultural tradition with refined luxury aesthetics. Every curve reflects precision finishing and hallmarked integrity, ensuring this piece remains an heirloom passed down through generations.`,
    metaTitle: `${name} | ${karat || '22K'} Gold Fine Jewelry | BL Jewels`,
    keywords: [name.toLowerCase(), 'bl jewels', `${karat || '22k'} gold`, 'bis hallmark', occasion || 'wedding jewelry'],
    features: [
      'Guaranteed BIS 916 Hallmark Purity',
      'Handcrafted by generational artisans',
      'Comes in velvet keepsake case with certificate',
      'Complimentary insured express delivery',
    ]
  };
};

