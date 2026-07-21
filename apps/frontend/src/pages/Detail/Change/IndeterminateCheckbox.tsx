import React, { forwardRef, useEffect, useRef } from 'react';

interface ICheckBoxProps extends React.InputHTMLAttributes<HTMLInputElement> {
	indeterminate?: boolean;
}

const IndeterminateCheckbox = forwardRef<HTMLInputElement, ICheckBoxProps>((props, ref) => {
	const { indeterminate, ...rest } = props;
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
});

export default IndeterminateCheckbox;
