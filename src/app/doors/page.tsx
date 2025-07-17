import DoorSelector from "@/components/DoorSelector";

export default function DoorsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Browse Our Door Collection
          </h1>
          <p className="text-lg text-gray-600">
            Select from our premium collection of custom doors
          </p>
        </div>

        <DoorSelector />
      </div>
    </div>
  );
}
