"use client";

import { useState, useEffect, type ReactElement } from "react";
import {
  Loader2,
  Filter,
  Phone,
  MapPin,
  Calendar,
  MessageSquare,
  X,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { getAllOrders, updateOrderStatus } from "@/lib/orders";
import { formatShortOrderId } from "@/lib/whatsapp";
import { OrderTicket } from "@/components/OrderTicket";
import type { Order, OrderStatus } from "@/types";

const STATUS_FILTERS: { id: OrderStatus | "all"; label: string }[] = [
  { id: "all", label: "Toutes" },
  { id: "pending", label: "En attente" },
  { id: "confirmed", label: "Confirmées" },
  { id: "delivered", label: "Livrées" },
  { id: "cancelled", label: "Annulées" },
];

export default function AdminOrdersPage(): ReactElement {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchOrdersData = async (): Promise<void> => {
    try {
      setLoading(true);
      const list = await getAllOrders();
      setOrders(list);
    } catch {
      setFeedback({
        type: "error",
        message: "Impossible de récupérer les commandes.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function init(): Promise<void> {
      try {
        const list = await getAllOrders();
        if (isMounted) {
          setOrders(list);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setFeedback({
            type: "error",
            message: "Impossible de récupérer les commandes.",
          });
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleStatusChange = async (
    orderId: string,
    newStatus: OrderStatus
  ): Promise<void> => {
    try {
      setUpdatingOrderId(orderId);
      setFeedback(null);
      await updateOrderStatus(orderId, newStatus);

      // Mettre à jour localement l'état
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      setFeedback({
        type: "success",
        message: `Statut de la commande ${formatShortOrderId(orderId)} mis à jour.`,
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erreur de mise à jour";
      setFeedback({
        type: "error",
        message: `Impossible de changer le statut : ${msg}`,
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (selectedStatus === "all") return true;
    return o.status === selectedStatus;
  });

  const getStatusBadgeStyle = (status: OrderStatus): string => {
    switch (status) {
      case "pending":
        return "text-charcoal border-sand bg-sand/30";
      case "confirmed":
        return "text-primary border-primary/40 bg-paper font-bold";
      case "delivered":
        return "text-success border-success/60 bg-paper font-bold";
      case "cancelled":
        return "text-danger border-danger/60 bg-paper";
      default:
        return "text-charcoal border-sand bg-sand/30";
    }
  };

  return (
    <div id="admin-orders-container" className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-sand pb-4">
        <div>
          <span className="font-mono text-xs uppercase tracking-wider text-charcoal/60 block">
            Gestion des Ventes
          </span>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-charcoal tracking-tight">
            Commandes Clients
          </h1>
          <p className="text-xs text-charcoal/70 font-body mt-0.5">
            {orders.length} commande{orders.length > 1 ? "s" : ""} au total
          </p>
        </div>

        <button
          onClick={fetchOrdersData}
          disabled={loading}
          id="admin-refresh-orders-btn"
          type="button"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 border border-sand bg-paper hover:bg-sand/30 text-charcoal rounded [border-radius:2px] font-mono text-xs cursor-pointer transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Message de notification */}
      {feedback && (
        <div
          id="admin-orders-feedback"
          className={`p-3.5 border rounded [border-radius:4px] text-xs font-body flex items-center justify-between gap-2 ${
            feedback.type === "success"
              ? "bg-success/15 border-success text-success"
              : "bg-danger/15 border-danger text-danger"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            type="button"
            className="text-current opacity-70 hover:opacity-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Filtres par statut */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-3.5 h-3.5 text-charcoal/50 shrink-0" />
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setSelectedStatus(f.id)}
            id={`filter-${f.id}`}
            type="button"
            className={`px-3 py-1.5 font-mono text-xs rounded [border-radius:2px] whitespace-nowrap transition-colors cursor-pointer ${
              selectedStatus === f.id
                ? "bg-accent text-charcoal font-bold"
                : "bg-sand/20 text-charcoal/70 hover:bg-sand/40"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Liste des commandes */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <div className="flex items-center gap-2 font-mono text-sm text-charcoal/70">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <span>Chargement des commandes...</span>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-sand/15 border border-sand rounded [border-radius:4px] p-8 text-center">
          <p className="font-display font-bold text-base text-charcoal mb-1">
            Aucune commande
          </p>
          <p className="text-xs text-charcoal/70 font-body">
            Aucune commande ne correspond au filtre sélectionné.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Tableau / Liste */}
          <div className={`${selectedOrder ? "lg:col-span-7" : "lg:col-span-12"}`}>
            <div className="bg-paper border border-sand rounded [border-radius:4px] overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-sand bg-sand/20 font-mono text-[11px] uppercase text-charcoal/70 tracking-wider">
                      <th className="py-3 px-4">N° Commande</th>
                      <th className="py-3 px-4">Client</th>
                      <th className="py-3 px-4">Articles</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-right">Détails</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand/60 text-xs font-body">
                    {filteredOrders.map((order) => {
                      const shortId = formatShortOrderId(order.id);
                      const isSelected = selectedOrder?.id === order.id;
                      const dateStr = new Date(order.createdAt).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <tr
                          key={order.id}
                          className={`transition-colors cursor-pointer ${
                            isSelected ? "bg-sand/30" : "hover:bg-sand/10"
                          }`}
                          onClick={() => setSelectedOrder(order)}
                        >
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-mono font-bold text-primary block">
                              {shortId}
                            </span>
                            <span className="text-[10px] text-charcoal/60 font-mono flex items-center gap-1 mt-0.5">
                              <Calendar className="w-2.5 h-2.5" />
                              <span>{dateStr}</span>
                            </span>
                          </td>

                          <td className="py-3 px-4">
                            <span className="font-semibold text-charcoal block">
                              {order.customer.name}
                            </span>
                            <span className="text-[11px] text-charcoal/70 font-mono">
                              {order.customer.phone}
                            </span>
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap text-charcoal/80">
                            {order.items.reduce((s, i) => s + i.quantity, 0)} article(s)
                          </td>

                          <td className="py-3 px-4 font-mono font-bold text-charcoal whitespace-nowrap">
                            {order.total.toLocaleString("fr-FR")} FCFA
                          </td>

                          <td className="py-3 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                            <div className="relative inline-block">
                              <select
                                value={order.status}
                                disabled={updatingOrderId === order.id}
                                onChange={(e) =>
                                  handleStatusChange(order.id, e.target.value as OrderStatus)
                                }
                                className={`font-mono text-[11px] px-2 py-1 border rounded [border-radius:2px] uppercase cursor-pointer focus:outline-none ${getStatusBadgeStyle(
                                  order.status
                                )}`}
                              >
                                <option value="pending">En attente</option>
                                <option value="confirmed">Confirmée</option>
                                <option value="delivered">Livrée</option>
                                <option value="cancelled">Annulée</option>
                              </select>
                            </div>
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => setSelectedOrder(order)}
                              className="px-2.5 py-1 border border-sand rounded [border-radius:2px] font-mono text-[11px] text-charcoal hover:bg-sand/30 transition-colors"
                            >
                              Voir
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Panneau latéral Détails Ticket */}
          {selectedOrder && (
            <div className="lg:col-span-5 space-y-4">
              <div className="sticky top-20">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs uppercase font-medium text-charcoal/70">
                    Détail du Bon de Commande
                  </span>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    type="button"
                    className="text-xs font-mono text-charcoal/60 hover:text-charcoal p-1"
                  >
                    Fermer (✕)
                  </button>
                </div>

                <OrderTicket order={selectedOrder} showCustomerInfo={true} />

                {/* Actions logistiques */}
                <div className="bg-sand/20 border border-sand rounded [border-radius:4px] p-4 mt-3 space-y-3">
                  <h3 className="font-display font-bold text-xs uppercase text-charcoal">
                    Actions de Livraison
                  </h3>
                  
                  <div className="space-y-2 text-xs font-body">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span className="font-mono text-charcoal font-semibold">
                        {selectedOrder.customer.phone}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="text-charcoal/80">
                        {selectedOrder.customer.address}, {selectedOrder.customer.city}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-dashed border-sand flex gap-2">
                    <a
                      href={`tel:${selectedOrder.customer.phone.replace(/[^0-9]/g, "")}`}
                      className="flex-1 py-2 px-3 bg-paper border border-sand rounded [border-radius:2px] text-center font-mono text-xs font-medium text-charcoal hover:bg-sand/30 transition-colors"
                    >
                      Appeler
                    </a>
                    <a
                      href={`https://wa.me/${selectedOrder.customer.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-3 bg-whatsapp text-white rounded [border-radius:2px] text-center font-mono text-xs font-bold hover:brightness-105 transition-all inline-flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare className="w-3 h-3 fill-current" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
