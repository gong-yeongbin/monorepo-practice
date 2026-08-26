output "endpoint" {
  description = "캐시 노드 주소 (redis://<endpoint>:6379 형태로 조합해 사용)"
  value       = aws_elasticache_cluster.this.cache_nodes[0].address
}
