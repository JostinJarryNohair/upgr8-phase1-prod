"use client";

export default function RegularSeasonPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Gestion de la saison régulière</h1>
            <div className="flex items-center space-x-4">
              <p className="text-gray-600">Page en développement</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Gestion de la saison régulière
            </h2>
            <p className="text-gray-600 mb-4">
              Cette fonctionnalité sera bientôt disponible.
            </p>
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 