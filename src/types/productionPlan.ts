export type ProductionPlan = {
    id: number;
    plan_no: string;
    item_code: string;
    item_name: string;
    quantity: number;
    start_date: string;
    end_date: string;
    status: string;
    created_at: string;
};

export const statusLabels: Record<string, string> = {
    WAITING: '대기',
    IN_PROGRESS: '진행중',
    COMPLETED: '완료',
    CANCELLED: '취소',
};

export type SearchConditions = {
    planNo: string;
    itemCode: string;
    itemName: string;
    status: string;
    startDate: string;
    endDate: string;
};

export const emptySearch: SearchConditions = {
    planNo: '',
    itemCode: '',
    itemName: '',
    status: '',
    startDate: '',
    endDate: '',
};
