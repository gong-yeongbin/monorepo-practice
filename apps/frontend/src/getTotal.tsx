import React, { useMemo } from 'react';

const getTotal = (info: any) => {
	const rows = info.table.getRowModel().rows;
	const columnName = info.column.id;
	if (columnName === 'cvr') {
		const total = useMemo(
			() => rows.reduce((sum: any, row: any) => row.original.cvr + sum, 0),
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
				(sum: number, row: any) =>
					parseInt(
						row.original[columnName].includes(',')
							? row.original[columnName].replaceAll(',', '')
							: row.original[columnName],
						10,
					) + sum,
				0,
			),
		[rows],
	);
	return <div className="total">{total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</div>;
};

export { getTotal };
