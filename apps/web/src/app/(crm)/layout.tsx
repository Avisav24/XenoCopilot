import { Sidebar } from '@/components/layout/Sidebar';

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-canvas">
      <Sidebar />
      <div className="flex-1 overflow-auto flex justify-center">
        <main className="w-full max-w-[1440px] bg-canvas relative p-[48px]">
          {children}
        </main>
      </div>
    </div>
  );
}
