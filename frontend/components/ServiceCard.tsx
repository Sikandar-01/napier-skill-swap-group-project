"use client";

import { Clock, Edit2, Trash2, Mail, MessageCircle } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { FaWhatsapp } from "react-icons/fa";
import { Service } from "../app/context/ServiceContext";
import { useAuth } from "../app/context/AuthContext";

interface ServiceCardProps extends Service {
  onEdit?: (service: Service) => void;
  onDelete?: (id: number) => void;
  type?: string;
}

export default function ServiceCard(props: ServiceCardProps) {
  const {
    id,
    title,
    category,
    price,
    author,
    image,
    contactNumber,
    email,
    description,
    createdAt,
    ownerId,
    onEdit,
    onDelete,
  } = props;

  const { user } = useAuth();
  const isOwnListing = user != null && user.id === ownerId;

  const openWhatsApp = (e: React.MouseEvent, number?: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!number) return;
    const cleanNumber = number.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}`, "_blank");
  };

  return (
    <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 overflow-hidden hover:shadow-md hover:border-gray-700 transition-all h-full flex flex-col group relative">
      <Link href={`/service/${id}`} className="relative h-48 block shrink-0">
        <img
          src={image}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80 group-hover:opacity-100"
        />
        <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm px-2 py-1 rounded text-xs font-semibold text-white shadow-sm border border-gray-800 z-10">
          {category}
        </div>

        {(onEdit || onDelete) && (
          <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onEdit(props);
                }}
                className="p-1.5 bg-black/80 hover:bg-black text-white rounded-md border border-gray-700"
                title="Edit"
              >
                <Edit2 size={14} />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDelete(id);
                }}
                className="p-1.5 bg-black/80 hover:bg-red-900/80 text-red-400 rounded-md border border-red-800"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </Link>

      <div className="flex-1 flex flex-col p-5 min-h-0">
        <Link href={`/service/${id}`} className="block min-h-0">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors line-clamp-2">
              {title}
            </h3>
          </div>
          <p className="text-sm text-gray-500 mb-4 line-clamp-1">
            {description || "No description provided."}
          </p>
          <p className="text-sm text-white mb-4">Posted by: {author}</p>
        </Link>

        <div className="mt-auto flex flex-wrap justify-between items-center gap-y-3 pt-4 border-t border-gray-800">
          <div className="flex flex-wrap items-center gap-2">
            {!isOwnListing && (
              <Link
                href={`/service/${id}?contact=1`}
                className="inline-flex items-center gap-1.5 rounded-lg bg-white text-black px-2.5 py-1.5 text-xs font-semibold hover:bg-gray-200 transition-colors border border-gray-200"
                title="Contact via SkillSwap"
              >
                <MessageCircle size={14} />
                Contact
              </Link>
            )}
            {contactNumber && (
              <button
                type="button"
                onClick={(e) => openWhatsApp(e, contactNumber)}
                className="p-1.5 cursor-pointer bg-green-900/50 hover:bg-green-800 text-green-400 rounded-full border border-green-800 transition-colors"
                title="WhatsApp"
              >
                <FaWhatsapp size={16} />
              </button>
            )}
            {email && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `mailto:${email}`;
                }}
                className="p-1.5 cursor-pointer bg-blue-900/50 hover:bg-blue-800 text-blue-400 rounded-full border border-blue-800 transition-colors"
                title="Email"
              >
                <Mail size={16} />
              </button>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-500 ml-1">
              <Clock size={12} />
              <span suppressHydrationWarning>
                {createdAt
                  ? formatDistanceToNow(new Date(createdAt), {
                      addSuffix: true,
                    })
                  : "Recently"}
              </span>
            </div>
          </div>
          <span className="font-bold text-white text-lg shrink-0">{price}</span>
        </div>
      </div>
    </div>
  );
}
