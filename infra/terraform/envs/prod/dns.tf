# 기존 hosted zone을 조회해 사용한다.
# (zone을 Terraform이 새로 만들면 등록기관 NS 위임을 다시 맞춰야 하므로 data source 사용)

data "aws_route53_zone" "this" {
  name = var.domain_name
}

# 트래킹·포스트백 — 매체와 트래커에 배포된 http:// 링크가 이 이름을 가리킨다
resource "aws_route53_record" "api" {
  zone_id = data.aws_route53_zone.this.zone_id
  name    = local.api_domain
  type    = "A"

  alias {
    name                   = module.backend.nlb_dns_name
    zone_id                = module.backend.nlb_zone_id
    evaluate_target_health = false
  }
}

# 어드민 API — 프론트만 호출하는 주소
resource "aws_route53_record" "admin_api" {
  zone_id = data.aws_route53_zone.this.zone_id
  name    = local.admin_api_domain
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

# 광고 소재 — 업로드된 이미지의 저장 URL이 이 이름을 가리킨다
resource "aws_route53_record" "asset" {
  zone_id = data.aws_route53_zone.this.zone_id
  name    = local.asset_domain
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.asset.domain_name
    zone_id                = aws_cloudfront_distribution.asset.hosted_zone_id
    evaluate_target_health = false
  }
}
