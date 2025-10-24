'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useParams, useRouter } from 'next/navigation';

type AssetDetail = {
  id: string;
  asset_tag: string;
  name: string;
  category: string | null;
  serial_number: string | null;
  status: string;
  location: string | null;
  employee_name?: string | null;
};

export default function AssetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params?.id as string;

  const [asset, setAsset] = useState<AssetDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAsset() {
      const { data, error } = await supabase
        .from('assets')
        .select(`
          id,
          asset_tag,
          name,
          category,
          serial_number,
          status,
          location,
          employees:assigned_to ( full_name )
        `)
        .eq('id', assetId)
        .single();

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      setAsset({
        id: data.id,
        asset_tag: data.asset_tag,
        name: data.name,
        category: data.category,
        serial_number: data.serial_number,
        status: data.status,
        location: data.location,
        employee_name: data.employees?.full_name ?? null,
      });

      setLoading(false);
    }

    loadAsset();
  }, [assetId]);

  async function markAvailable() {
    if (!asset) return;
    const { error } = await supabase
      .from('assets')
      .update({
        status: 'available',
        assigned_to: null,
        assigned_at: null,
        last_checkin: new Date().toISOString(),
      })
      .eq('id', asset.id);

    if (!error) router.refresh();
  }

  async function markInUse() {
    if (!asset) return;
    // MVP: we don't pick employee here yet. We just flag it in_use.
    const { error } = await supabase
      .from('assets')
      .update({
        status: 'in_use',
        last_checkout: new Date().toISOString(),
      })
      .eq('id', asset.id);

    if (!error) router.refresh();
  }

  return (
    <main className="p-6 space-y-6 max-w-2xl">
      {loading ? (
        <div className="text-gray-500 text-sm">Loading asset...</div>
      ) : !asset ? (
        <div className="text-red-600 text-sm">Asset not found.</div>
      ) : (
        <>
          <header className="flex items-start justify-between">
            <div>
              <div className="text-xs text-gray-500 font-mono">
                {asset.asset_tag}
              </div>
              <h1 className="text-xl font-semibold">{asset.name}</h1>
              <div className="text-sm text-gray-500">
                {asset.category || '—'}
              </div>
            </div>

            <button
              className="text-sm text-gray-500 hover:text-black"
              onClick={() => router.push('/assets')}
            >
              ← Back
            </button>
          </header>

          <section className="grid gap-4">
            <InfoRow label="Current Holder">
              {asset.employee_name || '— Available —'}
            </InfoRow>

            <InfoRow label="Status">
              <StatusPill status={asset.status} />
            </InfoRow>

            <InfoRow label="Serial Number">
              {asset.serial_number || '—'}
            </InfoRow>

            <InfoRow label="Location">{asset.location || '—'}</InfoRow>
          </section>

          <section className="flex gap-3 pt-4">
            <ActionButton onClick={markInUse}>Mark In Use</ActionButton>
            <ActionButton onClick={markAvailable}>Mark Available</ActionButton>
          </section>

          <section className="pt-8">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              Activity (Coming next)
            </h2>
            <p className="text-xs text-gray-500">
              Assignment / return history will show here from
              <code className="px-1">asset_activity_log</code>.
            </p>
          </section>
        </>
      )}
    </main>
  );
}

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-[11px] uppercase text-gray-400 font-medium tracking-wide">
        {label}
      </div>
      <div className="text-sm font-medium text-gray-800">{children}</div>
    </div>
  );
}

function ActionButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-lg border px-3 py-2 text-sm font-semibold hover:bg-gray-50"
    >
      {children}
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const labelMap: Record<string, string> = {
    in_use: 'In Use',
    available: 'Available',
    maintenance: 'Maintenance',
    lost: 'Lost',
    retired: 'Retired',
  };
  const colorMap: Record<string, string> = {
    in_use: 'bg-blue-100 text-blue-700',
    available: 'bg-green-100 text-green-700',
    maintenance: 'bg-yellow-100 text-yellow-700',
    lost: 'bg-red-100 text-red-700',
    retired: 'bg-gray-200 text-gray-600',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        colorMap[status] || 'bg-gray-100 text-gray-600'
      }`}
    >
      {labelMap[status] || status}
    </span>
  );
}
