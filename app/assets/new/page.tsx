'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function NewAssetPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    asset_tag: '',
    name: '',
    category: '',
    serial_number: '',
    location: '',
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    const { error, data } = await supabase
      .from('assets')
      .insert([
        {
          asset_tag: form.asset_tag,
          name: form.name,
          category: form.category,
          serial_number: form.serial_number,
          location: form.location,
          status: 'available',
        },
      ])
      .select()
      .single();

    setSaving(false);

    if (error) {
      console.error(error);
      setErrorMsg(error.message);
      return;
    }

    router.push(`/assets/${data.id}`);
  }

  return (
    <main className="p-6 max-w-xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Add Asset</h1>
        <p className="text-sm text-gray-500">
          Register a new device / tool / vehicle.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl border p-4 space-y-4"
      >
        <Field
          label="Asset Tag *"
          placeholder="LAP-023"
          value={form.asset_tag}
          onChange={(v) => setForm({ ...form, asset_tag: v })}
          required
        />

        <Field
          label="Name *"
          placeholder="MacBook Pro 14 M3"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          required
        />

        <Field
          label="Category"
          placeholder="laptop / phone / vehicle / tool"
          value={form.category}
          onChange={(v) => setForm({ ...form, category: v })}
        />

        <Field
          label="Serial Number"
          placeholder="C02XYZ123ABC"
          value={form.serial_number}
          onChange={(v) => setForm({ ...form, serial_number: v })}
        />

        <Field
          label="Location"
          placeholder="Dubai HQ Store Room"
          value={form.location}
          onChange={(v) => setForm({ ...form, location: v })}
        />

        {errorMsg && (
          <div className="text-sm text-red-600 border border-red-300 bg-red-50 rounded-lg p-2">
            {errorMsg}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-black text-white py-2 text-sm font-semibold hover:opacity-80 disabled:opacity-40"
        >
          {saving ? 'Saving...' : 'Save Asset'}
        </button>
      </form>
    </main>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  required,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <div className="text-gray-700 font-medium mb-1">{label}</div>
      <input
        className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
