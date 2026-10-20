import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ProductionPlanModal } from '../components/production-plan/ProductionPlanModal';
import { useAuthStore } from '../stores/useAuthStore';
import { Pagination } from '../components/common/Pagination';
import { type ProductionPlan, type SearchConditions, statusLabels, emptySearch } from '../types/productionPlan';

import { ProductionPlanSearch } from '../components/production-plan/ProductionPlanSearch';
import { ProductionPlanTable } from '../components/production-plan/ProductionPlanTable';

export function ProductionPlanPage() {
    const [plans, setPlans] = useState<ProductionPlan[]>([]);
    const [search, setSearch] = useState<SearchConditions>(emptySearch);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<ProductionPlan | null>(null);

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [deleting, setDeleting] = useState(false);

    const employee = useAuthStore((state) => state.employee);
    const canRegister = employee?.role === 'ADMIN' || employee?.role === 'PLANNER';

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const fetchPlans = async (conditions: SearchConditions, targetPage = page, targetPageSize = pageSize) => {
        setLoading(true);
        setErrorMessage('');

        try {
            if (conditions.startDate && conditions.endDate && conditions.startDate > conditions.endDate) {
                setErrorMessage('시작일은 종료일보다 늦을 수 없습니다.');
                return;
            }

            let query = supabase.from('production_plans').select('*', { count: 'exact' });

            if (conditions.planNo.trim()) {
                query = query.ilike('plan_no', `%${conditions.planNo.trim()}%`);
            }

            if (conditions.itemCode.trim()) {
                query = query.ilike('item_code', `%${conditions.itemCode.trim()}%`);
            }

            if (conditions.itemName.trim()) {
                query = query.ilike('item_name', `%${conditions.itemName.trim()}%`);
            }

            if (conditions.status) {
                query = query.eq('status', conditions.status);
            }

            if (conditions.startDate) {
                query = query.gte('end_date', conditions.startDate);
            }

            if (conditions.endDate) {
                query = query.lte('start_date', conditions.endDate);
            }

            const from = (targetPage - 1) * targetPageSize;
            const to = from + targetPageSize - 1;

            const { data, error, count } = await query.order('id', { ascending: true }).range(from, to);

            if (error) {
                throw error;
            }

            const resultCount = count ?? 0;
            const lastPage = Math.max(1, Math.ceil(resultCount / targetPageSize));

            if (targetPage > lastPage) {
                setPage(lastPage);
                await fetchPlans(conditions, lastPage, targetPageSize);
                return;
            }

            setPlans(data ?? []);
            setTotalCount(resultCount);
        } catch (error) {
            console.error('생산계획 조회 실패:', error);
            setErrorMessage('생산계획을 조회하지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void fetchPlans(emptySearch);
    }, []);

    const handleSearch = () => {
        setSelectedIds([]);
        setPage(1);
        void fetchPlans(search, 1, pageSize);
    };

    const handleReset = () => {
        setSelectedIds([]);
        setSearch({ ...emptySearch });
        setPage(1);
        void fetchPlans(emptySearch, 1, pageSize);
    };

    const handleSelectOne = (id: number, checked: boolean) => {
        setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((selectedId) => selectedId !== id)));
    };

    const handleSelectAll = (checked: boolean) => {
        const pageIds = plans.map((plan) => plan.id);

        setSelectedIds((prev) => {
            if (checked) {
                return [...new Set([...prev, ...pageIds])];
            }

            return prev.filter((id) => !pageIds.includes(id));
        });
    };

    const handleDeleteSelected = async () => {
        if (employee?.role !== 'ADMIN' || deleting || loading || selectedIds.length === 0) {
            return;
        }

        const idsToDelete = [...selectedIds];

        const confirmed = window.confirm(`선택한 생산계획 ${idsToDelete.length}건을 삭제하시겠습니까?\n삭제 후 복구할 수 없습니다.`);

        if (!confirmed) return;

        setDeleting(true);
        setErrorMessage('');

        try {
            const { data, error } = await supabase.from('production_plans').delete().in('id', idsToDelete).select('id');

            if (error) throw error;

            await fetchPlans(search);

            if (!data || data.length !== idsToDelete.length) {
                setErrorMessage('일부 생산계획이 삭제되지 않았습니다. 목록을 확인해 주세요.');
                return;
            }

            setSelectedIds([]);
        } catch (error) {
            console.error('생산계획 삭제 실패:', error);
            setErrorMessage('생산계획 삭제 중 오류가 발생했습니다.');
        } finally {
            setDeleting(false);
        }
    };

    const handleExcelDownload = async () => {
        if (selectedIds.length === 0) {
            alert('엑셀로 다운로드할 생산계획을 선택해주세요.');
            return;
        }

        try {
            const { data: selectedPlans, error } = await supabase
                .from('production_plans')
                .select('*')
                .in('id', selectedIds)
                .order('id', { ascending: true });

            if (error) {
                throw error;
            }

            if (!selectedPlans || selectedPlans.length !== selectedIds.length) {
                alert('선택한 생산계획 중 조회할 수 없는 데이터가 있습니다.');
                return;
            }

            const ExcelJS = (await import('exceljs')).default;

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('생산계획');

            worksheet.columns = [
                { header: '계획번호', key: 'planNo', width: 22 },
                { header: '품목코드', key: 'itemCode', width: 18 },
                { header: '품목명', key: 'itemName', width: 25 },
                { header: '계획수량', key: 'quantity', width: 15 },
                { header: '단위', key: 'unit', width: 10 },
                { header: '계획시작일', key: 'startDate', width: 18 },
                { header: '계획종료일', key: 'endDate', width: 18 },
                { header: '상태', key: 'status', width: 15 },
                { header: '등록일시', key: 'createdAt', width: 25 },
            ];

            selectedPlans.forEach((plan) => {
                worksheet.addRow({
                    planNo: plan.plan_no,
                    itemCode: plan.item_code,
                    itemName: plan.item_name,
                    quantity: plan.quantity,
                    unit: 'EA',
                    startDate: plan.start_date,
                    endDate: plan.end_date,
                    status: statusLabels[plan.status] ?? plan.status,
                    createdAt: new Date(plan.created_at).toLocaleString('ko-KR'),
                });
            });

            const headerRow = worksheet.getRow(1);

            headerRow.font = {
                bold: true,
                color: { argb: 'FFFFFFFF' },
            };

            headerRow.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF2563EB' },
            };

            headerRow.alignment = {
                vertical: 'middle',
                horizontal: 'center',
            };

            headerRow.height = 25;

            worksheet.getColumn('quantity').numFmt = '#,##0';

            worksheet.autoFilter = {
                from: 'A1',
                to: 'I1',
            };

            worksheet.views = [{ state: 'frozen', ySplit: 1 }];

            const buffer = await workbook.xlsx.writeBuffer();

            const bytes = new Uint8Array(buffer);
            const blob = new Blob([bytes.buffer as ArrayBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            const today = new Date().toLocaleDateString('en-CA');

            link.href = url;
            link.download = `production_plans_${today}.xlsx`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
            console.error('엑셀 다운로드 실패:', error);
            alert('엑셀 다운로드 중 오류가 발생했습니다.');
        }
    };
    
    const handlePageChange = (nextPage: number) => {
        if (loading || deleting || nextPage < 1 || nextPage > totalPages) {
            return;
        }

        setPage(nextPage);
        void fetchPlans(search, nextPage, pageSize);
    };

    const handlePageSizeChange = (nextPageSize: number) => {
        if (loading || deleting) return;

        setPageSize(nextPageSize);
        setPage(1);

        void fetchPlans(search, 1, nextPageSize);
    };

    return (
        <div className="mes-input-flex-option">
            <h1 className="mes-main-title">생산계획 관리</h1>

            <ProductionPlanSearch
                search={search}
                loading={loading}
                deleting={deleting}
                errorMessage={errorMessage}
                onChange={setSearch}
                onSearch={handleSearch}
                onReset={handleReset}
            />

            <section className="mes-box">
                <div className="flex flex-row justify-between items-center mb-2">
                    <div className="flex flex-row items-center gap-3">
                        <h2 className="mes-sub-title">생산계획 목록</h2>
                        <p className="text-lg bg-gray-100 p-3 py-1 rounded-full font-medium"> {totalCount}건</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            className="mes-button mes-button-outline"
                            onClick={handleExcelDownload}
                            disabled={loading || deleting || selectedIds.length === 0}
                        >
                            엑셀 다운로드
                        </button>

                        {employee?.role === 'ADMIN' && (
                            <button
                                type="button"
                                className="mes-button mes-button-outline text-red-600"
                                onClick={handleDeleteSelected}
                                disabled={deleting || selectedIds.length === 0}
                            >
                                {deleting ? '삭제 중...' : `선택 삭제 (${selectedIds.length})`}
                            </button>
                        )}

                        {canRegister && (
                            <button
                                type="button"
                                className="mes-button mes-button-primary"
                                onClick={() => {
                                    setSelectedPlan(null);
                                    setIsModalOpen(true);
                                }}
                            >
                                + 등록
                            </button>
                        )}
                    </div>
                </div>

                <ProductionPlanTable
                    plans={plans}
                    page={page}
                    pageSize={pageSize}
                    loading={loading}
                    deleting={deleting}
                    selectedIds={selectedIds}
                    canRegister={canRegister}
                    onSelectOne={handleSelectOne}
                    onSelectAll={handleSelectAll}
                    onEdit={(plan) => {
                        setSelectedPlan(plan);
                        setIsModalOpen(true);
                    }}
                />

                <Pagination
                    page={page}
                    pageSize={pageSize}
                    totalCount={totalCount}
                    loading={loading}
                    disabled={deleting}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            </section>

            {isModalOpen && canRegister && (
                <ProductionPlanModal
                    plan={selectedPlan}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedPlan(null);
                    }}
                    onSaved={() => {
                        setSelectedIds([]);
                        setSearch({ ...emptySearch });
                        setPage(1);
                        void fetchPlans(emptySearch, 1, pageSize);
                    }}
                />
            )}
        </div>
    );
}
