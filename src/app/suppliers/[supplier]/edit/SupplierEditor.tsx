"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Supplier {
  id: string;
  name: string;
  location?: string | null;
}

interface PanelModel {
  id: string;
  code: string;
  name: string;
  material: string;
  collection: string;
  height: string;
  widths: string[];
}

interface SupplierPanel {
  id: string;
  supplierId: string;
  panelModelId: string;
  basePrice: number | null;
  pricePerWidth: Record<string, number> | null | unknown;
  leadTime: string | null;
  isActive: boolean;
  panelModel: PanelModel;
  supplier: Supplier;
}

interface SupplierEditorProps {
  supplier: Supplier;
  supplierPanels: SupplierPanel[];
}

export default function SupplierEditor({
  supplier,
  supplierPanels,
}: SupplierEditorProps) {
  const router = useRouter();
  const [editedPanels, setEditedPanels] = useState<
    Record<string, SupplierPanel>
  >(Object.fromEntries(supplierPanels.map((panel) => [panel.id, panel])));
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("");
  const [currentMaterial, setCurrentMaterial] = useState<string | null>(null);
  const [currentCollection, setCurrentCollection] = useState<string | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPanel, setCurrentPanel] = useState<SupplierPanel | null>(null);
  const [newWidth, setNewWidth] = useState("");
  const [newWidthPrice, setNewWidthPrice] = useState("");

  // Get unique materials and collections for filtering
  const materials = [
    ...new Set(supplierPanels.map((sp) => sp.panelModel.material)),
  ];
  const collections = [
    ...new Set(
      supplierPanels
        .filter(
          (sp) => !currentMaterial || sp.panelModel.material === currentMaterial
        )
        .map((sp) => sp.panelModel.collection)
    ),
  ];

  // Filter panels based on search and material/collection filters
  const filteredPanels = supplierPanels.filter((panel) => {
    const matchesSearch =
      filter === "" ||
      panel.panelModel.code.toLowerCase().includes(filter.toLowerCase()) ||
      panel.panelModel.material.toLowerCase().includes(filter.toLowerCase()) ||
      panel.panelModel.collection.toLowerCase().includes(filter.toLowerCase());

    const matchesMaterial =
      !currentMaterial || panel.panelModel.material === currentMaterial;
    const matchesCollection =
      !currentCollection || panel.panelModel.collection === currentCollection;

    return matchesSearch && matchesMaterial && matchesCollection;
  });

  // Group panels by material and collection for better organization
  const groupedPanels: Record<string, Record<string, SupplierPanel[]>> = {};

  filteredPanels.forEach((panel) => {
    const material = panel.panelModel.material;
    const collection = panel.panelModel.collection;

    if (!groupedPanels[material]) {
      groupedPanels[material] = {};
    }

    if (!groupedPanels[material][collection]) {
      groupedPanels[material][collection] = [];
    }

    groupedPanels[material][collection].push(panel);
  });

  const handleBasePriceChange = (panelId: string, value: string) => {
    const price = value === "" ? null : parseFloat(value);

    setEditedPanels((prev) => ({
      ...prev,
      [panelId]: {
        ...prev[panelId],
        basePrice: price,
      },
    }));
  };

  const handleWidthPriceChange = (
    panelId: string,
    width: string,
    value: string
  ) => {
    const price = parseFloat(value);
    const panel = editedPanels[panelId];

    // Create or update the pricePerWidth object
    const pricePerWidth: Record<string, number> = panel.pricePerWidth
      ? { ...panel.pricePerWidth }
      : {};
    pricePerWidth[width] = price;

    setEditedPanels((prev) => ({
      ...prev,
      [panelId]: {
        ...prev[panelId],
        pricePerWidth,
      },
    }));
  };

  const handleActiveChange = (panelId: string, isActive: boolean) => {
    setEditedPanels((prev) => ({
      ...prev,
      [panelId]: {
        ...prev[panelId],
        isActive,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      // Find panels that have been modified
      const modifiedPanels = Object.values(editedPanels).filter((panel) => {
        const original = supplierPanels.find((p) => p.id === panel.id);
        if (!original) return false;

        return (
          panel.basePrice !== original.basePrice ||
          panel.isActive !== original.isActive ||
          JSON.stringify(panel.pricePerWidth) !==
            JSON.stringify(original.pricePerWidth)
        );
      });

      if (modifiedPanels.length === 0) {
        alert("No changes to save");
        setSaving(false);
        return;
      }

      // Save each modified panel
      for (const panel of modifiedPanels) {
        await fetch(`/api/supplier-panels/${panel.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            basePrice: panel.basePrice,
            pricePerWidth: panel.pricePerWidth,
            isActive: panel.isActive,
          }),
        });
      }

      alert(`Successfully updated ${modifiedPanels.length} panels`);
      router.refresh(); // Refresh the page to show updated data
    } catch (error) {
      console.error("Error saving panels:", error);
      alert("Error saving changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddWidth = async () => {
    if (!currentPanel || !newWidth || newWidth.trim() === "") return;

    try {
      // Add the width to the panel model
      const response = await fetch(
        `/api/panel-models/${currentPanel.panelModel.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            widths: [newWidth.trim()],
          }),
        }
      );

      if (response.ok) {
        // Update the local state
        const updatedPanel = await response.json();

        // Update the edited panels state with the new width
        setEditedPanels((prev) => ({
          ...prev,
          [currentPanel.id]: {
            ...prev[currentPanel.id],
            panelModel: {
              ...prev[currentPanel.id].panelModel,
              widths: updatedPanel.widths,
            },
          },
        }));

        // Set the price for the new width
        if (newWidthPrice) {
          handleWidthPriceChange(
            currentPanel.id,
            newWidth.trim(),
            newWidthPrice
          );
        }

        // Close the modal
        setIsModalOpen(false);
        setNewWidth("");
        setNewWidthPrice("");
        setCurrentPanel(null);
      } else {
        console.error("Failed to add width");
      }
    } catch (error) {
      console.error("Error adding width:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Modal for adding new width */}
      {isModalOpen && currentPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full">
            <h3 className="text-lg font-semibold mb-4">
              Add Width for {currentPanel.panelModel.name}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Width (inches)
                </label>
                <input
                  type="text"
                  value={newWidth}
                  onChange={(e) => setNewWidth(e.target.value)}
                  placeholder="e.g. 36"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  value={newWidthPrice}
                  onChange={(e) => setNewWidthPrice(e.target.value)}
                  placeholder="e.g. 100.00"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewWidth("");
                    setNewWidthPrice("");
                    setCurrentPanel(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddWidth}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add Width
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Info */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-4">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {supplier.name}
        </h2>
        {supplier.location && (
          <p className="text-gray-600">Location: {supplier.location}</p>
        )}
        <p className="text-gray-600 mt-2">
          Editing {supplierPanels.length} panels
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search by code, material, or collection"
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material
            </label>
            <select
              value={currentMaterial || ""}
              onChange={(e) => {
                const value = e.target.value || null;
                setCurrentMaterial(value);
                setCurrentCollection(null); // Reset collection when material changes
              }}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Materials</option>
              {materials.map((material) => (
                <option key={material} value={material}>
                  {material}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Collection
            </label>
            <select
              value={currentCollection || ""}
              onChange={(e) => setCurrentCollection(e.target.value || null)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={!currentMaterial}
            >
              <option value="">All Collections</option>
              {collections.map((collection) => (
                <option key={collection} value={collection}>
                  {collection}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Panel List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {filteredPanels.length} Panels
          </h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {Object.entries(groupedPanels).map(([material, collections]) => (
          <div key={material} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 bg-gray-100 p-2">
              {material}
            </h3>

            {Object.entries(collections).map(([collection, panels]) => (
              <div key={collection} className="mb-6">
                <h4 className="text-md font-medium text-gray-800 mb-3 border-b pb-1">
                  {collection}
                </h4>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Code
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Height
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Base Price
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Width Prices
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Active
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {panels.map((panel) => {
                        const editedPanel = editedPanels[panel.id];
                        return (
                          <tr key={panel.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {panel.panelModel.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {panel.panelModel.height}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">
                              <div className="flex items-center">
                                <span className="mr-2">$</span>
                                <input
                                  type="number"
                                  value={
                                    editedPanel.basePrice === null
                                      ? ""
                                      : editedPanel.basePrice
                                  }
                                  onChange={(e) =>
                                    handleBasePriceChange(
                                      panel.id,
                                      e.target.value
                                    )
                                  }
                                  className="w-24 p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-200"
                                  step="0.01"
                                  min="0"
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div className="flex flex-wrap gap-2">
                                {panel.panelModel.widths.map((width) => (
                                  <div
                                    key={width}
                                    className="flex items-center"
                                  >
                                    <span className="mr-1">{width}&quot;:</span>
                                    <span className="mr-1">$</span>
                                    <input
                                      type="number"
                                      value={
                                        editedPanel.pricePerWidth &&
                                        typeof editedPanel.pricePerWidth ===
                                          "object" &&
                                        (
                                          editedPanel.pricePerWidth as Record<
                                            string,
                                            number
                                          >
                                        )[width] !== undefined
                                          ? (
                                              editedPanel.pricePerWidth as Record<
                                                string,
                                                number
                                              >
                                            )[width]
                                          : editedPanel.basePrice || ""
                                      }
                                      onChange={(e) =>
                                        handleWidthPriceChange(
                                          panel.id,
                                          width,
                                          e.target.value
                                        )
                                      }
                                      className="w-20 p-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-200"
                                      step="0.01"
                                      min="0"
                                    />
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <input
                                type="checkbox"
                                checked={editedPanel.isActive}
                                onChange={(e) =>
                                  handleActiveChange(panel.id, e.target.checked)
                                }
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button
                                onClick={() => {
                                  setCurrentPanel(panel);
                                  setNewWidth("");
                                  setNewWidthPrice(
                                    editedPanel.basePrice?.toString() || ""
                                  );
                                  setIsModalOpen(true);
                                }}
                                className="bg-blue-500 text-white px-3 py-1.5 rounded-md hover:bg-blue-600 text-xs"
                                type="button"
                              >
                                Add Width
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ))}

        {filteredPanels.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No panels found matching your filters
          </div>
        )}
      </div>
    </div>
  );
}
