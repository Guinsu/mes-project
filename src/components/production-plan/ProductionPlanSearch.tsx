import type { SearchConditions } from '../../types/productionPlan';

type ProductionPlanSearchProps = {
    search: SearchConditions;
    loading: boolean;
    deleting: boolean;
    errorMessage: string;
    onChange: (search: SearchConditions) => void;
    onSearch: () => void;
    onReset: () => void;
};

// 생산계획 검색 입력 항목 설정
const searchFields = [
    { id: 'planNo', label: '계획번호', placeholder: '계획번호를 입력하세요.' },
    { id: 'itemCode', label: '품목코드', placeholder: '품목코드를 입력하세요.' },
    { id: 'itemName', label: '품목명', placeholder: '품목명을 입력하세요.' },
] as const;

export function ProductionPlanSearch({ search, loading, deleting, errorMessage, onChange, onSearch, onReset }: ProductionPlanSearchProps) {
    // 조회 및 삭제 중 조회와 초기화 버튼 사용 제한
    const disabled = loading || deleting;

    return (
        <section className="mes-box">
            <h2 className="mes-sub-title mb-2">조회조건</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
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
                    <label htmlFor="status" className="font-medium">
                        상태
                    </label>

                    <select
                        id="status"
                        className="mes-input-style"
                        value={search.status}
                        onChange={(e) =>
                            onChange({
                                ...search,
                                status: e.target.value,
                            })
                        }
                    >
                        <option value="">전체</option>
                        <option value="WAITING">대기</option>
                        <option value="IN_PROGRESS">진행중</option>
                        <option value="COMPLETED">완료</option>
                        <option value="CANCELLED">취소</option>
                    </select>
                </div>

                <div className="mes-input-flex-option">
                    {/* 조회할 계획기간 설정 */}
                    <label className="font-medium">계획기간</label>

                    <div className="flex items-center gap-1">
                        <input
                            type="date"
                            id="startDate"
                            className="mes-input-style flex-1 min-w-0"
                            aria-label="계획 시작일"
                            value={search.startDate}
                            onChange={(e) =>
                                onChange({
                                    ...search,
                                    startDate: e.target.value,
                                })
                            }
                        />

                        <span>~</span>

                        <input
                            type="date"
                            id="endDate"
                            className="mes-input-style flex-1 min-w-0"
                            aria-label="계획 종료일"
                            value={search.endDate}
                            onChange={(e) =>
                                onChange({
                                    ...search,
                                    endDate: e.target.value,
                                })
                            }
                        />
                    </div>
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

            {/* 생산계획 조회 오류 표시 */}
            {errorMessage && (
                <p role="alert" className="mt-2 text-sm text-red-600">
                    {errorMessage}
                </p>
            )}
        </section>
    );
}
