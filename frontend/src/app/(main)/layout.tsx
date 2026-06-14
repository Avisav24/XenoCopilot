import { Sidebar } from '@/components/layout/Sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-canvas">
      <Sidebar />
      <div className="flex-1 overflow-auto flex justify-center pb-20 md:pb-0">
        <main className="w-full max-w-[1400px] bg-canvas relative p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
