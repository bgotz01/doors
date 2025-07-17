import Link from "next/link";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function getSuppliers() {
  try {
    const suppliers = await prisma.supplier.findMany({
      orderBy: [{ location: "asc" }, { name: "asc" }],
    });

    return suppliers;
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return [];
  }
}

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  // Group suppliers by location
  const suppliersByLocation: Record<string, typeof suppliers> = {};

  suppliers.forEach((supplier) => {
    const location = supplier.location || "Unknown Location";
    if (!suppliersByLocation[location]) {
      suppliersByLocation[location] = [];
    }
    suppliersByLocation[location].push(supplier);
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Door Suppliers
          </h1>
          <p className="text-lg text-gray-600">Browse suppliers by location</p>
        </div>

        {Object.entries(suppliersByLocation).map(
          ([location, locationSuppliers]) => (
            <div key={location} className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-2">
                {location}
              </h2>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {locationSuppliers.map((supplier) => (
                  <Link
                    key={supplier.id}
                    href={`/suppliers/${supplier.id}`}
                    className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                  >
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {supplier.name}
                    </h3>

                    <div className="flex justify-between items-end mt-4">
                      <div className="text-sm text-gray-500">
                        {supplier.location}
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        View Details
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        )}

        {suppliers.length === 0 && (
          <div className="bg-white p-8 rounded-lg shadow-md text-center">
            <p className="text-gray-500 text-lg">No suppliers found</p>
          </div>
        )}
      </div>
    </div>
  );
}
