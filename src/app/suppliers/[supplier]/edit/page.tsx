import { notFound } from "next/navigation";
import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import SupplierEditor from "./SupplierEditor";

const prisma = new PrismaClient();

interface SupplierEditPageProps {
  params: {
    supplier: string;
  };
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

async function getSupplierPanels(supplierId: string) {
  try {
    const supplierPanels = await prisma.supplierPanel.findMany({
      where: {
        supplierId: supplierId,
      },
      include: {
        panelModel: true,
        supplier: true,
      },
      orderBy: [
        {
          panelModel: {
            material: "asc",
          },
        },
        {
          panelModel: {
            collection: "asc",
          },
        },
        {
          panelModel: {
            height: "asc",
          },
        },
        {
          panelModel: {
            code: "asc",
          },
        },
      ],
    });

    return supplierPanels;
  } catch (error) {
    console.error("Error fetching supplier panels:", error);
    return [];
  }
}

export default async function SupplierEditPage({
  params,
}: SupplierEditPageProps) {
  const supplierId = params.supplier;
  const supplier = await getSupplier(supplierId);

  if (!supplier) {
    notFound();
  }

  const supplierPanels = await getSupplierPanels(supplierId);

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
            <Link
              href={`/suppliers/${supplier.id}`}
              className="hover:text-blue-600"
            >
              {supplier.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900">Edit Prices</span>
          </div>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit {supplier.name} Prices
          </h1>
          <p className="text-lg text-gray-600">
            Update pricing information for all panels from this supplier
          </p>
        </div>

        <SupplierEditor supplier={supplier} supplierPanels={supplierPanels} />
      </div>
    </div>
  );
}
