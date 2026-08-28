# backend 앱이 S3_BUCKET 환경변수로 사용하는 버킷

resource "aws_s3_bucket" "app" {
  bucket = "${var.project}-app-storage-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_public_access_block" "app" {
  bucket = aws_s3_bucket.app.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# --- 광고 소재 배포 (CloudFront + OAC) ---
# 업로드한 광고 이미지는 어드민 화면이 <img src>로 익명 GET한다. 버킷은 계속 완전 비공개로 두고
# CloudFront에만 읽기를 허용한다(frontend 모듈과 같은 패턴). 아래 CloudFront 원본 접근 제어가
# 없으면 앱이 반환한 URL이 403이 되어 목록의 광고 이미지가 전부 깨진다.

resource "aws_cloudfront_origin_access_control" "asset" {
  name                              = "${var.project}-asset"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

# 관리형 CachingOptimized는 쿼리스트링을 캐시 키에 넣지 않는다. 프론트가 갱신 표시용으로 붙이는
# `?{uuid}` 캐시버스터(advertising-table.tsx)가 그대로 무시되고, 키가 `advertising/{id}` 고정이라
# 이미지를 새로 올려도 무효화 전까지 옛 객체가 계속 나온다. 그래서 쿼리스트링을 캐시 키에 넣는다.
# 대가는 uuid가 매 렌더마다 달라 캐시 히트가 사실상 0이라는 것 — 어드민만 보는 저트래픽이라 감수한다.
resource "aws_cloudfront_cache_policy" "asset" {
  name = "${var.project}-asset"

  min_ttl     = 0
  default_ttl = 86400
  max_ttl     = 31536000

  parameters_in_cache_key_and_forwarded_to_origin {
    query_strings_config {
      query_string_behavior = "all"
    }

    cookies_config {
      cookie_behavior = "none"
    }

    headers_config {
      header_behavior = "none"
    }
  }
}

resource "aws_cloudfront_distribution" "asset" {
  enabled = true
  aliases = [local.asset_domain]
  # PriceClass_100 은 한국 엣지 미포함
  price_class = "PriceClass_200"

  origin {
    origin_id                = "s3-asset"
    domain_name              = aws_s3_bucket.app.bucket_regional_domain_name
    origin_access_control_id = aws_cloudfront_origin_access_control.asset.id
  }

  default_cache_behavior {
    target_origin_id       = "s3-asset"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    cache_policy_id        = aws_cloudfront_cache_policy.asset.id
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = module.acm_asset.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }
}

data "aws_iam_policy_document" "app_cloudfront" {
  statement {
    actions = ["s3:GetObject"]
    # 버킷 전체가 아니라 광고 소재 prefix만 연다. 같은 버킷을 다른 용도로 쓰게 됐을 때
    # 그 객체까지 CDN에 딸려 나가는 것을 막는다. 키는 upload-advertising-image.use-case.ts가 만든다.
    resources = ["${aws_s3_bucket.app.arn}/advertising/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.asset.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "app" {
  bucket = aws_s3_bucket.app.id
  policy = data.aws_iam_policy_document.app_cloudfront.json

  depends_on = [aws_s3_bucket_public_access_block.app]
}
