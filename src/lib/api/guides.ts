import { supabase } from '../supabase';
import type { SaveResult } from './moneyProfile';

/** OP23 to OP25. */
export interface GuideSummary {
  slug: string;
  title: string;
  summary: string;
  icon: string;
  done: number;
  total: number;
}

export interface GuideItem {
  id: string;
  text: string;
  ticked: boolean;
}

export interface GuideDetail {
  slug: string;
  title: string;
  body: string;
  items: GuideItem[];
}

export async function listGuides(): Promise<GuideSummary[] | null> {
  const [guides, items, ticks] = await Promise.all([
    supabase.from('guides').select('id, slug, title, summary, icon').order('sort_order'),
    supabase.from('checklist_items').select('id, guide_id'),
    supabase.from('checklist_ticks').select('item_id'),
  ]);
  if (guides.error || items.error || ticks.error) return null;
  const ticked = new Set(ticks.data.map((t) => t.item_id));
  return guides.data.map((guide) => {
    const own = items.data.filter((item) => item.guide_id === guide.id);
    return {
      slug: guide.slug,
      title: guide.title,
      summary: guide.summary,
      icon: guide.icon,
      total: own.length,
      done: own.filter((item) => ticked.has(item.id)).length,
    };
  });
}

export async function getGuide(slug: string): Promise<GuideDetail | null> {
  const guide = await supabase.from('guides').select('id, slug, title, body').eq('slug', slug).single();
  if (guide.error) return null;
  const [items, ticks] = await Promise.all([
    supabase.from('checklist_items').select('id, text').eq('guide_id', guide.data.id).order('sort_order'),
    supabase.from('checklist_ticks').select('item_id'),
  ]);
  if (items.error || ticks.error) return null;
  const ticked = new Set(ticks.data.map((t) => t.item_id));
  return {
    slug: guide.data.slug,
    title: guide.data.title,
    body: guide.data.body,
    items: items.data.map((item) => ({ id: item.id, text: item.text, ticked: ticked.has(item.id) })),
  };
}

export async function setTick(itemId: string, ticked: boolean): Promise<SaveResult> {
  const { error } = ticked
    ? await supabase.from('checklist_ticks').insert({ item_id: itemId })
    : await supabase.from('checklist_ticks').delete().eq('item_id', itemId);
  return error ? { ok: false, error: "We couldn't save that tick. Try again." } : { ok: true };
}
