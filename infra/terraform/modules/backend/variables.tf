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
  description = "ALB와 Fargate 태스크를 배치할 public 서브넷"
  type        = list(string)
}

variable "alb_sg_id" {
  description = "ALB 보안그룹 ID"
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
  description = "컨테이너 포트"
  type        = number
  default     = 3001
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
  description = "태스크 수 (최초 apply 시 0, 이미지 push 후 1)"
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

variable "http_forward_paths" {
  description = "HTTPS 리다이렉트 없이 80 포트에서 바로 포워드할 경로 (http:// 로 배포된 트래킹·포스트백 링크)"
  type        = list(string)
  default     = ["/tracking*", "/postback*"]
}

variable "enable_autoscaling" {
  description = "오토스케일링 활성화 (이미지 push 후 켤 것 — 켜면 desired_count는 min 값으로 맞출 것)"
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
