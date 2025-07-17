import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-lg border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl font-bold text-gray-800 hover:text-blue-600"
            >
              CustomDoors
            </Link>
          </div>

          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Home
            </Link>
            <Link
              href="/quote"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Get Quote
            </Link>
            <Link
              href="/gallery"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Gallery
            </Link>
            <Link
              href="/contact"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
            >
              Contact
            </Link>
            <Link
              href="/quote"
              className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
