import { useEffect, useState } from 'react';
import { apiRequest } from '../../api/apiClient';
import { toast } from 'react-hot-toast';
import { Zap, Trash2, PlusCircle } from 'lucide-react';

const AREAS = [
  { name: 'Thamel',          lat: 27.7154, lng: 85.3123 },
  { name: 'New Road',        lat: 27.7006, lng: 85.3139 },
  { name: 'Ratnapark',       lat: 27.7040, lng: 85.3157 },
  { name: 'Koteshwor',       lat: 27.6807, lng: 85.3468 },
  { name: 'Kalanki',         lat: 27.6939, lng: 85.2823 },
  { name: 'Lazimpat',        lat: 27.7215, lng: 85.3186 },
  { name: 'Maharajgunj',     lat: 27.7333, lng: 85.3281 },
  { name: 'Patan (Lalitpur)',lat: 27.6588, lng: 85.3247 },
  { name: 'Bhaktapur',       lat: 27.6722, lng: 85.4277 },
];

const MULTIPLIERS = [1.2, 1.3, 1.5, 1.7, 2.0, 2.5, 3.0];

const DURATIONS = [
  { label: '30 minutes', minutes: 30 },
  { label: '1 hour',     minutes: 60 },
  { label: '2 hours',    minutes: 120 },
  { label: '4 hours',    minutes: 240 },
  { label: '8 hours',    minutes: 480 },
  { label: '24 hours',   minutes: 1440 },
];

function SurgeCard({ surge, onEnd }) {
  const endsAt = new Date(surge.ends_at);
  const minutesLeft = Math.max(0, Math.round((endsAt - Date.now()) / 60000));

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center">
          <Zap size={18} className="text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-bold text-gray-900">{surge.area_name}</p>
            <span className="bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {surge.multiplier}×
            </span>
          </div>
          {surge.reason && <p className="text-xs text-gray-500 mt-0.5">{surge.reason}</p>}
          <p className="text-xs text-gray-400 mt-1">
            {surge.radius_km}km radius · {minutesLeft}min remaining
          </p>
        </div>
      </div>
      <button
        onClick={() => onEnd(surge.id)}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        title="End surge early"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default function AdminSurge() {
  const [surges,  setSurges]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState({
    area_name:   '',
    lat:         '',
    lng:         '',
    radius_km:   2,
    multiplier:  1.5,
    reason:      '',
    duration:    60,
    custom:      false,
  });
  const [saving, setSaving] = useState(false);

  async function loadSurges() {
    setLoading(true);
    try {
      const res = await apiRequest('/api/admin/surge');
      setSurges(res?.data ?? []);
    } catch { toast.error('Failed to load surges'); }
    setLoading(false);
  }

  useEffect(() => { loadSurges(); }, []);

  function selectPreset(area) {
    setForm(f => ({ ...f, area_name: area.name, lat: area.lat, lng: area.lng, custom: false }));
  }

  async function createSurge(e) {
    e.preventDefault();
    if (!form.area_name || !form.lat || !form.lng) return toast.error('Fill all required fields');
    setSaving(true);
    try {
      const ends_at = new Date(Date.now() + form.duration * 60_000).toISOString();
      await apiRequest('/api/admin/surge', {
        method: 'POST',
        body: JSON.stringify({
          area_name:  form.area_name,
          lat:        parseFloat(form.lat),
          lng:        parseFloat(form.lng),
          radius_km:  parseFloat(form.radius_km),
          multiplier: parseFloat(form.multiplier),
          reason:     form.reason || null,
          ends_at,
        }),
      });
      toast.success(`⚡ Surge ${form.multiplier}× activated for ${form.area_name}`);
      setForm(f => ({ ...f, area_name: '', reason: '' }));
      await loadSurges();
    } catch (err) {
      toast.error(err?.message || 'Failed to create surge');
    }
    setSaving(false);
  }

  async function endSurge(id) {
    try {
      await apiRequest(`/api/admin/surge/${id}`, { method: 'DELETE' });
      toast.success('Surge ended');
      setSurges(s => s.filter(x => x.id !== id));
    } catch { toast.error('Failed to end surge'); }
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Surge Pricing</h1>
        <p className="text-sm text-gray-400">Apply demand multipliers to specific areas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Create form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PlusCircle size={18} className="text-indigo-600" /> Create Surge Zone
          </h2>

          <form onSubmit={createSurge} className="flex flex-col gap-3">
            {/* Area presets */}
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Quick Areas</label>
              <div className="flex flex-wrap gap-1.5">
                {AREAS.map(a => (
                  <button
                    key={a.name} type="button"
                    onClick={() => selectPreset(a)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                      form.area_name === a.name
                        ? 'bg-indigo-600 text-white border-indigo-600'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {a.name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, custom: true, area_name: '', lat: '', lng: '' }))}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium border border-dashed border-gray-300 text-gray-400 hover:bg-gray-50"
                >
                  Custom…
                </button>
              </div>
            </div>

            {form.custom && (
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-3">
                  <input
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    placeholder="Area name *"
                    value={form.area_name}
                    onChange={e => setForm(f => ({ ...f, area_name: e.target.value }))}
                    required
                  />
                </div>
                <input
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Lat *" type="number" step="0.0001"
                  value={form.lat}
                  onChange={e => setForm(f => ({ ...f, lat: e.target.value }))}
                  required
                />
                <input
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Lng *" type="number" step="0.0001"
                  value={form.lng}
                  onChange={e => setForm(f => ({ ...f, lng: e.target.value }))}
                  required
                />
                <input
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  placeholder="Radius km" type="number" min="0.5" max="20" step="0.5"
                  value={form.radius_km}
                  onChange={e => setForm(f => ({ ...f, radius_km: e.target.value }))}
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Multiplier</label>
              <div className="flex gap-2">
                {MULTIPLIERS.map(m => (
                  <button
                    key={m} type="button"
                    onClick={() => setForm(f => ({ ...f, multiplier: m }))}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-bold border transition-colors ${
                      form.multiplier === m
                        ? 'bg-amber-400 text-white border-amber-400'
                        : 'border-gray-200 text-gray-600 hover:bg-amber-50'
                    }`}
                  >
                    {m}×
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Duration</label>
              <select
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                value={form.duration}
                onChange={e => setForm(f => ({ ...f, duration: Number(e.target.value) }))}
              >
                {DURATIONS.map(d => <option key={d.minutes} value={d.minutes}>{d.label}</option>)}
              </select>
            </div>

            <input
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="Reason (optional — shown to riders)"
              value={form.reason}
              onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
            />

            <button
              type="submit"
              disabled={saving || !form.area_name}
              className="bg-amber-400 hover:bg-amber-500 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Zap size={16} />
              {saving ? 'Activating…' : `Activate ${form.multiplier}× Surge`}
            </button>
          </form>
        </div>

        {/* Active surges */}
        <div>
          <h2 className="font-bold text-gray-900 mb-4">
            Active Surge Zones
            {surges.length > 0 && (
              <span className="ml-2 bg-amber-400 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {surges.length}
              </span>
            )}
          </h2>
          {loading && <p className="text-sm text-gray-400">Loading…</p>}
          {!loading && surges.length === 0 && (
            <div className="bg-gray-50 rounded-2xl p-8 text-center">
              <Zap size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No active surges</p>
            </div>
          )}
          <div className="flex flex-col gap-3">
            {surges.map(s => <SurgeCard key={s.id} surge={s} onEnd={endSurge} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
