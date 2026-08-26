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
