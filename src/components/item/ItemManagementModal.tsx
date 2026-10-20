import { useState, type SubmitEvent } from 'react';
import { supabase } from '../../lib/supabase';
import { itemTypeLabels, type ItemManagement } from '../../types/ItemManagement';

type Props = {
    item?: ItemManagement | null;
    onClose: () => void;
    onSaved: () => void;
};

export function ItemManagementModal({ item, onClose, onSaved }: Props) {
    // 수정할 품목 정보 또는 신규 등록 기본값 설정
    const [form, setForm] = useState({
        item_code: item?.item_code ?? '',
        item_name: item?.item_name ?? '',
        item_type: item?.item_type ?? '',
        unit: item?.unit ?? 'EA',
        is_active: item?.is_active ?? true,
    });
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // 품목 등록 및 수정 기능
    const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        // 저장 중 중복 요청 방지
        if (saving) return;
        setErrorMessage('');

        // 입력값 앞뒤 공백 제거
        const values = {
            ...form,
            item_code: form.item_code.trim(),
            item_name: form.item_name.trim(),
            unit: form.unit.trim(),
        };
        // 필수 입력값 확인
        if (!values.item_code || !values.item_name || !values.item_type || !values.unit) {
            setErrorMessage('품목코드, 품목명, 품목구분, 단위를 입력해 주세요.');
            return;
        }

        setSaving(true);
        try {
            // 선택한 품목이 있으면 수정하고 없으면 신규 등록
            const result = item
                ? await supabase.from('items').update(values).eq('id', item.id).select('id')
                : await supabase.from('items').insert(values).select('id');

            // 품목코드 중복 및 저장 오류 확인
            if (result.error) {
                console.error('품목 저장 실패:', result.error);
                setErrorMessage(
                    result.error.code === '23505'
                        ? '이미 등록된 품목코드입니다.'
                        : '품목 저장에 실패했습니다. 입력값과 저장 권한을 확인해 주세요.',
                );
                return;
            }
            // 오류 없이 수정 대상이 제외되는 경우를 대비한 저장 결과 확인
            if (!result.data || result.data.length === 0) {
                setErrorMessage('저장된 품목을 확인할 수 없습니다. 품목의 존재 여부와 권한을 확인해 주세요.');
                return;
            }
            // 저장 완료 후 목록 갱신 요청 및 모달 닫기
            onSaved();
            onClose();
        } catch (error) {
            console.error('품목 저장 오류:', error);
            setErrorMessage('서버 연결 중 오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="item-modal-title"
                className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
            >
                <h2 id="item-modal-title" className="mb-5 text-xl font-semibold">
                    {item ? '품목 수정' : '품목 등록'}
                </h2>
                <form onSubmit={handleSubmit}>
                    <fieldset disabled={saving} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {(
                            [
                                ['item_code', '품목코드'],
                                ['item_name', '품목명'],
                                ['unit', '단위'],
                            ] as const
                        ).map(([key, label]) => (
                            <div key={key} className="mes-input-flex-option">
                                <label htmlFor={`item-modal-${key}`} className="font-medium">
                                    {label} *
                                </label>
                                <input
                                    id={`item-modal-${key}`}
                                    type="text"
                                    className="mes-input-style"
                                    value={form[key]}
                                    required
                                    autoFocus={key === 'item_code'}
                                    onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                                />
                            </div>
                        ))}
                        <div className="mes-input-flex-option">
                            <label htmlFor="item-modal-type" className="font-medium">
                                품목구분 *
                            </label>
                            <select
                                id="item-modal-type"
                                className="mes-input-style"
                                value={form.item_type}
                                required
                                onChange={(event) => setForm((prev) => ({ ...prev, item_type: event.target.value }))}
                            >
                                <option value="">선택하세요</option>
                                {Object.entries(itemTypeLabels).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mes-input-flex-option">
                            <label htmlFor="item-modal-active" className="font-medium">
                                사용여부
                            </label>
                            <select
                                id="item-modal-active"
                                className="mes-input-style"
                                value={String(form.is_active)}
                                onChange={(event) => setForm((prev) => ({ ...prev, is_active: event.target.value === 'true' }))}
                            >
                                <option value="true">사용</option>
                                <option value="false">미사용</option>
                            </select>
                        </div>
                    </fieldset>
                    {errorMessage && (
                        <p role="alert" className="mt-4 text-sm text-red-600">
                            {errorMessage}
                        </p>
                    )}
                    <div className="mt-6 flex justify-end gap-2">
                        <button type="button" className="mes-button mes-button-outline" onClick={onClose} disabled={saving}>
                            취소
                        </button>
                        <button type="submit" className="mes-button mes-button-primary" disabled={saving}>
                            {saving ? '저장 중...' : item ? '수정 완료' : '등록'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
