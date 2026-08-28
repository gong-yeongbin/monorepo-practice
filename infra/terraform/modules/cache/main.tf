# ElastiCache Valkey (primary + replica, 자동 페일오버).
# ioredis와 프로토콜 호환(Stream 포함)이며 Redis OSS 대비 저렴하다.
# VPC 내부 + 보안그룹 차단 전제이므로 인증(AUTH) 없이 사용한다.

resource "aws_elasticache_subnet_group" "this" {
  name       = "${var.project}-cache"
  subnet_ids = var.private_subnet_ids
}

# 단일 노드였다면 장애 시 스트림 미처리분과 캠페인 캐시가 통째로 사라지고, XADD 실패로
# 클릭이 큐잉조차 되지 않는다(캐시 미스가 RDS로 몰리는 연쇄까지). 다른 AZ의 레플리카를
# 대기시켜 승격받는다. 다만 복제가 비동기라 페일오버 직전 수 초는 여전히 유실될 수 있고,
# 전환에도 1~2분이 걸린다 — 유실을 0으로 만드는 장치가 아니라 분 단위를 초 단위로 줄이는 것.
resource "aws_elasticache_replication_group" "this" {
  replication_group_id = "${var.project}-valkey"
  description          = "${var.project} 트래킹 스트림 + 캠페인 캐시"

  engine         = "valkey"
  engine_version = "8.0"
  node_type      = var.node_type
  port           = 6379

  # primary 1 + replica 1. automatic_failover는 레플리카가 최소 1대 있어야 켤 수 있고,
  # multi_az는 subnet group이 2개 이상 AZ에 걸쳐 있어야 한다(network 모듈 az_count = 2).
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  multi_az_enabled           = true

  parameter_group_name = "default.valkey8"
  subnet_group_name    = aws_elasticache_subnet_group.this.name
  security_group_ids   = [var.security_group_id]

  # 레플리카는 실수로 지운 데이터를 되살리지 못하므로(삭제도 그대로 복제된다) 스냅샷을 따로 남긴다.
  # 두 윈도우는 UTC이며 서로 겹치면 apply가 실패한다. KST로는 각각 02~03시, 목 03~04시로
  # 광고 트래픽이 가장 낮은 시간대에 둔다.
  snapshot_retention_limit = 3
  snapshot_window          = "17:00-18:00"
  maintenance_window       = "wed:18:00-wed:19:00"

  tags = {
    Name = "${var.project}-valkey"
  }
}
