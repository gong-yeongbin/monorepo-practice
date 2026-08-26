# ACM 인증서 + Route53 DNS 검증.
# CloudFront용은 반드시 us-east-1 이어야 하므로 루트에서
# providers = { aws = aws.us_east_1 } 로 주입해 인스턴스화한다.
# (Route53은 글로벌 서비스라 어느 리전 provider로 레코드를 만들어도 무방)

resource "aws_acm_certificate" "this" {
  domain_name       = var.domain_name
  validation_method = "DNS"
  # ECDSA: RSA 대비 TLS 핸드셰이크 시 인증서 체인이 ~1.5KB 작다.
  # 트래킹은 매 클릭이 신규 핸드셰이크라 대량 트래픽에서 전송비 절감 효과가 큼.
  key_algorithm = var.key_algorithm

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "validation" {
  for_each = {
    for dvo in aws_acm_certificate.this.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  zone_id         = var.zone_id
  name            = each.value.name
  type            = each.value.type
  ttl             = 60
  records         = [each.value.record]
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "this" {
  certificate_arn         = aws_acm_certificate.this.arn
  validation_record_fqdns = [for r in aws_route53_record.validation : r.fqdn]
}
