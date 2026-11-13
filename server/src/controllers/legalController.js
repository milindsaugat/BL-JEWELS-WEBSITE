import LegalPage from '../models/LegalPage.js';
import { getDbStatus } from '../config/db.js';
import { memoryStore } from '../config/memoryStore.js';

const DEFAULT_PRIVACY_POLICY = {
  title: 'Privacy Policy',
  slug: 'privacy-policy',
  summary: 'How BL Jewels collects, encrypts, and protects patron personal data and government KYC records.',
  isPublished: true,
  order: 1,
  lastUpdated: new Date('2026-01-01'),
  content: `
<h2>1. Introduction & Commitment to Privacy</h2>
<p>At <strong>B.L. Jewels Atelier Pvt. Ltd.</strong> ("BL Jewels", "we", "us", or "our"), safeguarding your confidentiality and personal information is integral to our foundational promise of <em>Purity with Auspiciousness</em>. This Privacy Policy describes how we collect, store, verify, and protect personal and financial data across our digital flagship (<code>bljewels.com</code>), concierge communication channels, and physical showroom in Civil Lines, Agra.</p>

<h2>2. Information We Collect</h2>
<ul>
  <li><strong>Personal Identification & Contact:</strong> Full legal name, verified email address, mobile phone number, and residential delivery address.</li>
  <li><strong>Government Compliance & KYC Records:</strong> In compliance with Indian Income Tax Rule 114B and prevention of money laundering guidelines, transactions exceeding ₹2,00,000 require Permanent Account Number (PAN) submission. We securely store your 10-digit PAN number and encrypted photo copy for audit and official GST e-invoicing.</li>
  <li><strong>Payment & Transaction Information:</strong> Order invoice references, payment transaction IDs (Razorpay / UPI UTRs), and billing records. We do not store credit/debit card PINs or net-banking passwords.</li>
  <li><strong>Browsing & Technical Data:</strong> IP address, device fingerprints, and anonymized analytics to prevent fraud and enhance atelier navigation.</li>
</ul>

<h2>3. Purpose & Legal Basis for Processing</h2>
<p>We process your data strictly for legitimate jewelry atelier operations:</p>
<ul>
  <li>Fulfilling orders and arranging insured, armored transit via Blue Dart Armored Dispatch.</li>
  <li>Authenticating BIS Hallmarking records and issuing digital Hallmark purity certificates.</li>
  <li>Fulfilling legal tax obligations, GST compliance, and audit requirements under Indian jurisprudence.</li>
  <li>Providing royal concierge assistance, sizing consultations, and support ticket resolutions.</li>
</ul>

<h2>4. Data Storage, CDN & Armored Encryption</h2>
<p>Customer data is protected using enterprise-grade TLS 1.3 in-transit encryption and AES-256 at-rest database encryption. Customer uploaded avatars, PAN documents, and jewelry images are stored on secure CDN infrastructure with private access controls.</p>

<h2>5. Third-Party Disclosures</h2>
<p>We do not sell, rent, or trade your personal data. Disclosures are limited strictly to:</p>
<ul>
  <li><strong>Armored Logistics:</strong> Regulated bullion transit partners (Blue Dart / Sequel Logistics) solely for high-value insured physical delivery.</li>
  <li><strong>Regulatory & Statutory Authorities:</strong> Indian tax authorities, Bureau of Indian Standards (BIS), or law enforcement when mandated by court orders or statutory tax regulations.</li>
</ul>

<h2>6. Your Patron Rights</h2>
<p>Under the Digital Personal Data Protection (DPDP) Act and consumer protection guidelines, you have the right to request access to your records, request correction of inaccurate details via support ticket, and request account deactivation.</p>

<h2>7. Grievance Redressal & Flagship Contact</h2>
<p>For inquiries, privacy requests, or grievances, please address our Data Officer:</p>
<p>
  <strong>Grievance Officer:</strong> Legal & Compliance Atelier<br/>
  <strong>Email:</strong> contact@bljewels.com<br/>
  <strong>Flagship Showroom:</strong> Shop No. 01, Upper Ground Floor, Suresh Mall, MG Road, Civil Lines, Agra, Uttar Pradesh 282002<br/>
  <strong>Hotline:</strong> +91 74549 88610
</p>
  `.trim(),
};

const DEFAULT_TERMS_CONDITIONS = {
  title: 'Terms & Conditions',
  slug: 'terms-and-conditions',
  summary: 'Terms of sale, live bullion spot pricing, BIS 916 hallmarking warranty, and insured delivery.',
  isPublished: true,
  order: 2,
  lastUpdated: new Date('2026-01-01'),
  content: `
<h2>1. Agreement to Terms</h2>
<p>By browsing, accessing, or placing orders on the <strong>BL Jewels</strong> platform or through our flagship atelier, you agree to be bound by these Terms &amp; Conditions. Please review them carefully before commissioning or purchasing fine jewellery.</p>

<h2>2. Purity & BIS Hallmarking Guarantee</h2>
<ul>
  <li><strong>100% Certified Purity:</strong> Every article of gold jewellery crafted by BL Jewels is stamped with official Bureau of Indian Standards (BIS) Hallmarks, including the BIS logo, Karat/Purity fineness mark (e.g. 22K916, 18K750, 14K585), and unique HUID (Hallmark Unique Identification) code.</li>
  <li><strong>Natural Diamonds & Gemstones:</strong> All solitaires and diamond jewelry are accompanied by recognized laboratory certification (GIA/IGI/SGL) verifying 4Cs standards.</li>
</ul>

<h2>3. Dynamic Bullion Spot Pricing & Making Charges</h2>
<p>Fine jewelry pricing consists of: (Gold Weight × Live Spot Rate) + Making Charges + Precious Stones + GST (3%).</p>
<ul>
  <li><strong>Real-time Spot Rates:</strong> Bullion spot rates fluctuate based on international and MCX benchmark movements. The rate locked at checkout is legally binding for both parties.</li>
  <li><strong>Transparent Billing:</strong> In compliance with fair retail practices, every customer invoice itemizes metal weight, gross weight, net gold weight, making charges, and tax separately.</li>
</ul>

<h2>4. Government KYC & PAN Card Requirements</h2>
<p>Under Indian Income Tax Rule 114B, purchasing precious metals or jewellery exceeding <strong>₹2,00,000 (Two Lakh Rupees)</strong> per transaction requires mandatory PAN submission. Orders above this threshold without verified PAN records will be held pending verification.</p>

<h2>5. Insured Armored Dispatch & Delivery</h2>
<ul>
  <li>All shipments are dispatched via tamper-evident, sealed parcels through licensed armored transit services (Blue Dart / Sequel Logistics).</li>
  <li>Every package is 100% insured until delivered into the customer's hands. An OTP or physical signature and government ID verification may be required upon receipt.</li>
  <li>Customers are advised not to accept any package if the tamper-evident exterior seal is broken or compromised.</li>
</ul>

<h2>6. Lifetime Buyback & Exchange Policy</h2>
<p>BL Jewels offers a guaranteed lifetime buyback and exchange policy on all plain gold and diamond jewelry at prevailing spot market rates, subject to standard assay and hallmark verification at our Agra flagship atelier.</p>

<h2>7. Jurisdiction & Dispute Resolution</h2>
<p>These terms and all transactions are governed by the laws of India. Any disputes arising shall be subject to the exclusive jurisdiction of the competent courts of <strong>Agra, Uttar Pradesh</strong>.</p>
  `.trim(),
};

/**
 * Initialize / ensure default legal pages exist in DB or memoryStore
 */
const ensureDefaults = async () => {
  if (getDbStatus()) {
    const count = await LegalPage.countDocuments();
    if (count === 0) {
      await LegalPage.create([DEFAULT_PRIVACY_POLICY, DEFAULT_TERMS_CONDITIONS]);
    }
  } else {
    if (!memoryStore.legalPages || memoryStore.legalPages.length === 0) {
      memoryStore.legalPages = [
        { ...DEFAULT_PRIVACY_POLICY, _id: 'leg_privacy' },
        { ...DEFAULT_TERMS_CONDITIONS, _id: 'leg_terms' },
      ];
    }
  }
};

/**
 * GET /api/v1/legal
 * Returns public list of all active/published legal pages (for Footer & Navigation)
 */
export const getPublicLegalPages = async (req, res) => {
  try {
    await ensureDefaults();

    if (getDbStatus()) {
      const pages = await LegalPage.find({ isPublished: true })
        .select('title slug summary order lastUpdated')
        .sort({ order: 1, createdAt: 1 })
        .lean();
      return res.json({ success: true, pages });
    }

    const pages = (memoryStore.legalPages || [])
      .filter((p) => p.isPublished)
      .map(({ title, slug, summary, order, lastUpdated, _id }) => ({
        _id,
        title,
        slug,
        summary,
        order,
        lastUpdated,
      }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));

    return res.json({ success: true, pages });
  } catch (error) {
    console.error('getPublicLegalPages error:', error);
    res.status(500).json({ success: false, message: 'Failed to load legal pages.' });
  }
};

/**
 * GET /api/v1/legal/:slug
 * Returns full content of a published legal page by slug
 */
export const getLegalPageBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const cleanSlug = String(slug).toLowerCase().trim();

    await ensureDefaults();

    let page;
    if (getDbStatus()) {
      page = await LegalPage.findOne({ slug: cleanSlug, isPublished: true }).lean();
    } else {
      page = (memoryStore.legalPages || []).find(
        (p) => p.slug === cleanSlug && p.isPublished
      );
    }

    if (!page) {
      return res.status(404).json({ success: false, message: 'Legal page not found.' });
    }

    res.json({ success: true, page });
  } catch (error) {
    console.error('getLegalPageBySlug error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch legal page.' });
  }
};

/**
 * GET /api/v1/legal/admin/all
 * Admin: Returns all legal pages (published and drafts)
 */
export const getAdminLegalPages = async (req, res) => {
  try {
    await ensureDefaults();

    if (getDbStatus()) {
      const pages = await LegalPage.find().sort({ order: 1, createdAt: 1 }).lean();
      return res.json({ success: true, pages });
    }

    const pages = (memoryStore.legalPages || []).sort((a, b) => (a.order || 0) - (b.order || 0));
    return res.json({ success: true, pages });
  } catch (error) {
    console.error('getAdminLegalPages error:', error);
    res.status(500).json({ success: false, message: 'Failed to load legal pages directory.' });
  }
};

/**
 * POST /api/v1/legal
 * Admin: Create a new legal page
 */
export const createLegalPage = async (req, res) => {
  try {
    const { title, slug, summary, content, isPublished, order } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Page title and content are required.' });
    }

    const cleanSlug = (slug || title)
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    if (getDbStatus()) {
      const existing = await LegalPage.findOne({ slug: cleanSlug });
      if (existing) {
        return res.status(400).json({ success: false, message: 'A legal page with this slug already exists.' });
      }

      const page = await LegalPage.create({
        title: String(title).trim(),
        slug: cleanSlug,
        summary: String(summary || '').trim(),
        content: String(content).trim(),
        isPublished: isPublished !== false,
        order: Number(order) || 0,
        lastUpdated: new Date(),
      });

      return res.status(201).json({ success: true, message: 'Legal page created successfully.', page });
    }

    // Memory store fallback
    const existing = (memoryStore.legalPages || []).find((p) => p.slug === cleanSlug);
    if (existing) {
      return res.status(400).json({ success: false, message: 'A legal page with this slug already exists.' });
    }

    const newPage = {
      _id: `leg_${Date.now()}`,
      title: String(title).trim(),
      slug: cleanSlug,
      summary: String(summary || '').trim(),
      content: String(content).trim(),
      isPublished: isPublished !== false,
      order: Number(order) || 0,
      lastUpdated: new Date(),
      createdAt: new Date(),
    };
    memoryStore.legalPages.push(newPage);

    return res.status(201).json({ success: true, message: 'Legal page created successfully.', page: newPage });
  } catch (error) {
    console.error('createLegalPage error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create legal page.' });
  }
};

/**
 * PUT /api/v1/legal/:id
 * Admin: Update existing legal page
 */
export const updateLegalPage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, slug, summary, content, isPublished, order } = req.body;

    if (getDbStatus()) {
      const page = await LegalPage.findById(id);
      if (!page) {
        return res.status(404).json({ success: false, message: 'Legal page not found.' });
      }

      if (slug && slug !== page.slug) {
        const cleanSlug = String(slug).toLowerCase().trim();
        const existing = await LegalPage.findOne({ slug: cleanSlug, _id: { $ne: id } });
        if (existing) {
          return res.status(400).json({ success: false, message: 'Another page already uses this slug.' });
        }
        page.slug = cleanSlug;
      }

      if (title !== undefined) page.title = String(title).trim();
      if (summary !== undefined) page.summary = String(summary).trim();
      if (content !== undefined) page.content = String(content).trim();
      if (isPublished !== undefined) page.isPublished = Boolean(isPublished);
      if (order !== undefined) page.order = Number(order) || 0;
      page.lastUpdated = new Date();

      await page.save();
      return res.json({ success: true, message: 'Legal page updated successfully.', page });
    }

    // Memory store fallback
    const page = (memoryStore.legalPages || []).find((p) => p._id === id);
    if (!page) {
      return res.status(404).json({ success: false, message: 'Legal page not found.' });
    }

    if (title !== undefined) page.title = String(title).trim();
    if (slug !== undefined) page.slug = String(slug).trim().toLowerCase();
    if (summary !== undefined) page.summary = String(summary).trim();
    if (content !== undefined) page.content = String(content).trim();
    if (isPublished !== undefined) page.isPublished = Boolean(isPublished);
    if (order !== undefined) page.order = Number(order) || 0;
    page.lastUpdated = new Date();

    return res.json({ success: true, message: 'Legal page updated successfully.', page });
  } catch (error) {
    console.error('updateLegalPage error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to update legal page.' });
  }
};

/**
 * DELETE /api/v1/legal/:id
 * Admin: Delete a legal page
 */
export const deleteLegalPage = async (req, res) => {
  try {
    const { id } = req.params;

    if (getDbStatus()) {
      const deleted = await LegalPage.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Legal page not found.' });
      }
      return res.json({ success: true, message: 'Legal page deleted successfully.' });
    }

    const idx = (memoryStore.legalPages || []).findIndex((p) => p._id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Legal page not found.' });
    }
    memoryStore.legalPages.splice(idx, 1);
    return res.json({ success: true, message: 'Legal page deleted successfully.' });
  } catch (error) {
    console.error('deleteLegalPage error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to delete legal page.' });
  }
};

