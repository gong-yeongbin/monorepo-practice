variable "project" {
  description = "리소스 네이밍 prefix"
  type        = string
}

variable "private_subnet_ids" {
  description = "DB subnet group에 사용할 private 서브넷"
  type        = list(string)
}

variable "security_group_id" {
  description = "RDS 보안그룹 ID"
  type        = string
}

variable "db_name" {
  description = "생성할 데이터베이스명"
  type        = string
}

variable "db_username" {
  description = "마스터 사용자명"
  type        = string
}

variable "instance_class" {
  description = "RDS 인스턴스 클래스"
  type        = string
  default     = "db.t4g.micro"
}

variable "availability_zone" {
  description = "인스턴스를 배치할 AZ. 앱·캐시와 같은 AZ여야 AZ 간 전송료가 발생하지 않는다"
  type        = string
}
