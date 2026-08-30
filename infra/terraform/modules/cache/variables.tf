variable "project" {
  description = "리소스 네이밍 prefix"
  type        = string
}

variable "private_subnet_ids" {
  description = "cache subnet group에 사용할 private 서브넷"
  type        = list(string)
}

variable "security_group_id" {
  description = "ElastiCache 보안그룹 ID"
  type        = string
}

variable "node_type" {
  description = "캐시 노드 타입"
  type        = string
  default     = "cache.t4g.micro"
}

variable "availability_zone" {
  description = "primary·replica를 함께 둘 AZ. 앱과 같은 AZ여야 AZ 간 전송료가 발생하지 않는다"
  type        = string
}
