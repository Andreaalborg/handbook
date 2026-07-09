import Link from 'next/link'
import Image from 'next/image'

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="inline-block">
            <Image
              src="/imem-logo.webp"
              alt="IMEM Lifts"
              width={851}
              height={198}
              priority
              className="h-12 w-auto"
            />
          </Link>
          <p className="mt-2 text-sm text-gray-500">Ansattportal</p>
        </div>

        <div className="card p-8">
          <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          <div className="mt-6">{children}</div>
        </div>

        {footer && (
          <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>
        )}
      </div>
    </div>
  )
}
