output "api_url" {
  value = "https://${local.api_domain}"
}

output "frontend_url" {
  value = "https://${local.frontend_domain}"
}

output "alb_dns_name" {
  value = module.backend.alb_dns_name
}

output "ecr_repository_url" {
  description = "이미지 push 대상 (docker push <url>:<tag>)"
  value       = module.ecr.repository_url
}

output "ecs_cluster_name" {
  value = module.backend.cluster_name
}

output "ecs_service_name" {
  value = module.backend.service_name
}

output "frontend_bucket_name" {
  description = "frontend 빌드 결과물 sync 대상"
  value       = module.frontend.bucket_name
}

output "cloudfront_distribution_id" {
  description = "배포 후 invalidation 대상"
  value       = module.frontend.distribution_id
}

output "app_bucket_name" {
  description = "backend S3_BUCKET 환경변수로 주입되는 버킷"
  value       = aws_s3_bucket.app.id
}

output "rds_endpoint" {
  value = module.database.endpoint
}
