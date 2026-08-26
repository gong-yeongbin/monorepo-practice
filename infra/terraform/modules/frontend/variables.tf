variable "project" {
  description = "리소스 네이밍 prefix"
  type        = string
}

variable "domain_aliases" {
  description = "CloudFront에 연결할 도메인 목록 (예: [\"app.example.com\"])"
  type        = list(string)
}

variable "certificate_arn" {
  description = "CloudFront용 ACM 인증서 ARN (반드시 us-east-1)"
  type        = string
}
