variable "project" {
  description = "리소스 네이밍 prefix"
  type        = string
  default     = "mecross"
}

variable "aws_region" {
  description = "AWS 리전"
  type        = string
  default     = "ap-northeast-2"
}

variable "domain_name" {
  description = "Route53 hosted zone 도메인 (예: example.com)"
  type        = string
}

variable "frontend_subdomain" {
  description = "frontend 서브도메인 (현재 운영 중인 어드민 화면 주소). 빈 문자열이면 apex 도메인 사용"
  type        = string
  default     = "admin"
}

# 매체·트래커에 배포된 링크의 도메인이라 변경 불가 — NLB가 이 이름을 받는다
variable "api_subdomain" {
  description = "트래킹·포스트백 서브도메인 (NLB, 평문 80)"
  type        = string
  default     = "api"
}

variable "admin_api_subdomain" {
  description = "어드민 API 서브도메인 (ALB, HTTPS). 프론트 VITE_API_URL이 가리키는 주소"
  type        = string
  default     = "admin-api"
}

# 업로드 시점의 절대 URL이 advertising.image 컬럼에 그대로 저장된다 —
# 바꾸면 그 전에 올린 이미지의 저장된 URL이 전부 깨지므로 배포 후에는 사실상 고정이다
variable "asset_subdomain" {
  description = "광고 소재 배포 서브도메인 (CloudFront, HTTPS)"
  type        = string
  default     = "asset"
}

variable "vpc_cidr" {
  description = "VPC CIDR"
  type        = string
  default     = "10.0.0.0/16"
}

variable "db_name" {
  description = "데이터베이스명"
  type        = string
  default     = "mecross"
}

variable "db_username" {
  description = "DB 마스터 사용자명"
  type        = string
  default     = "app"
}

# 사이징 근거: 일 1억 클릭 실트래픽. 기존 운영 사양(RDS xlarge급, 캐시 large급)이
# 오버스펙이라는 판단에 따라 낮춰 시작 — 부족하면 tfvars에서 올려 apply.

# 운영 중인 db.m5.xlarge(4 vCPU/16GB) 실측을 근거로 medium까지 내린다.
#   CPU 3.3%(실효 0.13 vCPU) — medium 베이스라인 0.4 vCPU의 3분의 1
#   ReadIOPS 50~90           — gp3 기본 3,000의 3% 미만. 캐시가 줄어 읽기가 10배로 늘어도 여유가 있다
#   커넥션 60                — 4GB의 max_connections 기본값 약 450
# 검증되지 않은 축은 메모리 하나다. 워킹셋이 3GB(shared_buffers 1GB + 페이지 캐시)를 넘으면 t4g.large로 올린다.
# t4g는 Unlimited 모드가 기본이라 베이스라인 초과가 스로틀링이 아니라 추가 요금으로 나타난다 —
# 전환 후 CPUCreditBalance와 CPUSurplusCreditsCharged에 알람을 걸 것.
variable "db_instance_class" {
  description = "RDS 인스턴스 클래스 (버스트 계열 — 부족 시 t4g.large, 버스트 자체가 부담되면 m6g.large로)"
  type        = string
  default     = "db.t4g.medium"
}

variable "cache_node_type" {
  description = "ElastiCache 노드 타입 (부족 시 m7g.large 이상으로)"
  type        = string
  default     = "cache.t4g.medium"
}

variable "backend_cpu" {
  description = "Fargate 태스크 vCPU 단위 (1024 = 1 vCPU)"
  type        = number
  default     = 1024
}

variable "backend_memory" {
  description = "Fargate 태스크 메모리 (MiB)"
  type        = number
  default     = 2048
}

variable "backend_autoscaling_enabled" {
  description = "백엔드 오토스케일링 (이미지 push 후 활성화)"
  type        = bool
  default     = false
}

variable "backend_autoscaling_min" {
  description = "오토스케일링 최소 태스크 수"
  type        = number
  default     = 2
}

variable "backend_autoscaling_max" {
  description = "오토스케일링 최대 태스크 수"
  type        = number
  default     = 10
}

variable "backend_desired_count" {
  description = "백엔드 태스크 수 (서비스 최초 생성 시에만 적용 — 이후엔 ignore_changes, 증설은 오토스케일링 min으로)"
  type        = number
  default     = 0
}

variable "image_tag" {
  description = "배포할 백엔드 이미지 태그 (CI/CD 도입 시 커밋 SHA 권장)"
  type        = string
  default     = "latest"
}

variable "redis_stream_group" {
  description = "REDIS_STREAM_GROUP 환경변수"
  type        = string
  default     = "mecross-system"
}

# 사이징 근거: 일 1억 클릭(평균 ~1,157 msg/s)에서 스트림이 버텨주는 시간.
# XADD MAXLEN ~는 소비 여부와 무관하게 트림하므로 이 길이가 곧 컨슈머 지연 허용치다.
# 앱 기본값 100,000은 약 86초치라 배포·RDS 장애로 컨슈머가 잠깐 밀리면 미소비 클릭이 조용히 유실된다.
# 2,000,000이면 약 29분치(피크 3배에도 ~10분)이고, tracking 엔트리 기준 ~300MB라
# cache.t4g.medium(3.09GiB)에 여유가 충분하다.
variable "redis_stream_maxlen" {
  description = "REDIS_STREAM_MAXLEN 환경변수 — XADD MAXLEN ~ 상한(스트림당 보관 엔트리 수)"
  type        = number
  default     = 2000000
}

variable "ses_from_email" {
  description = "SES 발신 이메일 (예: no-reply@<domain>)"
  type        = string
}
