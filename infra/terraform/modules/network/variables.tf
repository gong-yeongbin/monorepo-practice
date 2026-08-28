variable "project" {
  description = "리소스 네이밍 prefix"
  type        = string
}

variable "vpc_cidr" {
  description = "VPC CIDR"
  type        = string
  default     = "10.0.0.0/16"
}

variable "az_count" {
  description = "사용할 AZ 수 (ALB/RDS subnet group 요구사항상 최소 2)"
  type        = number
  default     = 2
}

variable "app_port" {
  description = "백엔드 컨테이너 포트 (어드민 API — ALB 경유)"
  type        = number
  default     = 3001
}

variable "tracking_port" {
  description = "백엔드 트래킹 포트 (트래킹·포스트백 — NLB 경유). 앱이 이 포트에서는 공개 경로만 받는다"
  type        = number
  default     = 3002
}
