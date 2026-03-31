import { supabase, isSupabaseReady } from "./supabase.js";

async function keywordSearch(query, limit = 5) {
  if (!isSupabaseReady()) return [];
  const searchTerm = `%${query}%`;
  const { data, error } = await supabase
    .from("products")
    .select("id, sku, name, category, subcategory, short_description, long_description, base_price, weight_capacity_lbs, material, width_inches, depth_inches, height_inches, height_min_inches, height_max_inches, product_url")
    .or(`name.ilike.${searchTerm},short_description.ilike.${searchTerm},category.ilike.${searchTerm},long_description.ilike.${searchTerm}`)
    .eq("is_active", true)
    .limit(limit);
  if (error) { console.error("Keyword search error:", error); return []; }
  return data || [];
}

async function getProductSpecs(productId) {
  if (!isSupabaseReady()) return [];
  const { data, error } = await supabase
    .from("product_specs")
    .select("spec_name, spec_value, spec_unit, spec_group")
    .eq("product_id", productId)
    .order("spec_group").order("sort_order");
  if (error) { console.error("Specs error:", error); return []; }
  return data || [];
}

async function getCompatibility(productId) {
  if (!isSupabaseReady()) return [];
  const { data, error } = await supabase
    .from("compatibility")
    .select("compatibility_type, notes, compatible_product:compatible_product_id (id, name, sku, short_description)")
    .eq("product_id", productId);
  if (error) { console.error("Compat error:", error); return []; }
  return data || [];
}

async function getDocuments(productId) {
  if (!isSupabaseReady()) return [];
  const { data, error } = await supabase
    .from("documents")
    .select("doc_type, title, file_url, content_text")
    .eq("product_id", productId);
  if (error) { console.error("Docs error:", error); return []; }
  return data || [];
}

async function searchFAQs(query, limit = 3) {
  if (!isSupabaseReady()) return [];
  const searchTerm = `%${query}%`;
  const { data, error } = await supabase
    .from("faqs")
    .select("question, answer, category")
    .or(`question.ilike.${searchTerm},answer.ilike.${searchTerm}`)
    .limit(limit);
  if (error) { console.error("FAQ error:", error); return []; }
  return data || [];
}

export async function searchForContext(query) {
  if (!isSupabaseReady()) return null;
  try {
    const [products, faqs] = await Promise.all([keywordSearch(query), searchFAQs(query)]);
    const enrichedProducts = await Promise.all(
      products.slice(0, 3).map(async (product) => {
        const [specs, compatibility, documents] = await Promise.all([
          getProductSpecs(product.id), getCompatibility(product.id), getDocuments(product.id),
        ]);
        return { ...product, specs, compatibility, documents };
      })
    );
    return formatContext(enrichedProducts, faqs);
  } catch (error) { console.error("Search error:", error); return null; }
}

function formatContext(products, faqs) {
  const parts = [];
  if (products.length > 0) {
    parts.push("## Relevant products\n");
    for (const p of products) {
      parts.push(`### ${p.name} (SKU: ${p.sku || "N/A"})`);
      parts.push(`Category: ${p.category || "N/A"} / ${p.subcategory || "N/A"}`);
      if (p.short_description) parts.push(`Description: ${p.short_description}`);
      if (p.base_price) parts.push(`Base price: $${p.base_price}`);
      const dims = [];
      if (p.width_inches) dims.push(`W: ${p.width_inches}"`);
      if (p.depth_inches) dims.push(`D: ${p.depth_inches}"`);
      if (p.height_inches) dims.push(`H: ${p.height_inches}"`);
      if (dims.length) parts.push(`Dimensions: ${dims.join(" x ")}`);
      if (p.height_min_inches && p.height_max_inches) parts.push(`Adjustable height: ${p.height_min_inches}" to ${p.height_max_inches}"`);
      if (p.weight_capacity_lbs) parts.push(`Weight capacity: ${p.weight_capacity_lbs} lbs`);
      if (p.material) parts.push(`Material: ${p.material}`);
      if (p.product_url) parts.push(`Product page: ${p.product_url}`);
      if (p.specs?.length > 0) {
        parts.push("\nSpecifications:");
        for (const s of p.specs) parts.push(`  - ${s.spec_name}: ${s.spec_value}${s.spec_unit ? " " + s.spec_unit : ""}`);
      }
      if (p.compatibility?.length > 0) {
        parts.push("\nCompatible accessories/options:");
        for (const c of p.compatibility) parts.push(`  - ${c.compatible_product.name} (${c.compatibility_type})${c.notes ? " - " + c.notes : ""}`);
      }
      if (p.documents?.length > 0) {
        parts.push("\nAvailable documents:");
        for (const d of p.documents) parts.push(`  - ${d.title} (${d.doc_type})${d.file_url ? " - " + d.file_url : ""}`);
      }
      parts.push("");
    }
  }
  if (faqs.length > 0) {
    parts.push("## Relevant FAQs\n");
    for (const faq of faqs) { parts.push(`Q: ${faq.question}`); parts.push(`A: ${faq.answer}\n`); }
  }
  return parts.length > 0 ? parts.join("\n") : null;
}
