//app/suppliers/[supplier]/page.tsx

import { notFound } from "next/navigation";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface SupplierPageProps {
  params: {
    supplier: string;
  };
}

interface PanelStat {
  material: string;
  collection: string;
  count: number;
}

async function getSupplier(supplierId: string) {
  try {
    const supplier = await prisma.supplier.findUnique({
      where: { id: supplierId },
    });

    return supplier;
  } catch (error) {
    console.error("Error fetching supplier:", error);
    return null;
  }
}

async function getSupplierPanelStats(supplierId: string): Promise<PanelStat[]> {
  try {
    // Get all panels with their material and collection
    const panels = await prisma.supplierPanel.findMany({
      where: {
        supplierId: supplierId,
        isActive: true,
      },
      include: {
        panelModel: {
          select: {
            material: true,
            collection: true,
          },
        },
      },
    });

    // Group panels by material and collection manually
    const stats: Record<string, Record<string, number>> = {};

    panels.forEach((panel) => {
      const material = panel.panelModel.material;
      const collection = panel.panelModel.collection;

      if (!stats[material]) {
        stats[material] = {};
      }

      if (!stats[material][collection]) {
        stats[material][collection] = 0;
      }

      stats[material][collection]++;
    });

    // Convert to array format
    const panelStats = Object.entries(stats).flatMap(
      ([material, collections]) =>
        Object.entries(collections).map(([collection, count]) => ({
          material,
          collection,
          count,
        }))
    );

    // Sort by material and collection
    panelStats.sort((a, b) => {
      if (a.material !== b.material) {
        return a.material.localeCompare(b.material);
      }
      return a.collection.localeCompare(b.collection);
    });

    return panelStats;
  } catch (error) {
    console.error("Error fetching supplier panel stats:", error);
    return [];
  }
}

export default async function SupplierPage({ params }: SupplierPageProps) {
  const supplierId = params.supplier;
  const supplier = await getSupplier(supplierId);

  if (!supplier) {
    notFound();
  }

  const panelStats = await getSupplierPanelStats(supplierId);

  // Count total panels
  const totalPanels = await prisma.supplierPanel.count({
    where: {
      supplierId: supplierId,
      isActive: true,
    },
  });

  // Group stats by material
  const statsByMaterial: Record<
    string,
    { material: string; collections: { name: string; count: number }[] }
  > = {};

  panelStats.forEach((stat) => {
    const material = stat.material;
    const collection = stat.collection;
    const count = stat.count;

    if (!statsByMaterial[material]) {
      statsByMaterial[material] = {
        material,
        collections: [],
      };
    }

    statsByMaterial[material].collections.push({
      name: collection,
      count,
    });
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link href="/suppliers" className="hover:text-blue-600">
              Suppliers
            </Link>
            <span>/</span>
            <span className="text-gray-900">{supplier.name}</span>
          </div>
        </nav>

        {/* Supplier Header */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {supplier.name}
              </h1>
              {supplier.location && (
                <p className="text-lg text-gray-600 mb-4">
                  {supplier.location}
                </p>
              )}
              <div className="flex space-x-4 mt-2">
                {supplier.website && (
                  <a
                    href={supplier.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Website
                  </a>
                )}
                {supplier.email && (
                  <a
                    href={`mailto:${supplier.email}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Email
                  </a>
                )}
                {supplier.phone && (
                  <a
                    href={`tel:${supplier.phone}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {supplier.phone}
                  </a>
                )}
              </div>
            </div>
            <Link
              href={`/suppliers/${supplier.id}/edit`}
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Edit Prices
            </Link>
          </div>
        </div>

        {/* Panel Stats */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Available Panels ({totalPanels})
          </h2>

          {Object.values(statsByMaterial).map(({ material, collections }) => (
            <div key={material} className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 bg-gray-100 p-2">
                {material}
              </h3>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.map(({ name, count }) => (
                  <div
                    key={name}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <h4 className="font-medium text-gray-900 mb-2">{name}</h4>
                    <p className="text-gray-600">
                      {count} {count === 1 ? "panel" : "panels"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {totalPanels === 0 && (
            <div className="text-center py-8 text-gray-500">
              No panels available from this supplier
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
