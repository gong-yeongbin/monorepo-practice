import React, { useEffect, useRef } from 'react';

interface ICheckBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
	indeterminate?: boolean;
	ref?: React.Ref<HTMLInputElement>;
}

// React 19부터 ref를 일반 prop으로 받을 수 있어 forwardRef 래퍼를 제거했다.
const IndeterminateCheckbox = ({ indeterminate, ref, ...rest }: ICheckBoxProps) => {
	const defaultRef = useRef<HTMLInputElement>(null);
	const resolvedRef = ref || defaultRef;

	useEffect(() => {
		if (typeof resolvedRef === 'object' && resolvedRef.current) {
			resolvedRef.current.indeterminate = Boolean(indeterminate);
		}
	}, [resolvedRef, indeterminate]);

	return (
		// row 클릭(조회용 캠페인 선택)과 체크박스 클릭(예약 생성 대상 선택)이 섞이지 않게 전파를 끊는다
		<div style={{ display: 'flex', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
			<input type="checkbox" ref={resolvedRef} {...rest} />
		</div>
	);
};

export default IndeterminateCheckbox;
