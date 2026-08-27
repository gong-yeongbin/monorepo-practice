// access token payload로 광고 스코프를 계산한다 — DEVELOPER·ADMIN은 면제, USER만 허용 목록으로 제한한다
import { AccessTokenPayload } from '@auth/application/token.constants';

// undefined = 제한 없음(면제), [] = 아무 광고도 볼 수 없음(전체 허용 아님)
export type AdvertisingScope = number[] | undefined;

// 스코핑 면제 분기는 여기 한 곳뿐이다. 컨트롤러·use-case·repository에서 role을 다시 보지 않는다.
// ?? []가 중요하다 — advertising_ids가 없던 시절 발급된 access token이 만료(15분) 전까지 살아 있다.
// 이때 undefined를 면제로 흘리면 스코핑이 뚫리므로 빈 배열로 떨어뜨려 차단하고, 재발급 후 정상화되게 한다.
export const advertisingScopeOf = (user: AccessTokenPayload): AdvertisingScope => (user.role === 'USER' ? (user.advertising_ids ?? []) : undefined);

// 단건(id·token) 경로용 판정. 목록·집계 경로는 repository가 SQL에서 거른다.
export const isAdvertisingAllowed = (scope: AdvertisingScope, advertising_id: number): boolean => scope === undefined || scope.includes(advertising_id);
