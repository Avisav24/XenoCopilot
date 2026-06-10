import { Sidebar } from '@/components/Sidebar';

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 overflow-auto bg-canvas relative">
        {children}
      </div>
    </div>
  );
}
