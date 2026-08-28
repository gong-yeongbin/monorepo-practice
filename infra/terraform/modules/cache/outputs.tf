output "endpoint" {
  description = "캐시 primary 엔드포인트 (redis://<endpoint>:6379 형태로 조합해 사용). 페일오버 시 새 primary를 자동으로 가리키므로 앱 설정은 그대로 둔다."
  value       = aws_elasticache_replication_group.this.primary_endpoint_address
}
