locals {
  frontend_domain = var.frontend_subdomain == "" ? var.domain_name : "${var.frontend_subdomain}.${var.domain_name}"
  api_domain      = "${var.api_subdomain}.${var.domain_name}"
}

module "network" {
  source = "../../modules/network"

  project  = var.project
  vpc_cidr = var.vpc_cidr
}

module "database" {
  source = "../../modules/database"

  project            = var.project
  private_subnet_ids = module.network.private_subnet_ids
  security_group_id  = module.network.rds_sg_id
  db_name            = var.db_name
  db_username        = var.db_username
  instance_class     = var.db_instance_class
}

module "cache" {
  source = "../../modules/cache"

  project            = var.project
  private_subnet_ids = module.network.private_subnet_ids
  security_group_id  = module.network.redis_sg_id
  node_type          = var.cache_node_type
}

module "ecr" {
  source = "../../modules/ecr"

  name = "${var.project}-backend"
}

# ALB(서울)용 인증서
module "acm_alb" {
  source = "../../modules/acm"

  domain_name = local.api_domain
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

module "backend" {
  source = "../../modules/backend"

  project           = var.project
  region            = var.aws_region
  vpc_id            = module.network.vpc_id
  public_subnet_ids = module.network.public_subnet_ids
  alb_sg_id         = module.network.alb_sg_id
  app_sg_id         = module.network.app_sg_id
  certificate_arn   = module.acm_alb.certificate_arn

  container_image = "${module.ecr.repository_url}:${var.image_tag}"
  cpu             = var.backend_cpu
  memory          = var.backend_memory
  desired_count   = var.backend_desired_count

  enable_autoscaling    = var.backend_autoscaling_enabled
  autoscaling_min_count = var.backend_autoscaling_min
  autoscaling_max_count = var.backend_autoscaling_max

  # REDIS_STREAM_CONSUMER는 주입하지 않는다 — 앱 기본값(consumer-<hostname>-<pid>)이
  # 태스크별로 유니크해야 다중 태스크에서 xautoclaim 중복 처리가 없다.
  environment = {
    PORT                = "3001"
    VALKEY              = "redis://${module.cache.endpoint}:6379"
    REDIS_STREAM_GROUP  = var.redis_stream_group
    REDIS_STREAM_MAXLEN = tostring(var.redis_stream_maxlen)
    AWS_REGION          = var.aws_region
    SES_FROM_EMAIL      = var.ses_from_email
    S3_BUCKET           = aws_s3_bucket.app.id
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
