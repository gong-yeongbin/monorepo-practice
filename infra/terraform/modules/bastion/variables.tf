variable "project" {
  description = "리소스 네이밍 prefix"
  type        = string
}

variable "enabled" {
  description = "점프 호스트 생성 여부. false면 인스턴스와 IAM 역할이 모두 사라진다"
  type        = bool
  default     = false
}

variable "subnet_id" {
  description = "인스턴스를 둘 public 서브넷. RDS·Valkey와 같은 AZ여야 조회 트래픽에 AZ 간 전송료가 붙지 않는다"
  type        = string
}

variable "security_group_id" {
  description = "인바운드 규칙이 없는 bastion 보안그룹 ID. enabled = false 일 때는 null이 넘어온다"
  type        = string
  default     = null
}

variable "instance_type" {
  description = "인스턴스 타입. 포트 포워딩만 중계하므로 최소 사양이면 충분하다(arm64여야 한다)"
  type        = string
  default     = "t4g.nano"
}
