import { DataTable, type TableColumn } from '../common/DataTable';
import { type ProductionPlan, statusLabels } from '../../types/productionPlan';

type ProductionPlanTableProps = {
    plans: ProductionPlan[];
    page: number;
    pageSize: number;
    loading: boolean;
    deleting: boolean;
    selectedIds: number[];
    canRegister: boolean;
    onSelectOne: (id: number, checked: boolean) => void;
    onSelectAll: (checked: boolean) => void;
    onEdit: (plan: ProductionPlan) => void;
};

export function ProductionPlanTable({
    plans,
    page,
    pageSize,
    loading,
    deleting,
    selectedIds,
    canRegister,
    onSelectOne,
    onSelectAll,
    onEdit,
}: ProductionPlanTableProps) {
    const isDisabled = loading || deleting;

    const allSelected = plans.length > 0 && plans.every((plan) => selectedIds.includes(plan.id));

    const columns: TableColumn<ProductionPlan>[] = [
        {
            key: 'rowNo',
            label: 'No.',
            width: 50,
            fixed: true,
            align: 'center',
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
                    disabled={isDisabled || plans.length === 0}
                    onChange={(e) => onSelectAll(e.target.checked)}
                />
            ),
            render: (plan) => (
                <input
                    type="checkbox"
                    aria-label={`${plan.plan_no} 선택`}
                    className="h-4 w-4 align-middle"
                    checked={selectedIds.includes(plan.id)}
                    disabled={isDisabled}
                    onChange={(e) => onSelectOne(plan.id, e.target.checked)}
                />
            ),
        },
        {
            key: 'planNo',
            label: '계획번호',
            width: 140,
            render: (plan) => plan.plan_no,
        },
        {
            key: 'itemCode',
            label: '품목코드',
            width: 140,
            render: (plan) => plan.item_code,
        },
        {
            key: 'itemName',
            label: '품목명',
            width: 180,
            render: (plan) => plan.item_name,
        },
        {
            key: 'quantity',
            label: '계획수량',
            width: 120,
            align: 'right',
            render: (plan) => plan.quantity.toLocaleString(),
        },
        {
            key: 'unit',
            label: '단위',
            width: 90,
            render: () => 'EA',
        },
        {
            key: 'startDate',
            label: '계획시작일',
            width: 140,
            render: (plan) => plan.start_date,
        },
        {
            key: 'endDate',
            label: '계획종료일',
            width: 140,
            render: (plan) => plan.end_date,
        },
        {
            key: 'status',
            label: '상태',
            width: 110,
            render: (plan) => statusLabels[plan.status] ?? plan.status,
        },
        {
            key: 'createdAt',
            label: '등록일시',
            width: 170,
            render: (plan) => new Date(plan.created_at).toLocaleString('ko-KR'),
        },
    ];

    if (canRegister) {
        columns.push({
            key: 'actions',
            label: '관리',
            width: 80,
            fixed: true,
            align: 'center',
            render: (plan) => (
                <div className="flex items-center justify-center">
                    <button
                        type="button"
                        className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50"
                        onClick={() => onEdit(plan)}
                    >
                        수정
                    </button>
                </div>
            ),
        });
    }

    return (
        <DataTable
            data={plans}
            columns={columns}
            getRowKey={(plan) => plan.id}
            loading={loading}
            emptyMessage="조회된 생산계획이 없습니다."
        />
    );
}
