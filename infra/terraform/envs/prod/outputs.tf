output "tracking_url" {
  description = "매체·트래커에 배포된 트래킹·포스트백 진입점 (NLB, 평문 80)"
  value       = "http://${local.api_domain}"
}

output "admin_api_url" {
  description = "프론트 VITE_API_URL에 넣을 어드민 API 주소 (ALB, HTTPS)"
  value       = "https://${local.admin_api_domain}"
}

output "frontend_url" {
  value = "https://${local.frontend_domain}"
}

output "alb_dns_name" {
  value = module.backend.alb_dns_name
}

output "nlb_dns_name" {
  value = module.backend.nlb_dns_name
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

output "asset_url" {
  description = "광고 소재 배포 주소 (backend ASSET_BASE_URL로 주입 — 업로드 URL의 접두사가 된다)"
  value       = "https://${local.asset_domain}"
}

output "asset_distribution_id" {
  description = "광고 소재 CloudFront 배포 id (수동 invalidation 대상)"
  value       = aws_cloudfront_distribution.asset.id
}

output "rds_endpoint" {
  value = module.database.endpoint
}

output "bastion_instance_id" {
  description = "aws ssm start-session --target 에 넣을 인스턴스 id (bastion_enabled = false 면 null)"
  value       = module.bastion.instance_id
}

# 그대로 복사해 실행하면 localhost:15432가 RDS에 연결된다 (DataGrip은 localhost:15432로 접속).
# 로컬에 session-manager-plugin이 설치돼 있어야 한다 — AWS CLI에 포함되지 않는다.
output "bastion_db_port_forward" {
  description = "RDS 포트 포워딩 명령. bastion_enabled = false 면 null"
  value       = var.bastion_enabled ? "aws ssm start-session --target ${module.bastion.instance_id} --document-name AWS-StartPortForwardingSessionToRemoteHost --parameters '{\"host\":[\"${module.database.endpoint}\"],\"portNumber\":[\"5432\"],\"localPortNumber\":[\"15432\"]}'" : null
}
