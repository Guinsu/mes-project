import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { ItemManagementSearch } from '../components/item/ItemManagementSearch';
import { ItemManagementTable } from '../components/item/ItemManagementTable';
import { ItemManagementModal } from '../components/item/ItemManagementModal';
import { Pagination } from '../components/common/Pagination';
import type { ItemManagement, ItemSearchConditions } from '../types/ItemManagement';
import { itemTypeLabels } from '../types/ItemManagement';
import { useAuthStore } from '../stores/useAuthStore';

const initialSearch: ItemSearchConditions = {
    item_code: '',
    item_name: '',
    item_type: '',
    is_active: '',
};

export function ItemManagementPage() {
    const [search, setSearch] = useState<ItemSearchConditions>({
        ...initialSearch,
    });

    const [items, setItems] = useState<ItemManagement[]>([]);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const [errorMessage, setErrorMessage] = useState('');

    const employee = useAuthStore((state) => state.employee);
    const [deleting, setDeleting] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const canRegister = employee?.role === 'ADMIN' || employee?.role === 'PLANNER';

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ItemManagement | null>(null);

    const onSearch = () => {
        setPage(1);
        setSelectedIds([]);
        void fetchItems(search, 1, pageSize);
    };

    const onReset = () => {
        setSearch({ ...initialSearch });
        setErrorMessage('');
        setPage(1);
        setSelectedIds([]);

        void fetchItems(initialSearch, 1, pageSize);
    };

    const handleSelectOne = (id: number, checked: boolean) => {
        setSelectedIds((prev) => (checked ? [...new Set([...prev, id])] : prev.filter((selectedId) => selectedId !== id)));
    };

    const handleSelectAll = (checked: boolean) => {
        const pageIds = items.map((item) => item.id);

        setSelectedIds((prev) => (checked ? [...new Set([...prev, ...pageIds])] : prev.filter((id) => !pageIds.includes(id))));
    };

    // 페이지 이동 시 다른 페이지의 품목 선택 유지
    const handlePageChange = (nextPage: number) => {
        const lastPage = Math.max(1, Math.ceil(totalCount / pageSize));
        if (loading || deleting || nextPage < 1 || nextPage > lastPage) return;

        setPage(nextPage);

        void fetchItems(search, nextPage, pageSize);
    };

    // 페이지당 표시 개수 변경 시 품목 선택 유지
    const handlePageSizeChange = (nextPageSize: number) => {
        if (loading || deleting) return;

        setPageSize(nextPageSize);
        setPage(1);

        void fetchItems(search, 1, nextPageSize);
    };
    const handleEdit = (item: ItemManagement) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const fetchItems = async (conditions: ItemSearchConditions, targetPage = page, targetPageSize = pageSize) => {
        setLoading(true);
        setErrorMessage('');

        try {
            let query = supabase.from('items').select('*', { count: 'exact' });

            // 품목코드 검색
            if (conditions.item_code.trim()) {
                query = query.ilike('item_code', `%${conditions.item_code.trim()}%`);
            }

            // 품목명 검색
            if (conditions.item_name.trim()) {
                query = query.ilike('item_name', `%${conditions.item_name.trim()}%`);
            }

            // 품목구분 검색
            if (conditions.item_type) {
                query = query.eq('item_type', conditions.item_type);
            }

            // 사용여부 검색
            if (conditions.is_active !== '') {
                query = query.eq('is_active', conditions.is_active === 'true');
            }

            // 페이지네이션 범위 계산
            const from = (targetPage - 1) * targetPageSize;
            const to = from + targetPageSize - 1;

            const { data, error, count } = await query.order('id', { ascending: true }).range(from, to);

            if (error) {
                throw error;
            }

            const resultCount = count ?? 0;
            const lastPage = Math.max(1, Math.ceil(resultCount / targetPageSize));

            // 마지막 페이지보다 큰 페이지를 요청한 경우
            if (targetPage > lastPage) {
                setPage(lastPage);
                await fetchItems(conditions, lastPage, targetPageSize);
                return;
            }

            setItems(data ?? []);
            setTotalCount(resultCount);
        } catch (error) {
            console.error('품목 조회 실패:', error);
            setErrorMessage('품목을 조회하지 못했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 선택한 품목 엑셀 다운로드 기능
    const handleExcelDownload = async () => {
        if (loading || deleting || downloading) return;
        if (selectedIds.length === 0) {
            alert('엑셀로 다운로드할 품목을 선택해주세요.');
            return;
        }

        // 다운로드할 품목 선택값 유지
        const idsToDownload = [...selectedIds];
        setDownloading(true);
        try {
            const { data: selectedItems, error } = await supabase
                .from('items')
                .select('*')
                .in('id', idsToDownload)
                .order('id', { ascending: true });

            if (error) {
                throw error;
            }

            // 선택한 품목 전체 조회 여부 확인
            if (!selectedItems || selectedItems.length !== idsToDownload.length) {
                alert('선택한 품목 중 조회할 수 없는 데이터가 있습니다.');
                return;
            }

            const ExcelJS = (await import('exceljs')).default;

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('품목관리');

            worksheet.columns = [
                { header: '품목코드', key: 'itemCode', width: 22 },
                { header: '품목명', key: 'itemName', width: 25 },
                { header: '품목구분', key: 'itemType', width: 15 },
                { header: '단위', key: 'unit', width: 10 },
                { header: '사용여부', key: 'isActive', width: 15 },
                { header: '등록일시', key: 'createdAt', width: 25 },
            ];

            // 품목 목록과 동일한 표시값으로 엑셀 행 생성
            selectedItems.forEach((item: ItemManagement) => {
                worksheet.addRow({
                    itemCode: item.item_code,
                    itemName: item.item_name,
                    itemType: itemTypeLabels[item.item_type] ?? item.item_type,
                    unit: item.unit,
                    isActive: item.is_active ? '사용' : '미사용',
                    createdAt: new Date(item.created_at).toLocaleString('ko-KR'),
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

            // 품목 컬럼 6개에 필터 적용 및 제목 행 고정
            worksheet.autoFilter = {
                from: 'A1',
                to: 'F1',
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
            link.download = `items_${today}.xlsx`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            setTimeout(() => URL.revokeObjectURL(url), 1000);
        } catch (error) {
            console.error('엑셀 다운로드 실패:', error);
            alert('엑셀 다운로드 중 오류가 발생했습니다.');
        } finally {
            setDownloading(false);
        }
    };

    const handleDeleteSelected = async () => {
        if (employee?.role !== 'ADMIN' || deleting || loading || selectedIds.length === 0) {
            return;
        }

        const idsToDelete = [...selectedIds];

        const confirmed = window.confirm(`선택한 품목 ${idsToDelete.length}건을 삭제하시겠습니까?\n삭제 후 복구할 수 없습니다.`);

        if (!confirmed) return;

        setDeleting(true);
        setErrorMessage('');

        try {
            const { data, error } = await supabase.from('items').delete().in('id', idsToDelete).select('id');

            if (error) throw error;

            setSelectedIds([]);

            await fetchItems(search, page, pageSize);

            if (!data || data.length !== idsToDelete.length) {
                setErrorMessage('일부 품목이 삭제되지 않았습니다. 목록을 확인해 주세요.');
            }
        } catch (error) {
            console.error('품목 삭제 실패:', error);
            setErrorMessage('품목 삭제 중 오류가 발생했습니다.');
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        void fetchItems(initialSearch, 1, 10);
    }, []);

    return (
        <div className="mes-input-flex-option">
            <h1 className="mes-main-title">품목관리</h1>
            <ItemManagementSearch
                search={search}
                loading={loading}
                errorMessage={errorMessage}
                onChange={setSearch}
                onSearch={onSearch}
                onReset={onReset}
            />
            <section className="mes-box">
                <div className="flex flex-row justify-between items-center mb-2">
                    <div className="flex flex-row items-center gap-3">
                        <h2 className="mes-sub-title">품목 목록</h2>
                        <p className="text-lg bg-gray-100 p-3 py-1 rounded-full font-medium"> {totalCount}건</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            className="mes-button mes-button-outline"
                            onClick={handleExcelDownload}
                            disabled={loading || deleting || downloading || selectedIds.length === 0}
                        >
                            {downloading ? '다운로드 중...' : '엑셀 다운로드'}
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
                                    setSelectedItem(null);
                                    setIsModalOpen(true);
                                }}
                            >
                                + 등록
                            </button>
                        )}
                    </div>
                </div>

                <ItemManagementTable
                    items={items}
                    page={page}
                    pageSize={pageSize}
                    loading={loading}
                    deleting={deleting}
                    selectedIds={selectedIds}
                    canRegister={canRegister}
                    onSelectOne={handleSelectOne}
                    onSelectAll={handleSelectAll}
                    onEdit={handleEdit}
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
                <ItemManagementModal
                    item={selectedItem}
                    onClose={() => {
                        setIsModalOpen(false);
                        setSelectedItem(null);
                    }}
                    onSaved={() => {
                        setSelectedIds([]);
                        setSearch({ ...initialSearch });
                        setPage(1);
                        void fetchItems(initialSearch, 1, pageSize);
                    }}
                />
            )}
        </div>
    );
}
