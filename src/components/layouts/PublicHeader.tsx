import Image from 'next/image';
import Link from 'next/link';

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center border-b bg-white px-6 shadow-sm">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <div className="relative h-10 w-64">
            <Image
              src="/images/header-ache-logo.png"
              alt="Cuidados Pela Vida - A plataforma do Aché Laboratórios"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
        </Link>
      </div>
    </header>
  );
}
