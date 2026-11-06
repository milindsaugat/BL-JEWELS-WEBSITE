const allowed = [
  'name','slug','description','shortDescription','sku','category','subcategory','tags',
  'metal','variants','images','stone','occasion','certifications','careInstructions',
  'isFeatured','isNewArrival','isActive','seo','productType','comboItems',
  'labelName','branchLocation','groupName','varietyName','netWeight','grossWeight',
  'pieces','labourRate','labourPercent','todaysRate','jewelType','categoryName',
  'serviceablePincodes','studdedDetails','priceBreakup'
];
export function productInput(body, partial = false) {
  const data = Object.fromEntries(allowed.filter(key => Object.hasOwn(body, key)).map(key => [key, body[key]]));
  const fail = message => { const error = new Error(message); error.status = 400; throw error; };

  // Normalize serviceablePincodes
  if (data.serviceablePincodes !== undefined) {
    if (typeof data.serviceablePincodes === 'string') {
      data.serviceablePincodes = data.serviceablePincodes
        .split(',')
        .map(p => p.trim())
        .filter(p => /^[0-9]{6}$/.test(p));
    } else if (Array.isArray(data.serviceablePincodes)) {
      data.serviceablePincodes = data.serviceablePincodes
        .map(p => String(p).trim())
        .filter(p => /^[0-9]{6}$/.test(p));
    }
  }

  // Numerical sanitizations for jewelry specifications
  if (data.netWeight !== undefined) data.netWeight = Number(data.netWeight) || 0;
  if (data.grossWeight !== undefined) data.grossWeight = Number(data.grossWeight) || 0;
  if (data.pieces !== undefined) data.pieces = Number(data.pieces) || 1;
  if (data.labourRate !== undefined) data.labourRate = Number(data.labourRate) || 0;
  if (data.labourPercent !== undefined) data.labourPercent = Number(data.labourPercent) || 0;
  if (data.todaysRate !== undefined) data.todaysRate = Number(data.todaysRate) || 0;

  for (const key of ['name','description','category']) {
    if ((!partial || key in data) && (typeof data[key] !== 'string' || !data[key].trim())) fail(`${key} is required.`);
  }
  for (const key of ['isActive','isFeatured','isNewArrival']) if (key in data && typeof data[key] !== 'boolean') fail(`Invalid ${key}.`);
  if (data.slug !== undefined && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) fail('Use lowercase letters, numbers and hyphens for the URL.');
  if (!partial || data.variants !== undefined) {
    if (!Array.isArray(data.variants) || !data.variants.length || data.variants.length > 100) fail('Add between 1 and 100 variants.');
    const skus = new Set();
    data.variants.forEach(v => {
      if (!v.sku?.trim() || skus.has(v.sku.trim())) fail('Each variant needs a unique SKU.');
      skus.add(v.sku.trim());
      if (!Number.isFinite(v.price) || v.price <= 0) fail('Variant price must be greater than zero.');
      if (!Number.isInteger(v.stock) || v.stock < 0) fail('Stock must be a whole number, zero or more.');
      if (v.discountPrice != null && (!Number.isFinite(v.discountPrice) || v.discountPrice <= 0 || v.discountPrice > v.price)) fail('Sale price must be greater than zero and no higher than the regular price.');
      if (v.weight != null && (!Number.isFinite(v.weight) || v.weight < 0)) fail('Weight cannot be negative.');
    });
    if (data.variants.filter(v => v.isDefault).length > 1) fail('Choose only one default variant.');
  }
  if (!partial || data.images !== undefined) {
    if (!Array.isArray(data.images) || !data.images.length || data.images.length > 20) fail('Add between 1 and 20 images.');
    if (data.images.some(i => typeof i.url !== 'string' || !/^https?:\/\//.test(i.url))) fail('Images need a valid HTTP or HTTPS URL.');
  }
  if (data.productType !== undefined && !['single','combo'].includes(data.productType)) fail('Choose single product or combo.');
  if (data.productType === 'combo' || data.comboItems !== undefined) {
    if (!Array.isArray(data.comboItems) || data.comboItems.length > 20 || (data.productType === 'combo' && !data.comboItems.length)) fail('Select the products included in this combo.');
    if (data.comboItems.some(i => !i.product || !Number.isInteger(i.quantity) || i.quantity < 1)) fail('Each combo item needs a product and quantity.');
  }
  return data;
}
