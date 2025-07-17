//components/DoorSelector.tsx

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface Supplier {
  id: string;
  name: string;
  location?: string;
}

interface Material {
  id: string;
  name: string;
}

interface Collection {
  id: string;
  name: string;
  materialId: string;
}

interface Panel {
  id: string;
  code: string;
  name: string;
  material: string;
  collection: string;
  height: string;
  widths: string[];
  description?: string;
  imageUrl?: string;
  supplierPanels: {
    id: string;
    basePrice: number | null;
    pricePerWidth: unknown;
    supplier: {
      id: string;
      name: string;
    };
  }[];
}

export default function DoorSelector() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [panels, setPanels] = useState<Panel[]>([]);

  const [selectedSupplier, setSelectedSupplier] = useState<string>("");
  const [selectedMaterial, setSelectedMaterial] = useState<string>("");
  const [selectedCollection, setSelectedCollection] = useState<string>("");
  const [selectedHeight, setSelectedHeight] = useState<string>("");
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");

  const [availableHeights, setAvailableHeights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch suppliers and materials on component mount
  useEffect(() => {
    fetchSuppliers();
    fetchMaterials();
  }, []);

  // Fetch collections when material changes
  useEffect(() => {
    if (selectedMaterial) {
      fetchCollections(selectedMaterial);
      setSelectedCollection("");
      setSelectedPanel(null);
    }
  }, [selectedMaterial]);

  // Fetch panels when material, collection, or supplier changes
  useEffect(() => {
    if (selectedMaterial) {
      // If "All" is selected (empty string) or a specific collection is selected
      fetchPanels(selectedMaterial, selectedCollection, selectedSupplier);
      setSelectedPanel(null);
      setSelectedHeight("");
    }
  }, [selectedCollection, selectedMaterial, selectedSupplier]);

  // Update available heights when panels change
  useEffect(() => {
    if (panels.length > 0) {
      const heights = [...new Set(panels.map((panel) => panel.height))];
      setAvailableHeights(heights);
    }
  }, [panels]);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers");
      const data = await response.json();
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchMaterials = async () => {
    try {
      const response = await fetch("/api/materials");
      const data = await response.json();
      setMaterials(data);
    } catch (error) {
      console.error("Error fetching materials:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async (material: string) => {
    try {
      const response = await fetch(`/api/collections?material=${material}`);
      const data = await response.json();
      setCollections(data);
    } catch (error) {
      console.error("Error fetching collections:", error);
    }
  };

  const fetchPanels = async (
    material: string,
    collection: string,
    supplierId?: string
  ) => {
    try {
      // Start with material filter
      let url = `/api/panels?material=${material}`;

      // Add collection filter only if a specific collection is selected
      if (collection) {
        url += `&collection=${collection}`;
      }

      // Add supplier filter if selected
      if (supplierId) {
        url += `&supplierId=${supplierId}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setPanels(data);
    } catch (error) {
      console.error("Error fetching panels:", error);
    }
  };

  const handlePanelSelect = (panel: Panel) => {
    setSelectedPanel(panel);
    setSelectedSize("");
  };

  const getImagePath = (panel: Panel) => {
    // Use the new path structure: material/collection/height
    const material = panel.material.toLowerCase();
    const collection = panel.collection.toLowerCase();
    const height = panel.height;
    const panelCode = panel.code; // Keep original case for panel code

    return `/images/doors/${material}/${collection}/${height}/${panelCode}.png`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Selection Controls */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">
          Select Your Door
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Supplier Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supplier (Optional)
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Suppliers</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          {/* Material Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material
            </label>
            <select
              value={selectedMaterial}
              onChange={(e) => setSelectedMaterial(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Material</option>
              {materials.map((material) => (
                <option key={material.id} value={material.id}>
                  {material.name}
                </option>
              ))}
            </select>
          </div>

          {/* Collection Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collection
            </label>
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              disabled={!selectedMaterial}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">All Collections</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </div>

          {/* Height Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Height
            </label>
            <select
              value={selectedHeight}
              onChange={(e) => setSelectedHeight(e.target.value)}
              disabled={availableHeights.length === 0}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select Height</option>
              {availableHeights.map((height) => (
                <option key={height} value={height}>
                  {height}
                </option>
              ))}
            </select>
          </div>

          {/* Size Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Width
            </label>
            <select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              disabled={!selectedPanel}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select Width</option>
              {selectedPanel?.widths.map((width) => (
                <option key={width} value={width}>
                  {width}&quot;
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Panel Grid */}
      {panels.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Available Panels
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {panels
              .filter(
                (panel) => !selectedHeight || panel.height === selectedHeight
              )
              .map((panel) => (
                <div
                  key={panel.id}
                  onClick={() => handlePanelSelect(panel)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPanel?.id === panel.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="aspect-[3/4] bg-gray-100 rounded-md mb-4 overflow-hidden relative">
                    <Image
                      src={getImagePath(panel)}
                      alt={`${panel.code} panel`}
                      fill
                      className="object-contain"
                      onError={() => {
                        console.log(`Image not found: ${getImagePath(panel)}`);
                      }}
                    />
                  </div>
                  <h4 className="font-semibold text-lg text-gray-900">
                    {panel.code}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {panel.material} {" > "} {panel.collection} {" > "}{" "}
                    {panel.height}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Available sizes: {panel.widths.join('", ')}&quot;
                  </p>
                  {panel.supplierPanels.length > 0 &&
                    panel.supplierPanels[0].basePrice && (
                      <p className="text-lg font-semibold text-green-600 mb-3">
                        Starting at ${panel.supplierPanels[0].basePrice}
                      </p>
                    )}
                  <Link
                    href={`/panels/${panel.id}`}
                    className="inline-block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Details
                  </Link>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Selected Panel Details */}
      {selectedPanel && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">
            Selected Panel Details
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-lg mb-2">
                {selectedPanel.code}
              </h4>
              <p className="text-gray-600 mb-2">
                Material: {selectedPanel.material}
              </p>
              <p className="text-gray-600 mb-2">
                Collection: {selectedPanel.collection}
              </p>
              <p className="text-gray-600 mb-2">
                Height: {selectedPanel.height}
              </p>
              <p className="text-gray-600 mb-4">
                Available Sizes: {selectedPanel.widths.join('", ')}\&quot;
              </p>
              {selectedSize && (
                <p className="text-lg font-semibold text-blue-600">
                  Selected Size: {selectedSize}\&quot;
                </p>
              )}
            </div>
            <div className="flex flex-col justify-end">
              {selectedPanel.supplierPanels.length > 0 &&
                selectedPanel.supplierPanels[0].basePrice && (
                  <p className="text-2xl font-bold text-green-600 mb-4">
                    Starting at ${selectedPanel.supplierPanels[0].basePrice}
                  </p>
                )}
              <button
                disabled={!selectedSize}
                className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add to Quote
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
