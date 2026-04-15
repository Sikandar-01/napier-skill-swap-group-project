"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Plus, X, User as UserIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useService,
  Service,
  categoryPlaceholderImages,
} from "../context/ServiceContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import ServiceCard from "@/components/ServiceCard";

const categories = [
  "All",
  "Tutoring",
  "CV & Careers",
  "Tech Help",
  "Design",
  "Other",
];

function matchesServiceSearch(service: Service, raw: string) {
  const needle = raw.toLowerCase().trim();
  if (!needle) return true;
  const hay = [
    service.title,
    service.category,
    service.author,
    service.price,
    service.description ?? "",
    service.email ?? "",
    service.contactNumber ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

function BrowsePageContent() {
  const {
    services,
    loading,
    error,
    refreshServices,
    addService,
    updateService,
    deleteService,
  } = useService();
  const { user, isAdmin } = useAuth();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
  const qFromUrl = searchParams.get("q") ?? "";

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: Category, 2: Details
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState<Partial<Service>>({
    title: "",
    category: "",
    price: "",
    image: "",
    contactNumber: "",
    email: "",
    description: "",
  });

  useEffect(() => {
    setSearchTerm(qFromUrl);
  }, [qFromUrl]);

  const queryString = searchParams.toString();

  useEffect(() => {
    const t = window.setTimeout(() => {
      const next = searchTerm.trim();
      const params = new URLSearchParams(queryString);
      const current = params.get("q") ?? "";
      if (next === current) return;
      router.replace(
        next ? `/browse?q=${encodeURIComponent(next)}` : "/browse",
        { scroll: false },
      );
    }, 400);
    return () => window.clearTimeout(t);
  }, [searchTerm, router, queryString]);

  const filteredServices = services.filter((service) => {
    const matchesSearch = matchesServiceSearch(service, searchTerm);
    const matchesCategory =
      selectedCategory === "All" || service.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenCreate = () => {
    if (!user) {
      showToast("Please sign in to create a service.", "warning");
      return;
    }
    setIsEditing(false);
    setFormData({
      category: "",
      price: "",
      title: "",
      image: "",
      contactNumber: "",
      email: user.email,
      description: "",
    });
    setCurrentStep(1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    if (!canEdit(service)) return;
    setIsEditing(true);
    setFormData(service);
    setCurrentStep(2); // Skip category selection for edit, or allow re-selection? Let's go to details.
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (service: Service) => {
    setDeleteTarget(service);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteService(deleteTarget.id);
      showToast("Service removed.", "success");
      setDeleteTarget(null);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Could not delete service.",
        "error",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const canDelete = (service: Service) => {
    if (!user) return false;
    if (isAdmin) return true;
    return service.ownerId === user.id;
  };

  const canEdit = (service: Service) => {
    if (!user) return false;
    if (isAdmin) return true;
    return service.ownerId === user.id;
  };

  const handleCategorySelect = (category: string) => {
    setFormData({
      ...formData,
      category,
      image:
        categoryPlaceholderImages[category] ||
        categoryPlaceholderImages.Other,
    });
    setCurrentStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const image =
      formData.image ||
      categoryPlaceholderImages[formData.category || "Other"] ||
      categoryPlaceholderImages.Other;
    const payload = {
      title: formData.title!,
      category: formData.category!,
      price: formData.price!,
      description: formData.description ?? null,
      contact_number: formData.contactNumber ?? null,
      image,
    };
    try {
      if (isEditing && formData.id != null) {
        await updateService(formData.id, payload);
        showToast("Service updated.", "success");
      } else {
        await addService(payload);
        showToast("Service created.", "success");
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Request failed.",
        "error",
      );
    }
  };

  return (
    <div className="min-h-screen bg-black pt-24 pb-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div
            role="alert"
            className="mb-6 flex flex-col gap-2 rounded-lg border border-red-800 bg-red-950/40 p-4 text-red-200 sm:flex-row sm:items-center sm:justify-between"
          >
            <span>{error}</span>
            <button
              type="button"
              onClick={() => refreshServices()}
              className="text-sm underline decoration-red-400 underline-offset-2 hover:text-white"
            >
              Retry
            </button>
          </div>
        )}
        <div className="mb-12 bg-linear-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <UserIcon className="text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">
                Admin & Moderation Team
              </h2>
              <p className="text-gray-400 mb-4 max-w-2xl">
                The following administrators oversee content on the platform to
                ensure a safe community. They have the authority to remove any
                listings that violate Napier University rules or community
                guidelines.
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  "40770471@live.napier.ac.uk",
                  "40770470@live.napier.ac.uk",
                  "40735762@live.napier.ac.uk",
                  "40736676@live.napier.ac.uk",
                  "40730587@live.napier.ac.uk",
                ].map((email) => (
                  <span
                    key={email}
                    className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-300 text-sm font-mono"
                  >
                    {email}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold text-white">Browse Services</h1>
          <button
            onClick={handleOpenCreate}
            className="cursor-pointer flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-blue-500/20"
          >
            <Plus size={20} />
            Create Service
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-800 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={20}
              />
              <input
                type="search"
                placeholder="Search title, description, category, price, contact…"
                value={searchTerm}
                className="w-full pl-10 pr-4 py-2 bg-black border border-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-gray-600"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`cursor-pointer px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? "bg-white text-black"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && services.length === 0 ? (
            <p className="col-span-full py-12 text-center text-gray-500">
              Loading services…
            </p>
          ) : null}
          <AnimatePresence>
            {filteredServices.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
                className="group relative"
              >
                <ServiceCard
                  {...service}
                  onEdit={canEdit(service) ? handleOpenEdit : undefined}
                  onDelete={
                    canDelete(service)
                      ? () => handleDeleteRequest(service)
                      : undefined
                  }
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredServices.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-500">
              No services found matching your criteria.
            </h3>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-700/50 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h2 className="text-xl font-bold text-white">
                  {isEditing ? "Edit Service" : "Create New Service"}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto scrollbar-hide">
                {currentStep === 1 ? (
                  <div className="space-y-4">
                    <p className="text-gray-400 mb-4">
                      Please select a category used your service:
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      {categories
                        .filter((c) => c !== "All")
                        .map((cat) => (
                          <button
                            key={cat}
                            onClick={() => handleCategorySelect(cat)}
                            className="cursor-pointer p-4 rounded-xl border border-gray-700/50 bg-black/40 backdrop-blur-sm hover:bg-blue-600/10 hover:border-blue-500/50 hover:text-blue-400 text-gray-300 transition-all font-medium text-left"
                          >
                            {cat}
                          </button>
                        ))}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Service Title
                      </label>
                      <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        className="w-full px-4 py-2 bg-black/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="e.g. Advanced Python Tutoring"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Description
                      </label>
                      <textarea
                        required
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            description: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-black/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none h-24 resize-none transition-all"
                        placeholder="Describe your service..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Price
                        </label>
                        <input
                          required
                          type="text"
                          value={formData.price}
                          onChange={(e) =>
                            setFormData({ ...formData, price: e.target.value })
                          }
                          className="w-full px-4 py-2 bg-black/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                          placeholder="e.g. £20/hr"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">
                          Category
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              category: e.target.value,
                              image:
                                categoryPlaceholderImages[e.target.value] ||
                                categoryPlaceholderImages.Other,
                            })
                          }
                          className="w-full px-4 py-2 bg-black/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none transition-all"
                        >
                          {categories
                            .filter((c) => c !== "All")
                            .map((cat) => (
                              <option key={cat} value={cat}>
                                {cat}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Contact Number (WhatsApp)
                      </label>
                      <input
                        type="tel"
                        value={formData.contactNumber}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            contactNumber: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 bg-black/50 backdrop-blur-sm border border-gray-700/50 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        placeholder="+44 7700 900000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email || user?.email || ""}
                        readOnly
                        disabled
                        className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700/50 rounded-lg text-gray-400 cursor-not-allowed outline-none"
                      />
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-gray-800 mt-6">
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => setCurrentStep(1)}
                          className="cursor-pointer px-4 py-2 text-gray-400 hover:text-white font-medium"
                        >
                          Back
                        </button>
                      )}
                      <button
                        type="submit"
                        className="cursor-pointer flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold transition-all"
                      >
                        {isEditing ? "Save Changes" : "Create Service"}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
        {deleteTarget && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-6 shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="delete-dialog-title"
            >
              <h2
                id="delete-dialog-title"
                className="text-lg font-bold text-white"
              >
                Remove this service?
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                <span className="text-gray-200 font-medium">
                  {deleteTarget.title}
                </span>{" "}
                will be permanently removed from the listings.
              </p>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteTarget(null)}
                  className="cursor-pointer rounded-lg px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="cursor-pointer rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60"
                >
                  {isDeleting ? "Removing…" : "Remove"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black pt-24 pb-12 flex items-center justify-center text-gray-500">
          Loading browse…
        </div>
      }
    >
      <BrowsePageContent />
    </Suspense>
  );
}
