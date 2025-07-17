import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface DoorDetailProps {
  params: {
    id: string;
  };
}

async function getDoor(id: string) {
  try {
    const door = await prisma.door.findUnique({
      where: { id },
      include: {
        subcategory: {
          include: {
            category: true,
          },
        },
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
    return door;
  } catch (error) {
    console.error("Error fetching door:", error);
    return null;
  }
}

function getImagePath(door: {
  categoryName: string;
  material: string;
  height: string;
  name: string;
}) {
  const category = door.categoryName.toLowerCase();
  const material = door.material;
  const height = door.height;
  const doorName = door.name;

  return `/images/doors/${category}/${material}/${height}/${doorName}.png`;
}

export default async function DoorDetailPage({ params }: DoorDetailProps) {
  const door = await getDoor(params.id);

  if (!door) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <span>/</span>
            <Link href="/doors" className="hover:text-blue-600">
              Doors
            </Link>
            <span>/</span>
            <span className="text-gray-900">{door.name}</span>
          </div>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="aspect-[3/4] bg-white rounded-lg shadow-md overflow-hidden relative">
              <Image
                src={getImagePath(door)}
                alt={`${door.name} door`}
                fill
                className="object-contain p-4"
                priority
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {door.name}
              </h1>
              <p className="text-lg text-gray-600">
                {door.categoryName} • {door.subcategoryName} • {door.height}
              </p>
            </div>

            {/* Pricing */}
            {door.basePrice && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-2xl font-bold text-green-700">
                  Starting at ${door.basePrice}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Price varies by size and customization options
                </p>
              </div>
            )}

            {/* Available Sizes */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Available Sizes
              </h3>
              <div className="flex flex-wrap gap-2">
                {door.widths.map((width) => (
                  <span
                    key={width}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {width}
                  </span>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Features
              </h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Premium {door.categoryName.toLowerCase()} construction
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Multiple size options available
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Professional installation available
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                  Customizable finish options
                </li>
              </ul>
            </div>

            {/* Size Selection and Quote */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Get Your Quote
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Size
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Choose a size</option>
                    {door.widths.map((width) => (
                      <option key={width} value={width}>
                        {width}&quot; width
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min="1"
                    defaultValue="1"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex space-x-3">
                  <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-colors">
                    Add to Quote
                  </button>
                  <button className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-md font-semibold hover:bg-gray-200 transition-colors">
                    Contact Us
                  </button>
                </div>
              </div>
            </div>

            {/* Back to Browse */}
            <div className="pt-4">
              <Link
                href="/doors"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                ← Back to Door Collection
              </Link>
            </div>
          </div>
        </div>

        {/* Related Doors */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            More from {door.subcategoryName}
          </h2>
          <div className="text-gray-600">
            <Link
              href="/doors"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Browse all doors in this collection →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
