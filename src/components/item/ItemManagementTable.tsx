import { DataTable, type TableColumn } from '../common/DataTable';
import { type ItemManagement, itemTypeLabels } from '../../types/ItemManagement';

type ItemManagementTableProps = {
    items: ItemManagement[];
    page: number;
    pageSize: number;
    loading: boolean;
    deleting: boolean;
    selectedIds: number[];
    canRegister: boolean;
    onSelectOne: (id: number, checked: boolean) => void;
    onSelectAll: (checked: boolean) => void;
    onEdit: (item: ItemManagement) => void;
};

export function ItemManagementTable({
    items,
    page,
    pageSize,
    loading,
    deleting,
    selectedIds,
    canRegister,
    onSelectOne,
    onSelectAll,
    onEdit,
}: ItemManagementTableProps) {
    // 조회 및 삭제 중 선택과 수정 제한
    const isDisabled = loading || deleting;

    // 현재 페이지 품목 전체 선택 여부 확인
    const allSelected = items.length > 0 && items.every((item) => selectedIds.includes(item.id));

    // 품목 목록 컬럼 및 표시 방식 설정
    const columns: TableColumn<ItemManagement>[] = [
        {
            key: 'rowNo',
            label: 'No.',
            width: 50,
            fixed: true,
            align: 'center',
            // 페이지에 이어지는 행 번호 계산
            render: (_, index) => (page - 1) * pageSize + index + 1,
        },
        {
            key: 'select',
            label: '선택',
            width: 50,
            fixed: true,
            align: 'center',
            header: (
                <input
                    type="checkbox"
                    aria-label="현재 페이지 전체 선택"
                    className="h-4 w-4 align-middle"
                    checked={allSelected}
                    disabled={isDisabled || items.length === 0}
                    onChange={(e) => onSelectAll(e.target.checked)}
                />
            ),
            render: (item) => (
                <input
                    type="checkbox"
                    aria-label={`${item.item_code} 선택`}
                    className="h-4 w-4 align-middle"
                    checked={selectedIds.includes(item.id)}
                    disabled={isDisabled}
                    onChange={(e) => onSelectOne(item.id, e.target.checked)}
                />
            ),
        },
        {
            key: 'itemCode',
            label: '품목코드',
            width: 140,
            render: (item) => item.item_code,
        },
        {
            key: 'itemName',
            label: '품목명',
            width: 200,
            render: (item) => item.item_name,
        },
        {
            key: 'itemType',
            label: '품목구분',
            width: 120,
            render: (item) => itemTypeLabels[item.item_type] ?? item.item_type,
        },
        {
            key: 'unit',
            label: '단위',
            width: 90,
            align: 'center',
            render: (item) => item.unit,
        },
        {
            key: 'isActive',
            label: '사용여부',
            width: 100,
            align: 'center',
            render: (item) => (item.is_active ? '사용' : '미사용'),
        },
        {
            key: 'createdAt',
            label: '등록일시',
            width: 170,
            render: (item) => new Date(item.created_at).toLocaleString('ko-KR'),
        },
    ];

    // 등록 권한이 있는 사용자에게 수정 버튼 표시
    if (canRegister) {
        columns.push({
            key: 'actions',
            label: '관리',
            width: 80,
            fixed: true,
            align: 'center',
            render: (item) => (
                <div className="flex items-center justify-center">
                    <button
                        type="button"
                        className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                        disabled={isDisabled}
                        onClick={() => onEdit(item)}
                    >
                        수정
                    </button>
                </div>
            ),
        });
    }

    // 공통 테이블에 품목 데이터 및 컬럼 전달
    return (
        <DataTable data={items} columns={columns} getRowKey={(item) => item.id} loading={loading} emptyMessage="조회된 품목이 없습니다." />
    );
}
