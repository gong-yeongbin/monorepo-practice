import { useLayoutEffect, useRef, useState } from 'react';

/**
 * 컨테이너 바닥까지 antd Table 목록이 채우도록 `scroll.y` 값을 잰다.
 * 목록 위 요소(버튼·헤더) 높이를 상수로 추측하면 헤더 줄바꿈 때 어긋나므로 실제 위치를 잰다.
 */
export const useFillHeight = () => {
	const containerRef = useRef<HTMLDivElement>(null);
	const [height, setHeight] = useState(0);

	useLayoutEffect(() => {
		const container = containerRef.current;
		if (!container) {
			return;
		}

		const measure = () => {
			const tableBody = container.querySelector('.ant-table-body');
			if (tableBody) {
				setHeight(Math.floor(container.getBoundingClientRect().bottom - tableBody.getBoundingClientRect().top));
			}
		};

		measure();
		const observer = new ResizeObserver(measure);
		observer.observe(container);
		return () => observer.disconnect();
	}, []);

	return [containerRef, height] as const;
};
