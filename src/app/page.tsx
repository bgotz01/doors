import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Custom Doors Made Perfect
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Get instant quotes for premium custom doors tailored to your space
            </p>
            <Link
              href="/quote"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Get Your Quote Now
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose CustomDoors?
            </h2>
            <p className="text-lg text-gray-600">
              Premium quality, competitive pricing, and expert craftsmanship
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚪</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Custom Design</h3>
              <p className="text-gray-600">
                Every door is crafted to your exact specifications and style
                preferences
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Quotes</h3>
              <p className="text-gray-600">
                Get accurate pricing immediately with our advanced quote
                calculator
              </p>
            </div>

            <div className="text-center p-6">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⭐</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Premium Quality</h3>
              <p className="text-gray-600">
                Using only the finest materials and expert craftsmanship
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of satisfied customers who chose CustomDoors for
            their home
          </p>
          <div className="space-x-4">
            <Link
              href="/quote"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Get Quote
            </Link>
            <Link
              href="/gallery"
              className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              View Gallery
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
