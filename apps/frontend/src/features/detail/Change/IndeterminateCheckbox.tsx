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
		<div style={{ display: 'flex' }}>
			<input type="checkbox" ref={resolvedRef} {...rest} />
		</div>
	);
};

export default IndeterminateCheckbox;
