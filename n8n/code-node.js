// ===== CONFIG =====
const PROMPT_PAGE_ID = '32eb85ab6efc81098ebeeadfca7afbf9';
const ANTHROPIC_API_KEY = 'REMPLACER_PAR_CLE_ANTHROPIC';
const NOTION_API_KEY = 'REMPLACER_PAR_CLE_NOTION';

// ===== HELPERS =====
function extractRichText(prop) {
  return (prop?.rich_text ?? []).map(rt => rt.plain_text).join('');
}
function toRichText(text) {
  if (!text) return [];
  return [{ text: { content: text } }];
}

// ===== 1. LIRE LE PROMPT DEPUIS NOTION =====
const blocksResponse = await this.helpers.request({
  method: 'GET',
  url: `https://api.notion.com/v1/blocks/${PROMPT_PAGE_ID}/children?page_size=100`,
  headers: { 'Authorization': `Bearer ${NOTION_API_KEY}`, 'Notion-Version': '2022-06-28' },
  json: true,
});

const systemPrompt = blocksResponse.results
  .map(block => {
    if (block.type === 'paragraph')
      return block.paragraph.rich_text.map(rt => rt.plain_text).join('');
    if (block.type === 'heading_1')
      return '# ' + block.heading_1.rich_text.map(rt => rt.plain_text).join('');
    if (block.type === 'heading_2')
      return '## ' + block.heading_2.rich_text.map(rt => rt.plain_text).join('');
    if (block.type === 'heading_3')
      return '### ' + block.heading_3.rich_text.map(rt => rt.plain_text).join('');
    if (block.type === 'bulleted_list_item')
      return '- ' + block.bulleted_list_item.rich_text.map(rt => rt.plain_text).join('');
    if (block.type === 'code')
      return '```\n' + block.code.rich_text.map(rt => rt.plain_text).join('') + '\n```';
    if (block.type === 'divider') return '---';
    return '';
  })
  .filter(Boolean)
  .join('\n');

// ===== 2. EXTRAIRE LES INPUTS =====
const page = $input.first().json;
const pageId = page.id;
const nom = page.properties.Nom?.title?.[0]?.plain_text || 'Sans nom';
const fonctionnalites = extractRichText(page.properties['Listing des fonctionnalit\u00e9s']);
const bugs = extractRichText(page.properties['R\u00e9solution de Bugs']);

const userMessage = 'Voici les inputs pour cette release :\n\n## Listing des fonctionnalites\n' + (fonctionnalites || '(aucune fonctionnalite listee)') + '\n\n## Resolution de bugs\n' + (bugs || '(aucun bug corrige)') + '\n\nGenere le contenu "Quoi de neuf" au format JSON demande.';

// ===== 3. APPEL CLAUDE =====
const claudeData = await this.helpers.request({
  method: 'POST',
  url: 'https://api.anthropic.com/v1/messages',
  headers: {
    'x-api-key': ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
    'Content-Type': 'application/json',
  },
  body: {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  },
  json: true,
});

const responseText = claudeData.content
  .filter(b => b.type === 'text')
  .map(b => b.text)
  .join('');

const jsonMatch = responseText.match(/\{[\s\S]*\}/);
if (!jsonMatch) throw new Error('Claude n\'a pas retourne de JSON valide pour "' + nom + '"');
const parsed = JSON.parse(jsonMatch[0]);
if (typeof parsed.titre !== 'string' || !parsed.titre.trim()) {
  throw new Error('Champ "titre" manquant pour "' + nom + '"');
}

const content = {
  titre: parsed.titre.slice(0, 500),
  description: (parsed.description ?? '').slice(0, 2000),
  corrections: (parsed.corrections ?? '').slice(0, 2000),
  tags: (Array.isArray(parsed.tags) ? parsed.tags : []).filter(t => typeof t === 'string').slice(0, 10),
  cta_texte: (parsed.cta_texte ?? '').slice(0, 200),
  cta_lien: (parsed.cta_lien ?? '').slice(0, 500),
};

// ===== 4. ECRIRE DANS NOTION =====
await this.helpers.request({
  method: 'PATCH',
  url: 'https://api.notion.com/v1/pages/' + pageId,
  headers: {
    'Authorization': 'Bearer ' + NOTION_API_KEY,
    'Notion-Version': '2022-06-28',
    'Content-Type': 'application/json',
  },
  body: {
    properties: {
      'Titre Quoi de neuf': { rich_text: toRichText(content.titre) },
      'Description Quoi de neuf': { rich_text: toRichText(content.description) },
      'Corrections Quoi de neuf': { rich_text: toRichText(content.corrections) },
      'Tags Quoi de neuf': { multi_select: content.tags.map(tag => ({ name: tag })) },
      'CTA Texte': { rich_text: toRichText(content.cta_texte) },
      'CTA Lien': { url: content.cta_lien && /^https?:\/\//.test(content.cta_lien) ? content.cta_lien : null },
      'Statut Quoi de neuf': { select: { name: 'Draft' } },
    },
  },
  json: true,
});

return [{ json: { pageId, nom, status: 'generated', content } }];
