# 기존 hosted zone을 조회해 사용한다.
# (zone을 Terraform이 새로 만들면 등록기관 NS 위임을 다시 맞춰야 하므로 data source 사용)

data "aws_route53_zone" "this" {
  name = var.domain_name
}

resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.this.zone_id
  name    = local.api_domain
  type    = "A"

  alias {
    name                   = module.backend.alb_dns_name
    zone_id                = module.backend.alb_zone_id
    evaluate_target_health = false
  }
}

resource "aws_route53_record" "frontend" {
  zone_id = data.aws_route53_zone.this.zone_id
  name    = local.frontend_domain
  type    = "A"

  alias {
    name                   = module.frontend.distribution_domain_name
    zone_id                = module.frontend.distribution_hosted_zone_id
    evaluate_target_health = false
  }
}
