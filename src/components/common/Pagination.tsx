type PaginationProps = {
    page: number;
    pageSize: number;
    totalCount: number;
    loading?: boolean;
    disabled?: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
};

export function Pagination({
    page,
    pageSize,
    totalCount,
    loading = false,
    disabled = false,
    onPageChange,
    onPageSizeChange,
}: PaginationProps) {
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

    const visiblePageCount = 5;
    const startPage = Math.floor((page - 1) / visiblePageCount) * visiblePageCount + 1;

    const endPage = Math.min(startPage + visiblePageCount - 1, totalPages);

    const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);

    const isDisabled = loading || disabled;

    return (
        <div className="flex flex-row items-center justify-between">
            <select
                className="mes-input-style"
                aria-label="페이지당 표시 건수"
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                disabled={isDisabled}
            >
                <option value={10}>10개씩 보기</option>
                <option value={20}>20개씩 보기</option>
                <option value={30}>30개씩 보기</option>
            </select>

            <div className="flex flex-row items-center gap-1 mt-2">
                <button
                    type="button"
                    className="mes-button mes-button-outline"
                    onClick={() => onPageChange(page - 1)}
                    disabled={isDisabled || page <= 1}
                    aria-label="이전 페이지"
                >
                    &lt;
                </button>

                {pageNumbers.map((pageNumber) => (
                    <button
                        key={pageNumber}
                        type="button"
                        className={`mes-button ${page === pageNumber ? 'mes-button-primary' : 'mes-button-outline'}`}
                        onClick={() => onPageChange(pageNumber)}
                        disabled={isDisabled || page === pageNumber}
                        aria-label={`${pageNumber}페이지`}
                        aria-current={page === pageNumber ? 'page' : undefined}
                    >
                        {pageNumber}
                    </button>
                ))}

                <button
                    type="button"
                    className="mes-button mes-button-outline"
                    onClick={() => onPageChange(page + 1)}
                    disabled={isDisabled || page >= totalPages}
                    aria-label="다음 페이지"
                >
                    &gt;
                </button>
            </div>
        </div>
    );
}
