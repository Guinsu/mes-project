import type { ItemSearchConditions } from '../../types/ItemManagement';
import { itemTypeLabels } from '../../types/ItemManagement';

type ItemManagementSearchProps = {
    search: ItemSearchConditions;
    loading: boolean;
    errorMessage: string;
    onChange: (search: ItemSearchConditions) => void;
    onSearch: () => void;
    onReset: () => void;
};

// 품목 검색 입력 항목 설정
const searchFields = [
    { id: 'item_code', label: '제품코드', placeholder: '제품코드를 입력하세요.' },
    { id: 'item_name', label: '제품이름', placeholder: '제품이름을 입력하세요.' },
] as const;

export function ItemManagementSearch({ search, loading, errorMessage, onChange, onSearch, onReset }: ItemManagementSearchProps) {
    // 조회 중 조회 및 초기화 버튼 사용 제한
    const disabled = loading;
    return (
        <section className="mes-box">
            <h2 className="mes-sub-title mb-2">조회조건</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {/* 검색 입력값을 부모 페이지에 전달 */}
                {searchFields.map((field) => (
                    <div key={field.id} className="mes-input-flex-option">
                        <label htmlFor={field.id} className="font-medium">
                            {field.label}
                        </label>
                        <input
                            type="text"
                            id={field.id}
                            className="mes-input-style"
                            placeholder={field.placeholder}
                            value={search[field.id]}
                            onChange={(e) =>
                                onChange({
                                    ...search,
                                    [field.id]: e.target.value,
                                })
                            }
                        />
                    </div>
                ))}

                <div className="mes-input-flex-option">
                    <label htmlFor="category" className="font-medium">
                        품목구분
                    </label>

                    <select
                        id="category"
                        className="mes-input-style"
                        value={search.item_type}
                        onChange={(e) =>
                            onChange({
                                ...search,
                                item_type: e.target.value,
                            })
                        }
                    >
                        <option value="">전체</option>
                        {/* 등록 화면과 동일한 품목구분 사용 */}
                        {Object.entries(itemTypeLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mes-input-flex-option">
                    <label htmlFor="active" className="font-medium">
                        사용여부
                    </label>

                    <select
                        id="active"
                        className="mes-input-style"
                        value={search.is_active}
                        onChange={(e) =>
                            onChange({
                                ...search,
                                is_active: e.target.value,
                            })
                        }
                    >
                        <option value="">전체</option>
                        <option value="true">사용</option>
                        <option value="false">미사용</option>
                    </select>
                </div>
            </div>
            <div className="flex justify-end gap-2 mt-3">
                <button type="button" className="mes-button mes-button-outline" onClick={onReset} disabled={disabled}>
                    초기화
                </button>

                <button type="button" className="mes-button mes-button-primary" onClick={onSearch} disabled={disabled}>
                    {loading ? '조회 중...' : '조회'}
                </button>
            </div>

            {/* 품목 조회 오류 표시 */}
            {errorMessage && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                    {errorMessage}
                </p>
            )}
        </section>
    );
}
