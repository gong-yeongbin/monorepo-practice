locals {
  frontend_domain = var.frontend_subdomain == "" ? var.domain_name : "${var.frontend_subdomain}.${var.domain_name}"
  # 매체·트래커에 http://로 배포된 링크의 도메인 — 바꿀 수 없어 NLB가 이 이름을 가져간다
  api_domain = "${var.api_subdomain}.${var.domain_name}"
  # 어드민 API는 프론트만 쓰는 주소라 새로 파고 ALB에 붙인다
  admin_api_domain = "${var.admin_api_subdomain}.${var.domain_name}"
  # 광고 소재 배포 주소. 업로드 시점의 URL이 DB에 영구 저장되므로 배포를 다시 만들어도
  # 저장된 URL이 살아 있도록 *.cloudfront.net이 아니라 우리 도메인을 쓴다
  asset_domain = "${var.asset_subdomain}.${var.domain_name}"
}

module "network" {
  source = "../../modules/network"

  project         = var.project
  vpc_cidr        = var.vpc_cidr
  bastion_enabled = var.bastion_enabled
}

module "database" {
  source = "../../modules/database"

  project            = var.project
  private_subnet_ids = module.network.private_subnet_ids
  availability_zone  = module.network.primary_az
  security_group_id  = module.network.rds_sg_id
  db_name            = var.db_name
  db_username        = var.db_username
  instance_class     = var.db_instance_class
}

module "cache" {
  source = "../../modules/cache"

  project            = var.project
  private_subnet_ids = module.network.private_subnet_ids
  availability_zone  = module.network.primary_az
  security_group_id  = module.network.redis_sg_id
  node_type          = var.cache_node_type
}

module "ecr" {
  source = "../../modules/ecr"

  name = "${var.project}-backend"
}

# ALB(서울)용 인증서 — 어드민 도메인. 트래킹 도메인은 NLB의 평문 80만 쓰므로 인증서가 없다.
module "acm_alb" {
  source = "../../modules/acm"

  domain_name = local.admin_api_domain
  zone_id     = data.aws_route53_zone.this.zone_id
}

# CloudFront용 인증서 — 반드시 us-east-1
module "acm_cloudfront" {
  source = "../../modules/acm"

  providers = {
    aws = aws.us_east_1
  }

  domain_name = local.frontend_domain
  zone_id     = data.aws_route53_zone.this.zone_id
}

# 광고 소재 배포용 인증서 — CloudFront용이라 마찬가지로 us-east-1
module "acm_asset" {
  source = "../../modules/acm"

  providers = {
    aws = aws.us_east_1
  }

  domain_name = local.asset_domain
  zone_id     = data.aws_route53_zone.this.zone_id
}

module "backend" {
  source = "../../modules/backend"

  project           = var.project
  region            = var.aws_region
  vpc_id            = module.network.vpc_id
  public_subnet_ids = module.network.public_subnet_ids
  app_subnet_ids    = module.network.app_subnet_ids
  alb_sg_id         = module.network.alb_sg_id
  nlb_sg_id         = module.network.nlb_sg_id
  app_sg_id         = module.network.app_sg_id
  certificate_arn   = module.acm_alb.certificate_arn

  container_image = "${module.ecr.repository_url}:${var.image_tag}"
  cpu             = var.backend_cpu
  memory          = var.backend_memory
  desired_count   = var.backend_desired_count

  enable_autoscaling    = var.backend_autoscaling_enabled
  autoscaling_min_count = var.backend_autoscaling_min
  autoscaling_max_count = var.backend_autoscaling_max

  consumer_cpu           = var.consumer_cpu
  consumer_memory        = var.consumer_memory
  consumer_desired_count = var.consumer_desired_count
  consumer_base_count    = var.consumer_base_count

  # REDIS_STREAM_CONSUMER는 주입하지 않는다 — 앱 기본값(consumer-<hostname>-<pid>)이
  # 태스크별로 유니크해야 다중 태스크에서 xautoclaim 중복 처리가 없다.
  environment = {
    PORT = "3001"
    # 어드민 API(ALB)의 CORS 허용 origin — 프론트가 배포된 CloudFront 주소다.
    # 트래킹 포트에는 앱이 CORS를 걸지 않는다(응답 바이트 절감, apps/backend/src/main.ts 참고).
    CORS_ORIGIN         = "https://${local.frontend_domain}"
    VALKEY              = "redis://${module.cache.endpoint}:6379"
    REDIS_STREAM_GROUP  = var.redis_stream_group
    REDIS_STREAM_MAXLEN = tostring(var.redis_stream_maxlen)
    AWS_REGION          = var.aws_region
    SES_FROM_EMAIL      = var.ses_from_email
    S3_BUCKET           = aws_s3_bucket.app.id
    # 업로드한 광고 이미지가 DB에 저장될 때 붙는 주소. 버킷이 비공개라 S3 정적 URL은 403이므로
    # 반드시 CloudFront 도메인이어야 한다(storage.tf 참고)
    ASSET_BASE_URL = "https://${local.asset_domain}"
  }

  secret_arns = {
    DATABASE_URL = module.database.database_url_ssm_arn
  }

  app_bucket_arn = aws_s3_bucket.app.arn
}

module "frontend" {
  source = "../../modules/frontend"

  project         = var.project
  domain_aliases  = [local.frontend_domain]
  certificate_arn = module.acm_cloudfront.certificate_arn
}

# 사람이 DB·캐시를 들여다보거나 레거시 데이터 이관을 돌릴 때만 켠다.
# 평상시에는 false로 두어 인스턴스를 없앤다 — 접근 경로 자체가 사라지고 비용도 0이 된다.
module "bastion" {
  source = "../../modules/bastion"

  project = var.project
  enabled = var.bastion_enabled
  # RDS·Valkey와 같은 AZ여야 조회 트래픽에 AZ 간 전송료가 붙지 않는다
  subnet_id         = module.network.app_subnet_ids[0]
  security_group_id = module.network.bastion_sg_id
}
