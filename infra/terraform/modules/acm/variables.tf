variable "domain_name" {
  description = "인증서를 발급할 도메인 (예: api.example.com)"
  type        = string
}

variable "zone_id" {
  description = "DNS 검증 레코드를 생성할 Route53 hosted zone ID"
  type        = string
}

variable "key_algorithm" {
  description = "인증서 키 알고리즘 (ECDSA P-256이 핸드셰이크 바이트가 가장 작음)"
  type        = string
  default     = "EC_prime256v1"
}
