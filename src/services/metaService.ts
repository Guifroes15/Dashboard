const BASE  = 'https://graph.facebook.com/v21.0';
const TOKEN = import.meta.env.VITE_META_ACCESS_TOKEN as string;

export type DatePreset = 'last_7d' | 'last_30d' | 'this_month' | 'last_month';

export interface MetaInsights {
  spend:         number;
  reach:         number;
  impressions:   number;
  clicks:        number;
  mensagens:     number;
  custoMensagem: number;
  likes:         number;
  dateStart:     string;
  dateStop:      string;
}

export interface MetaDailyInsight {
  date:      string;
  spend:     number;
  reach:     number;
  mensagens: number;
}

export interface MetaCampaign {
  id:          string;
  name:        string;
  status:      string;
  spend:       number;
  reach:       number;
  impressions: number;
  mensagens:   number;
  custoMensagem: number;
}

function action(actions: { action_type: string; value: string }[] | undefined, type: string): number {
  return parseFloat(actions?.find(a => a.action_type === type)?.value ?? '0');
}

function costPer(list: { action_type: string; value: string }[] | undefined, type: string): number {
  return parseFloat(list?.find(a => a.action_type === type)?.value ?? '0');
}

async function apiFetch(url: string) {
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json;
}

export async function getAccountInsights(
  adAccountId: string,
  datePreset: DatePreset
): Promise<MetaInsights | null> {
  const fields = 'spend,reach,impressions,clicks,actions,cost_per_action_type';
  const url = `${BASE}/${adAccountId}/insights?fields=${fields}&date_preset=${datePreset}&access_token=${TOKEN}`;
  const json = await apiFetch(url);
  const d = json.data?.[0];
  if (!d) return null;

  return {
    spend:         parseFloat(d.spend  ?? '0'),
    reach:         parseInt(d.reach    ?? '0'),
    impressions:   parseInt(d.impressions ?? '0'),
    clicks:        parseInt(d.clicks   ?? '0'),
    mensagens:     action(d.actions, 'onsite_conversion.messaging_conversation_started_7d'),
    custoMensagem: costPer(d.cost_per_action_type, 'onsite_conversion.messaging_conversation_started_7d'),
    likes:         action(d.actions, 'like'),
    dateStart:     d.date_start,
    dateStop:      d.date_stop,
  };
}

export async function getAccountTimeSeries(
  adAccountId: string,
  datePreset: DatePreset
): Promise<MetaDailyInsight[]> {
  const url = `${BASE}/${adAccountId}/insights?fields=spend,reach,actions&date_preset=${datePreset}&time_increment=1&access_token=${TOKEN}`;
  const json = await apiFetch(url);
  return (json.data ?? []).map((d: any) => ({
    date:      d.date_start,
    spend:     parseFloat(d.spend ?? '0'),
    reach:     parseInt(d.reach  ?? '0'),
    mensagens: action(d.actions, 'onsite_conversion.messaging_conversation_started_7d'),
  }));
}

export async function getCampaigns(
  adAccountId: string,
  datePreset: DatePreset
): Promise<MetaCampaign[]> {
  const insFields = `spend,reach,impressions,actions,cost_per_action_type`;
  const fields = `id,name,effective_status,insights.date_preset(${datePreset}){${insFields}}`;
  const url = `${BASE}/${adAccountId}/campaigns?fields=${encodeURIComponent(fields)}&limit=20&access_token=${TOKEN}`;
  const json = await apiFetch(url);

  return (json.data ?? []).map((c: any) => {
    const ins = c.insights?.data?.[0];
    return {
      id:            c.id,
      name:          c.name,
      status:        c.effective_status,
      spend:         parseFloat(ins?.spend ?? '0'),
      reach:         parseInt(ins?.reach   ?? '0'),
      impressions:   parseInt(ins?.impressions ?? '0'),
      mensagens:     action(ins?.actions, 'onsite_conversion.messaging_conversation_started_7d'),
      custoMensagem: costPer(ins?.cost_per_action_type, 'onsite_conversion.messaging_conversation_started_7d'),
    };
  });
}
