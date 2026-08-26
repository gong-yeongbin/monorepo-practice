# ElastiCache Valkey (single node, 최소 사양).
# ioredis와 프로토콜 호환(Stream 포함)이며 Redis OSS 대비 저렴하다.
# VPC 내부 + 보안그룹 차단 전제이므로 인증(AUTH) 없이 사용한다.

resource "aws_elasticache_subnet_group" "this" {
  name       = "${var.project}-cache"
  subnet_ids = var.private_subnet_ids
}

resource "aws_elasticache_cluster" "this" {
  cluster_id = "${var.project}-valkey"

  engine          = "valkey"
  engine_version  = "8.0"
  node_type       = var.node_type
  num_cache_nodes = 1
  port            = 6379

  parameter_group_name = "default.valkey8"
  subnet_group_name    = aws_elasticache_subnet_group.this.name
  security_group_ids   = [var.security_group_id]

  tags = {
    Name = "${var.project}-valkey"
  }
}
