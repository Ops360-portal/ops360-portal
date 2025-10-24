export const dynamic = 'force-dynamic'; // or: export const revalidate = 0

// or: export const revalidate = 0;

import Dashboard from './(dashboard)/page';

export default function Home() {
  return <Dashboard />;
}
