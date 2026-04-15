"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { apiFetch, getErrorMessage } from "@/lib/api";

export const categoryPlaceholderImages: Record<string, string> = {
  Tutoring:
    "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  "CV & Careers":
    "https://images.unsplash.com/photo-1586281380349-632531db7ed4?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  Design:
    "https://images.unsplash.com/photo-1626785774573-4b799314346d?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  "Tech Help":
    "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
  Other:
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
};

export interface Service {
  id: number;
  title: string;
  author: string;
  ownerId: number;
  category: string;
  price: string;
  image: string;
  contactNumber?: string;
  email?: string;
  description?: string;
  createdAt: Date;
}

export interface ServiceApi {
  id: number;
  title: string;
  category: string;
  price: string;
  description: string | null;
  contact_number: string | null;
  image: string | null;
  owner_id: number;
  created_at: string;
  owner_name?: string | null;
  owner_email?: string | null;
}

export function mapServiceFromApi(row: ServiceApi): Service {
  const name = (row.owner_name ?? "").trim();
  return {
    id: row.id,
    title: row.title,
    author: name ? row.owner_name! : `User #${row.owner_id}`,
    ownerId: row.owner_id,
    category: row.category,
    price: row.price,
    image:
      (row.image && row.image.trim()) ||
      categoryPlaceholderImages[row.category] ||
      categoryPlaceholderImages.Other,
    contactNumber: row.contact_number ?? undefined,
    email: row.owner_email ?? undefined,
    description: row.description ?? undefined,
    createdAt: new Date(row.created_at),
  };
}

export type ServiceCreatePayload = {
  title: string;
  category: string;
  price: string;
  description?: string | null;
  contact_number?: string | null;
  image?: string | null;
};

interface ServiceContextType {
  services: Service[];
  loading: boolean;
  error: string | null;
  refreshServices: () => Promise<void>;
  addService: (payload: ServiceCreatePayload) => Promise<void>;
  updateService: (id: number, payload: ServiceCreatePayload) => Promise<void>;
  deleteService: (id: number) => Promise<void>;
}

const ServiceContext = createContext<ServiceContextType | undefined>(
  undefined,
);

export const ServiceProvider = ({ children }: { children: ReactNode }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch("/services/");
      if (!res.ok) {
        setError(await getErrorMessage(res));
        return;
      }
      const data: ServiceApi[] = await res.json();
      setServices(data.map(mapServiceFromApi));
    } catch {
      setError("Could not reach the server. Is the API running?");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshServices();
  }, [refreshServices]);

  const addService = useCallback(
    async (payload: ServiceCreatePayload) => {
      const res = await apiFetch("/services/", {
        method: "POST",
        body: JSON.stringify({
          title: payload.title,
          category: payload.category,
          price: payload.price,
          description: payload.description ?? null,
          contact_number: payload.contact_number ?? null,
          image: payload.image ?? null,
        }),
      });
      if (!res.ok) {
        throw new Error(await getErrorMessage(res));
      }
      await refreshServices();
    },
    [refreshServices],
  );

  const updateService = useCallback(
    async (id: number, payload: ServiceCreatePayload) => {
      const res = await apiFetch(`/services/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: payload.title,
          category: payload.category,
          price: payload.price,
          description: payload.description ?? null,
          contact_number: payload.contact_number ?? null,
          image: payload.image ?? null,
        }),
      });
      if (!res.ok) {
        throw new Error(await getErrorMessage(res));
      }
      await refreshServices();
    },
    [refreshServices],
  );

  const deleteService = useCallback(
    async (id: number) => {
      const res = await apiFetch(`/services/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error(await getErrorMessage(res));
      }
      await refreshServices();
    },
    [refreshServices],
  );

  return (
    <ServiceContext.Provider
      value={{
        services,
        loading,
        error,
        refreshServices,
        addService,
        updateService,
        deleteService,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};

export const useService = () => {
  const context = useContext(ServiceContext);
  if (context === undefined) {
    throw new Error("useService must be used within a ServiceProvider");
  }
  return context;
};
