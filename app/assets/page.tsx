'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Asset = {
  id: string;
  asset_tag: string;
  name: string;
  category: string | null;
  status: string;
  location: string | null;
  assigned_to: string | null;
  employee_name?: string | null;
};

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    total: 0,
    in_use: 0,
    available: 0,
    maintenance: 0,
  });

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('assets')
        .select(`
          id,
          asset_tag,
          name,
          category,
          status,
          location,
          assigned_to,
          employees:assigned_to ( full_name )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const mapped = (data || []).map((row: any) => ({
        id: row.id,
        asset_tag: row.asset_tag,
        name: row.name,
        category: row.category,
        status: row.status,
        location: row.location,
        assigned_to: row.assigned_to,
        employee_name: row.employees?.full_name ?? null,
      }));

      setAssets(mapped);
      setLoading(false);

      const total = mapped.length;
      const in_use = mapped.filter(a => a.status === 'in_use').length;
      const available = mapped.filter(a => a.status === 'available').length;
      const maintenance = mapped.filter(a => a.status === 'maintenance').length;

      setStats({ total, in_use, available, maintenance });
    }
    load();
  }, []);

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Assets</h1>
          <p className="text-sm text-gray-500">
            Track devices, tools, vehicles and who is holding them.
          </p>
        </div>

        <a
          href="/assets/new"
          className="px-3 py-2 rounded-lg bg-black text-white text-sm font-medium hover:opacity-80"
        >
          + Add Asset
        </a>
      </header>

      {/* Stats cards */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="In Use" value={stats.in_use} />
        <StatCard label="Available" value={stats.available} />
        <StatCard label="Maintenance" value={stats.maintenance} />
      </section>

      {/* Table */}
      <section className="bg-white rounded-xl border">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600 text-xs uppercase">
              <tr>
                <Th>Tag</Th>
                <Th>Asset</Th>
                <Th>Category</Th>
                <Th>Holder</Th>
                <Th>Status</Th>
                <Th>Location</Th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : assets.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400">
                    No assets yet. Add your first one.
                  </td>
                </tr>
              ) : (
                assets.map((a) => (
                  <tr
                    key={a.id}
                    className="border-t hover:bg-gray-50 cursor-pointer"
                    onClick={() => (window.location.href = `/assets/${a.id}`)}
                  >
                    <Td className="font-mono">{a.asset_tag}</Td>
                    <Td className="font-medium">{a.name}</Td>
                    <Td>{a.category || '-'}</Td>
                    <Td>{a.employee_name || '— Available —'}</Td>
                    <Td>
                      <StatusPill status={a.status} />
                    </Td>
                    <Td>{a.location || '-'}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 font-medium">{children}</th>;
}

function Td({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
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
