'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ExternalLink, ChevronLeft, ChevronRight, ArrowUpDown, Layers } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { AdminPageLayout, AdminSection } from '@/components/admin/AdminPageLayout';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface Distribution {
  id: string;
  hash_code: string;
  distribution_number: string;
  sequence_number: string;
  used_count: number;
  created_at: string;
}

type SortField = 'created_at' | 'used_count' | 'hash_code';
type SortOrder = 'asc' | 'desc';

export default function DistributionsListPage() {
  const [loading, setLoading] = useState(false);
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [filteredDistributions, setFilteredDistributions] = useState<Distribution[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [usageFilter, setUsageFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  useEffect(() => {
    loadDistributions();
  }, []);

  const loadDistributions = useCallback(async () => {
    const supabase = createClient(supabaseUrl, supabaseKey);
    setLoading(true);

    const { data } = await supabase
      .from('card_distributions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (data) {
      setDistributions(data);
    }

    setLoading(false);
  }, []);

  const filterAndSortDistributions = useCallback(() => {
    let filtered = [...distributions];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        d =>
          d.hash_code.toLowerCase().includes(term) ||
          d.distribution_number.includes(term) ||
          d.sequence_number.includes(term)
      );
    }

    if (usageFilter === 'used') {
      filtered = filtered.filter(d => d.used_count > 0);
    } else if (usageFilter === 'unused') {
      filtered = filtered.filter(d => d.used_count === 0);
    }

    filtered.sort((a, b) => {
      let aVal: any = a[sortField];
      let bVal: any = b[sortField];

      if (sortField === 'created_at') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredDistributions(filtered);
    setCurrentPage(1);
  }, [distributions, searchTerm, usageFilter, sortField, sortOrder]);

  useEffect(() => {
    loadDistributions();
  }, [loadDistributions]);

  useEffect(() => {
    filterAndSortDistributions();
  }, [filterAndSortDistributions]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const totalPages = Math.ceil(filteredDistributions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDistributions = filteredDistributions.slice(startIndex, endIndex);

  return (
    <AdminPageLayout
      title="Distributions"
      description={`${filteredDistributions.length} distribution${filteredDistributions.length > 1 ? 's' : ''} trouvée${filteredDistributions.length > 1 ? 's' : ''}`}
      icon={Layers}
      loading={loading}
      stats={[
        {
          label: 'Total',
          value: distributions.length,
          icon: Layers
        },
        {
          label: 'Utilisées',
          value: distributions.filter(d => d.used_count > 0).length,
          icon: ExternalLink,
          color: 'text-green-600'
        },
        {
          label: 'Non utilisées',
          value: distributions.filter(d => d.used_count === 0).length,
          icon: Layers,
          color: 'text-blue-600'
        }
      ]}
      actions={
        <Link href="/operation/seed">
          <Button>
            Générer des distributions
          </Button>
        </Link>
      }
    >

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher par code hash, numéro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={usageFilter} onValueChange={setUsageFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filtrer par utilisation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="used">Utilisées</SelectItem>
                <SelectItem value="unused">Non utilisées</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => toggleSort('hash_code')}
                    className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider hover:text-slate-700"
                  >
                    Code Hash
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Distribution
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Séquence
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => toggleSort('used_count')}
                    className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider hover:text-slate-700"
                  >
                    Utilisations
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left">
                  <button
                    onClick={() => toggleSort('created_at')}
                    className="flex items-center gap-2 text-xs font-medium text-slate-500 uppercase tracking-wider hover:text-slate-700"
                  >
                    Date
                    <ArrowUpDown className="w-4 h-4" />
                  </button>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {currentDistributions.map((dist) => (
                <tr key={dist.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-mono text-sm font-semibold text-slate-900">
                      {dist.hash_code}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {dist.distribution_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {dist.sequence_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      dist.used_count > 0 ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {dist.used_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {new Date(dist.created_at).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex gap-2">
                      <Link href={`/distributions/${dist.hash_code}`} target="_blank">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link href={`/operation/distributions/${dist.id}`}>
                        <Button variant="outline" size="sm">
                          Détails
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredDistributions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600">Aucune distribution trouvée</p>
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between">
            <div className="text-sm text-slate-600">
              Page {currentPage} sur {totalPages} ({filteredDistributions.length} résultats)
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </AdminPageLayout>
  );
}
