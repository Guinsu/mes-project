export type ItemManagement = {
    id: number;
    item_code: string;
    item_name: string;
    item_type: string;
    unit: string;
    is_active: boolean;
    created_at: string;
};

export type ItemSearchConditions = {
    item_code: string;
    item_name: string;
    item_type: string;
    is_active: string;
};

export const itemTypeLabels: Record<string, string> = {
    RAW: '원자재',
    SEMI: '반제품',
    PRODUCT: '완제품',
};
