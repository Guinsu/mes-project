import type { ReactNode } from 'react';

export type TableColumn<T> = {
    key: string;
    label: string;
    width?: number;
    fixed?: boolean;
    align?: 'left' | 'center' | 'right';
    header?: ReactNode;
    render: (row: T, index: number) => ReactNode;
};

type DataTableProps<T> = {
    data: T[];
    columns: TableColumn<T>[];
    getRowKey: (row: T) => string | number;
    loading?: boolean;
    emptyMessage?: string;
};

export function DataTable<T>({ data, columns, getRowKey, loading = false, emptyMessage = '조회된 데이터가 없습니다.' }: DataTableProps<T>) {
    return (
        <div className="overflow-x-auto overflow-y-auto">
            <table className="w-full min-w-max border-collapse text-[13px]">
                <thead className="sticky top-0 z-10 bg-gray-100">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                style={
                                    column.width
                                        ? column.fixed
                                            ? {
                                                  width: column.width,
                                                  minWidth: column.width,
                                                  maxWidth: column.width,
                                              }
                                            : { minWidth: column.width }
                                        : undefined
                                }
                                className={`border border-border px-3 py-2 ${
                                    column.align === 'center' ? 'text-center' : column.align === 'right' ? 'text-right' : 'text-left'
                                }`}
                            >
                                {column.header ?? column.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="border border-border p-6 text-center text-slate-500">
                                {loading ? '조회 중...' : emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((row, index) => (
                            <tr key={getRowKey(row)} className="hover:bg-gray-50">
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={`border border-border px-3 py-1.5 ${
                                            column.align === 'center'
                                                ? 'text-center'
                                                : column.align === 'right'
                                                  ? 'text-right'
                                                  : 'text-left'
                                        }`}
                                    >
                                        {column.render(row, index)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
