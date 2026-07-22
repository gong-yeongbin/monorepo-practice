// ResponseInterceptor 래핑({ statusCode, data, _meta })을 그대로 반영한 Swagger 성공 응답 데코레이터
import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

interface ApiWrappedResponseOptions {
	status?: number;
	description?: string;
	// data에 담기는 응답 클래스. 생략하면 data 없이 { statusCode, _meta }만 문서화한다(void 응답)
	type?: Type<unknown>;
	isArray?: boolean;
}

export const ApiWrappedResponse = ({ status = 200, description, type, isArray }: ApiWrappedResponseOptions) => {
	const data = type ? (isArray ? { type: 'array', items: { $ref: getSchemaPath(type) } } : { $ref: getSchemaPath(type) }) : undefined;
	const response = ApiResponse({
		status,
		description,
		schema: {
			type: 'object',
			properties: {
				statusCode: { type: 'number', example: status },
				...(data ? { data } : {}),
				_meta: { type: 'object', additionalProperties: true, description: '요청 body·query를 그대로 담은 메타' },
			},
		},
	});
	return type ? applyDecorators(ApiExtraModels(type), response) : response;
};
