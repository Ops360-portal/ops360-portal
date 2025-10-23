export const dynamic = 'force-dynamic'; // don't try to prerender at build
// or: export const revalidate = 0;

import Dashboard from './(dashboard)/page';

export default function Home() {
  return <Dashboard />;
}
