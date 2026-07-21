/// <reference types="vite/client" />

// moment 로케일은 side-effect import만 하므로 타입 선언이 없어 shim을 둔다.
declare module 'moment/locale/ko';
