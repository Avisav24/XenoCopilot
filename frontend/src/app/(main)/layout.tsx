import { Sidebar } from '@/components/layout/Sidebar';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-canvas">
      <Sidebar />
      <div className="flex-1 flex justify-center pt-14 md:pt-0 pb-[68px] md:pb-0">
        <main className="w-full max-w-[1400px] bg-canvas relative">
          {children}
        </main>
      </div>
    </div>
  );
}
