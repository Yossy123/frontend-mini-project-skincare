'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { AnalyticsTabPanels } from '@/components/admin/AnalyticsTabPanels';
import {
  fetchSalesAnalytics,
  downloadSalesReport,
  fetchOrderAnalytics,
  fetchProductAnalytics,
  fetchCustomerAnalytics,
  fetchPaymentAnalytics,
  fetchShippingAnalytics,
  SalesAnalyticsResponse,
  OrderAnalyticsResponse,
  ProductAnalyticsResponse,
  CustomerAnalyticsResponse,
  PaymentAnalyticsResponse,
  ShippingAnalyticsResponse,
} from '@/lib/api';
import {
  DollarSign,
  ShoppingBag,
  Package,
  Users,
  CreditCard,
  Truck,
  RefreshCw,
  AlertCircle,
  Download,
} from 'lucide-react';

type TabKey = 'sales' | 'orders' | 'products' | 'customers' | 'payments' | 'shipping';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabKey) || 'sales';

  const { token } = useAuthStore();

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);
  const [period, setPeriod] = useState<string>('30d');
  const [reportPeriod, setReportPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [downloadingReport, setDownloadingReport] = useState(false);

  const [salesData, setSalesData] = useState<SalesAnalyticsResponse | null>(null);
  const [ordersData, setOrdersData] = useState<OrderAnalyticsResponse | null>(null);
  const [productsData, setProductsData] = useState<ProductAnalyticsResponse | null>(null);
  const [customersData, setCustomersData] = useState<CustomerAnalyticsResponse | null>(null);
  const [paymentsData, setPaymentsData] = useState<PaymentAnalyticsResponse | null>(null);
  const [shippingData, setShippingData] = useState<ShippingAnalyticsResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTabData = useCallback(async (showLoading = false) => {
    if (!token) return;
    if (showLoading) setLoading(true);
    setError(null);

    try {
      if (activeTab === 'sales') {
        const res = await fetchSalesAnalytics({ period }, token);
        setSalesData(res);
      } else if (activeTab === 'orders') {
        const res = await fetchOrderAnalytics({ period }, token);
        setOrdersData(res);
      } else if (activeTab === 'products') {
        const res = await fetchProductAnalytics({ period }, token);
        setProductsData(res);
      } else if (activeTab === 'customers') {
        const res = await fetchCustomerAnalytics({ period }, token);
        setCustomersData(res);
      } else if (activeTab === 'payments') {
        const res = await fetchPaymentAnalytics({ period }, token);
        setPaymentsData(res);
      } else if (activeTab === 'shipping') {
        const res = await fetchShippingAnalytics({ period }, token);
        setShippingData(res);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch analytics data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [activeTab, period, token]);

  useEffect(() => {
    let isMounted = true;
    if (!token) return;

    const fetchPromise = (() => {
      if (activeTab === 'sales') return fetchSalesAnalytics({ period }, token);
      if (activeTab === 'orders') return fetchOrderAnalytics({ period }, token);
      if (activeTab === 'products') return fetchProductAnalytics({ period }, token);
      if (activeTab === 'customers') return fetchCustomerAnalytics({ period }, token);
      if (activeTab === 'payments') return fetchPaymentAnalytics({ period }, token);
      if (activeTab === 'shipping') return fetchShippingAnalytics({ period }, token);
      return Promise.resolve(null);
    })();

    fetchPromise
      .then((res) => {
        if (!isMounted || !res) return;
        if (activeTab === 'sales') setSalesData(res as SalesAnalyticsResponse);
        else if (activeTab === 'orders') setOrdersData(res as OrderAnalyticsResponse);
        else if (activeTab === 'products') setProductsData(res as ProductAnalyticsResponse);
        else if (activeTab === 'customers') setCustomersData(res as CustomerAnalyticsResponse);
        else if (activeTab === 'payments') setPaymentsData(res as PaymentAnalyticsResponse);
        else if (activeTab === 'shipping') setShippingData(res as ShippingAnalyticsResponse);
        setError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Failed to fetch analytics data';
        setError(msg);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab, period, token]);

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    router.push(`/admin/analytics?tab=${tab}`);
  };

  const handleDownloadSalesReport = async () => {
    if (!token || downloadingReport) return;

    setDownloadingReport(true);
    setError(null);
    try {
      const blob = await downloadSalesReport(reportPeriod, token);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `laporan-penjualan-${reportPeriod}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Gagal mengunduh laporan penjualan.');
    } finally {
      setDownloadingReport(false);
    }
  };

  const periodOptions = [
    { label: 'Today', value: 'today' },
    { label: 'Last 7 Days', value: '7d' },
    { label: 'Last 30 Days', value: '30d' },
    { label: 'This Month', value: 'this_month' },
    { label: 'Last Month', value: 'last_month' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Controls */}
      <div className="space-y-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl sm:text-3xl font-serif text-white font-normal">
              E-Commerce Analytics
            </h2>
            <p className="mt-1 max-w-2xl text-xs text-zinc-400">
              Realtime database telemetry across sales, product demand, customers, payments, and shipping.
            </p>
          </div>

          {activeTab === 'sales' && (
            <div className="flex shrink-0 items-center gap-2 self-start xl:self-auto">
              <select
                value={reportPeriod}
                onChange={(event) => setReportPeriod(event.target.value as 'week' | 'month' | 'year')}
                aria-label="Periode laporan penjualan"
                className="rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              >
                <option value="week">Minggu ini</option>
                <option value="month">Bulan ini</option>
                <option value="year">Tahun ini</option>
              </select>
              <button
                type="button"
                onClick={handleDownloadSalesReport}
                disabled={downloadingReport}
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-xl bg-rose-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className={`h-4 w-4 ${downloadingReport ? 'animate-pulse' : ''}`} />
                {downloadingReport ? 'Menyiapkan...' : 'Unduh CSV'}
              </button>
            </div>
          )}
        </div>

        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0 overflow-x-auto">
            <div className="inline-flex items-center gap-1 whitespace-nowrap rounded-2xl border border-zinc-800 bg-zinc-900 p-1">
              {periodOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPeriod(opt.value)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                    period === opt.value
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => loadTabData(true)}
            disabled={loading}
            className="shrink-0 rounded-xl border border-zinc-800 bg-zinc-900 p-2 text-zinc-400 transition-all hover:border-zinc-700 hover:text-white disabled:opacity-50"
            title="Refresh Data"
            aria-label="Refresh Data"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-zinc-800/80 overflow-x-auto pb-px">
        {[
          { key: 'sales', label: 'Sales & Revenue', icon: DollarSign },
          { key: 'orders', label: 'Order Lifecycle', icon: ShoppingBag },
          { key: 'products', label: 'Product Performance', icon: Package },
          { key: 'customers', label: 'Customer Retention', icon: Users },
          { key: 'payments', label: 'Midtrans Payments', icon: CreditCard },
          { key: 'shipping', label: 'Courier & Shipping', icon: Truck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key as TabKey)}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'border-rose-500 text-rose-400 bg-rose-500/5'
                  : 'border-transparent text-zinc-400 hover:text-white hover:bg-zinc-900/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-900 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <AnalyticsTabPanels
        activeTab={activeTab}
        salesData={salesData}
        ordersData={ordersData}
        productsData={productsData}
        customersData={customersData}
        paymentsData={paymentsData}
        shippingData={shippingData}
      />
    </div>
  );
}
