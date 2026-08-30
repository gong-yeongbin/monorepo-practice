# 기존 hosted zone을 조회해 사용한다.
# (zone을 Terraform이 새로 만들면 등록기관 NS 위임을 다시 맞춰야 하므로 data source 사용)

data "aws_route53_zone" "this" {
  name = var.domain_name
}

# api.<domain>과 <frontend>.<domain>은 **레거시가 지금 쓰고 있는 이름**이라, 이 두 레코드를 만드는 것이
# 곧 프로덕션 컷오버다. 그래서 cutover_dns_enabled로 가둔다 — 인프라를 먼저 다 올려 검증한 뒤
# 컷오버 시점에만 true로 바꿔 재-apply한다. 그때까지는 LB·CloudFront 도메인으로 직접 접속해 검증한다.
# 기존 레코드를 이어받아야 하므로 allow_overwrite가 필요하다(없으면 apply가 충돌로 실패한다).
# admin_api·asset은 신규 이름이라 충돌이 없어 처음부터 만든다.

# 트래킹·포스트백 — 매체와 트래커에 배포된 http:// 링크가 이 이름을 가리킨다
resource "aws_route53_record" "api" {
  count = var.cutover_dns_enabled ? 1 : 0

  zone_id         = data.aws_route53_zone.this.zone_id
  name            = local.api_domain
  type            = "A"
  allow_overwrite = true

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
  count = var.cutover_dns_enabled ? 1 : 0

  zone_id         = data.aws_route53_zone.this.zone_id
  name            = local.frontend_domain
  type            = "A"
  allow_overwrite = true

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
