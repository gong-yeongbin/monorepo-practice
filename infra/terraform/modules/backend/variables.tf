variable "project" {
  description = "리소스 네이밍 prefix"
  type        = string
}

variable "region" {
  description = "AWS 리전 (awslogs 설정용)"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnet_ids" {
  description = "ALB를 배치할 public 서브넷. ALB는 AWS 요구사항상 2개 AZ가 필수다"
  type        = list(string)
}

variable "app_subnet_ids" {
  description = "Fargate 태스크와 NLB를 배치할 public 서브넷. AZ 간 전송료를 없애기 위해 단일 AZ 하나만 넘긴다"
  type        = list(string)
}

variable "alb_sg_id" {
  description = "ALB 보안그룹 ID"
  type        = string
}

variable "nlb_sg_id" {
  description = "트래킹 NLB 보안그룹 ID (NLB는 생성 시점에만 SG를 지정할 수 있다)"
  type        = string
}

variable "app_sg_id" {
  description = "Fargate 태스크 보안그룹 ID"
  type        = string
}

variable "certificate_arn" {
  description = "ALB 443 리스너용 ACM 인증서 ARN (서울 리전)"
  type        = string
}

variable "container_image" {
  description = "배포할 이미지 (예: <ecr_url>:<tag>)"
  type        = string
}

variable "container_port" {
  description = "어드민 API 컨테이너 포트 (ALB 경유)"
  type        = number
  default     = 3001
}

variable "tracking_port" {
  description = "트래킹·포스트백 컨테이너 포트 (NLB 경유). 앱에 TRACKING_PORT로 주입되며 이 포트에서는 공개 경로만 받는다"
  type        = number
  default     = 3002
}

variable "cpu" {
  description = "태스크 vCPU 단위 (256 = 0.25 vCPU)"
  type        = number
  default     = 256
}

variable "memory" {
  description = "태스크 메모리 (MiB)"
  type        = number
  default     = 512
}

variable "desired_count" {
  description = "태스크 수 (서비스 최초 생성 시에만 적용 — 이후엔 ignore_changes)"
  type        = number
  default     = 0
}

variable "environment" {
  description = "비밀 아닌 환경변수 (PORT, VALKEY 등)"
  type        = map(string)
  default     = {}
}

variable "secret_arns" {
  description = "SSM SecureString ARN 맵 (환경변수명 => ARN). JWT는 모듈 내부에서 추가된다."
  type        = map(string)
  default     = {}
}

variable "app_bucket_arn" {
  description = "앱이 사용하는 S3 버킷 ARN (task role 권한 범위)"
  type        = string
}

variable "enable_autoscaling" {
  description = "오토스케일링 활성화 (이미지 push 후 켤 것 — min_capacity가 태스크를 띄운다)"
  type        = bool
  default     = false
}

variable "autoscaling_min_count" {
  description = "오토스케일링 최소 태스크 수"
  type        = number
  default     = 2
}

variable "autoscaling_max_count" {
  description = "오토스케일링 최대 태스크 수"
  type        = number
  default     = 10
}

variable "autoscaling_cpu_target" {
  description = "target tracking CPU 사용률 (%)"
  type        = number
  default     = 60
}

variable "autoscaling_burst_cpu_threshold" {
  description = "급증 대응 step scaling 알람 임계 CPU 사용률 (%). target tracking 목표와 간격을 두어야 평상시 변동에 끌려 나오지 않는다"
  type        = number
  default     = 80
}

variable "consumer_cpu" {
  description = "컨슈머 태스크 vCPU 단위. 소비는 메시지당 AES 복호화가 지배적인 CPU 작업이라 1 vCPU 미만은 의미가 없다"
  type        = number
  default     = 1024
}

variable "consumer_memory" {
  description = "컨슈머 태스크 메모리 (MiB)"
  type        = number
  default     = 2048
}

variable "consumer_base_count" {
  description = "Spot이 전멸해도 보장할 컨슈머 온디맨드 태스크 수. 태스크당 실제 처리량을 측정한 뒤 조정할 것(consumer.tf 참고)"
  type        = number
  default     = 1
}

variable "consumer_desired_count" {
  description = "컨슈머 태스크 수. 오토스케일링을 붙이지 않아 Terraform이 그대로 소유한다(consumer.tf 참고)"
  type        = number
  default     = 0
}
