"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Category {
  id: string;
  name: string;
}

interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
}

interface Door {
  id: string;
  name: string;
  widths: string[];
  basePrice: number | null;
  subcategoryId: string;
  categoryName: string;
  subcategoryName: string;
  material: string;
  height: string;
  subcategory: {
    name: string;
    category: {
      name: string;
    };
  };
}

export default function DoorSelector() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [doors, setDoors] = useState<Door[]>([]);

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [selectedHeight, setSelectedHeight] = useState<string>("");
  const [selectedDoor, setSelectedDoor] = useState<Door | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");

  const [availableHeights, setAvailableHeights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch subcategories when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchSubcategories(selectedCategory);
      setSelectedSubcategory("");
      setSelectedDoor(null);
    }
  }, [selectedCategory]);

  // Fetch doors when subcategory changes
  useEffect(() => {
    if (selectedSubcategory) {
      fetchDoors(selectedSubcategory);
      setSelectedDoor(null);
      setSelectedHeight("");
    }
  }, [selectedSubcategory]);

  // Update available heights when doors change
  useEffect(() => {
    if (doors.length > 0) {
      const heights = [...new Set(doors.map((door) => door.height))];
      setAvailableHeights(heights);
    }
  }, [doors]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async (categoryId: string) => {
    try {
      const response = await fetch(
        `/api/subcategories?categoryId=${categoryId}`
      );
      const data = await response.json();
      setSubcategories(data);
    } catch (error) {
      console.error("Error fetching subcategories:", error);
    }
  };

  const fetchDoors = async (subcategoryId: string) => {
    try {
      const response = await fetch(`/api/doors?subcategoryId=${subcategoryId}`);
      const data = await response.json();
      setDoors(data);
    } catch (error) {
      console.error("Error fetching doors:", error);
    }
  };

  const handleDoorSelect = (door: Door) => {
    setSelectedDoor(door);
    setSelectedSize("");
  };

  const getImagePath = (door: Door) => {
    // Use the new path structure: category/material/height
    const category = door.categoryName.toLowerCase();
    const material = door.material;
    const height = door.height;
    const doorName = door.name; // Keep original case for door name

    return `/images/doors/${category}/${material}/${height}/${doorName}.png`;
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategory
            </label>
            <select
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              disabled={!selectedCategory}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select Subcategory</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
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
              disabled={!selectedDoor}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select Width</option>
              {selectedDoor?.widths.map((width) => (
                <option key={width} value={width}>
                  {width}&quot;
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Door Grid */}
      {doors.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Available Doors
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doors
              .filter(
                (door) => !selectedHeight || door.height === selectedHeight
              )
              .map((door) => (
                <div
                  key={door.id}
                  onClick={() => handleDoorSelect(door)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedDoor?.id === door.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="aspect-[3/4] bg-gray-100 rounded-md mb-4 overflow-hidden relative">
                    <Image
                      src={getImagePath(door)}
                      alt={`${door.name} door`}
                      fill
                      className="object-contain"
                      onError={() => {
                        console.log(`Image not found: ${getImagePath(door)}`);
                      }}
                    />
                  </div>
                  <h4 className="font-semibold text-lg text-gray-900">
                    {door.name}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {door.categoryName} {" > "} {door.subcategoryName} {" > "}{" "}
                    {door.height}
                  </p>
                  <p className="text-sm text-gray-600 mb-2">
                    Available sizes: {door.widths.join('", ')}&quot;
                  </p>
                  {door.basePrice && (
                    <p className="text-lg font-semibold text-green-600 mb-3">
                      Starting at ${door.basePrice}
                    </p>
                  )}
                  <Link
                    href={`/doors/${door.id}`}
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

      {/* Selected Door Details */}
      {selectedDoor && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">
            Selected Door Details
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-lg mb-2">
                {selectedDoor.name}
              </h4>
              <p className="text-gray-600 mb-2">
                Category: {selectedDoor.categoryName}
              </p>
              <p className="text-gray-600 mb-2">
                Subcategory: {selectedDoor.subcategoryName}
              </p>
              <p className="text-gray-600 mb-2">
                Height: {selectedDoor.height}
              </p>
              <p className="text-gray-600 mb-4">
                Available Sizes: {selectedDoor.widths.join('", ')}\&quot;
              </p>
              {selectedSize && (
                <p className="text-lg font-semibold text-blue-600">
                  Selected Size: {selectedSize}\&quot;
                </p>
              )}
            </div>
            <div className="flex flex-col justify-end">
              {selectedDoor.basePrice && (
                <p className="text-2xl font-bold text-green-600 mb-4">
                  Starting at ${selectedDoor.basePrice}
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
