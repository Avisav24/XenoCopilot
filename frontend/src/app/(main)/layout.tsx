import { Sidebar } from '@/components/layout/Sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-canvas">
      <Sidebar />
      <div className="flex-1 h-screen overflow-hidden flex flex-col bg-canvas">
        <main className="flex-1 overflow-y-auto w-full relative">
          {children}
        </main>
      </div>
    </div>
  );
}
