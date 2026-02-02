import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-900 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">RAPEX</h1>
          <p className="text-gray-600 text-center mb-8">E-Commerce & Delivery Platform</p>

          <div className="space-y-4">
            <Link href="/admin/login">
              <button className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition">
                Admin Login
              </button>
            </Link>

            <Link href="/merchant/login">
              <button className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition">
                Merchant Login
              </button>
            </Link>

            <Link href="/rider/login">
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition">
                Rider Login
              </button>
            </Link>

            <Link href="/user/login">
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition">
                User Login
              </button>
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t">
            <p className="text-gray-600 text-sm text-center">
              Don't have an account? Create one with any role during registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
