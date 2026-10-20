import { useState, type SubmitEvent } from 'react';
import { supabase } from '../../lib/supabase';
import type { ProductionPlan } from '../../types/productionPlan';

type Props = {
    plan?: ProductionPlan | null;
    onClose: () => void;
    onSaved: () => void;
};

export function ProductionPlanModal({ plan, onClose, onSaved }: Props) {
    // 수정할 생산계획 정보 또는 신규 등록 기본값 설정
    const [form, setForm] = useState({
        plan_no: plan?.plan_no ?? '',
        item_code: plan?.item_code ?? '',
        item_name: plan?.item_name ?? '',
        quantity: plan ? String(plan.quantity) : '',
        start_date: plan?.start_date ?? '',
        end_date: plan?.end_date ?? '',
    });
    const [saving, setSaving] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // 생산계획 등록 및 수정 기능
    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMessage('');

        const quantity = Number(form.quantity);

        // 계획수량의 양의 정수 여부 확인
        if (!Number.isSafeInteger(quantity) || quantity <= 0) {
            setErrorMessage('계획수량은 1 이상의 정수여야 합니다.');
            return;
        }

        // 필수 입력값 확인
        if (!form.plan_no.trim() || !form.item_code.trim() || !form.item_name.trim()) {
            setErrorMessage('필수 항목을 입력해 주세요.');
            return;
        }

        // 계획기간 입력 여부 확인
        if (!form.start_date || !form.end_date) {
            setErrorMessage('계획기간을 입력해 주세요.');
            return;
        }

        // 계획 시작일과 종료일 순서 확인
        if (form.start_date > form.end_date) {
            setErrorMessage('종료일은 시작일보다 빠를 수 없습니다.');
            return;
        }

        setSaving(true);

        try {
            // 등록 및 수정에 사용할 저장값 설정
            const values = {
                plan_no: form.plan_no.trim(),
                item_code: form.item_code.trim(),
                item_name: form.item_name.trim(),
                quantity,
                start_date: form.start_date,
                end_date: form.end_date,
            };

            let error;

            // 선택한 생산계획 수정 기능
            if (plan) {
                const result = await supabase.from('production_plans').update(values).eq('id', plan.id).select('id');

                error = result.error;

                // 수정 대상 존재 여부 및 수정 권한 확인
                if (!error && (!result.data || result.data.length === 0)) {
                    setErrorMessage('수정할 생산계획이 없거나 수정 권한이 없습니다.');
                    return;
                }
            } else {
                // 신규 생산계획을 대기 상태로 등록
                const result = await supabase.from('production_plans').insert({
                    ...values,
                    status: 'WAITING',
                });

                error = result.error;
            }

            // 계획번호 중복 및 저장 오류 확인
            if (error) {
                if (error.code === '23505') {
                    setErrorMessage('이미 등록된 계획번호입니다.');
                } else {
                    console.error('생산계획 저장 실패:', error);
                    setErrorMessage('생산계획 저장에 실패했습니다.');
                }
                return;
            }

            // 저장 완료 후 목록 갱신 요청 및 모달 닫기
            onSaved();
            onClose();
        } catch (error) {
            console.error('생산계획 저장 오류:', error);
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
                aria-labelledby="production-plan-modal-title"
                className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl"
            >
                <div className="mb-5 flex items-center justify-between">
                    <h2 id="production-plan-modal-title" className="text-xl font-semibold">
                        {plan ? '생산계획 수정' : '생산계획 등록'}
                    </h2>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {(
                            [
                                ['plan_no', '계획번호', 'text'],
                                ['item_code', '품목코드', 'text'],
                                ['item_name', '품목명', 'text'],
                                ['quantity', '계획수량', 'number'],
                                ['start_date', '계획시작일', 'date'],
                                ['end_date', '계획종료일', 'date'],
                            ] as const
                        ).map(([key, label, type]) => (
                            <div key={key} className="mes-input-flex-option">
                                <label htmlFor={key} className="font-medium">
                                    {label} *
                                </label>
                                <input
                                    id={key}
                                    type={type}
                                    className="mes-input-style"
                                    value={form[key]}
                                    min={type === 'number' ? 1 : undefined}
                                    step={type === 'number' ? 1 : undefined}
                                    required
                                    onChange={(e) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            [key]: e.target.value,
                                        }))
                                    }
                                />
                            </div>
                        ))}
                    </div>

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
                            {saving ? '저장 중...' : plan ? '수정 완료' : '등록'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
