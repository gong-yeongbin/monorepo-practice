import React, { useMemo } from 'react';

const getTotal = (info: any) => {
	const { rows } = info;
	const columnName = info.column.id;
	if (columnName === 'cvr') {
		const total = useMemo(
			() => rows.reduce((sum: any, row: { values: { cvr: number } }) => row.values.cvr + sum, 0),
			[rows],
		);
		return (
			<div className="total">
				{total
					.toFixed(2)
					.toString()
					.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
				%
			</div>
		);
	}
	const total = useMemo(
		() =>
			rows.reduce(
				(sum: number, row: { values: { [x: string]: string } }) =>
					parseInt(
						row.values[columnName].includes(',')
							? row.values[columnName].replaceAll(',', '')
							: row.values[columnName],
						10,
					) + sum,
				0,
			),
		[rows],
	);
	return <div className="total">{total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>;
};

export { getTotal };
