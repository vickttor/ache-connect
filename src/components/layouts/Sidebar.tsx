'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, History, Users, Award } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  const menuItems = [
    {
      name: 'Prescrição',
      path: '/prescricao',
      icon: <FileText className="mr-2 h-5 w-5" />,
    },
    {
      name: 'Histórico',
      path: '/historico',
      icon: <History className="mr-2 h-5 w-5" />,
    },
    {
      name: 'Pacientes',
      path: '/pacientes',
      icon: <Users className="mr-2 h-5 w-5" />,
    },
    {
      name: 'AchePoint',
      path: '/achepoint',
      icon: <Award className="mr-2 h-5 w-5" />,
    },
  ];

  return (
    <div className="w-full max-w-[250px] border-r bg-white p-4">
      {menuItems.map((item) => (
        <Link
          key={item.path}
          href={item.path}
          className={`mb-2 flex items-center rounded-md p-3 text-sm font-medium transition-colors ${
            isActive(item.path)
              ? 'bg-pink-50 text-pink-500'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {item.icon}
          {item.name}
        </Link>
      ))}
    </div>
  );
}
