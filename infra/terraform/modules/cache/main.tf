# ElastiCache Valkey (primary + replica, 자동 페일오버).
# ioredis와 프로토콜 호환(Stream 포함)이며 Redis OSS 대비 저렴하다.
# VPC 내부 + 보안그룹 차단 전제이므로 인증(AUTH) 없이 사용한다.

resource "aws_elasticache_subnet_group" "this" {
  name       = "${var.project}-cache"
  subnet_ids = var.private_subnet_ids
}

# 단일 노드였다면 장애 시 스트림 미처리분과 캠페인 캐시가 통째로 사라지고, XADD 실패로
# 클릭이 큐잉조차 되지 않는다(캐시 미스가 RDS로 몰리는 연쇄까지). 레플리카를 대기시켜 승격받는다.
# 다만 복제가 비동기라 페일오버 직전 수 초는 여전히 유실될 수 있고, 전환에도 1~2분이 걸린다
# — 유실을 0으로 만드는 장치가 아니라 분 단위를 초 단위로 줄이는 것.
#
# 레플리카는 primary와 "같은 AZ"에 둔다(2026-08-30 결정). 레거시 실측에서 앱(2a)과 캐시(2b/2c)가
# 갈려 있어 클릭마다의 XADD·캐시 조회가 전부 AZ를 넘었고, 그것만으로 월 $215~270이 나갔다.
# AZ를 걸친 레플리카는 AZ 장애를 견디게 해주지만 RDS가 Single-AZ라 어차피 AZ 장애 시 서비스가
# 멈춘다 — 살아남지 못하는 시나리오에 복제 전송료를 내는 셈이라 같은 AZ로 모았다.
# 대가: multi_az(자동 AZ 페일오버)는 못 켠다. 노드 단위 장애 페일오버는 그대로 유지된다.
resource "aws_elasticache_replication_group" "this" {
  replication_group_id = "${var.project}-valkey"
  description          = "${var.project} 트래킹 스트림 + 캠페인 캐시"

  engine         = "valkey"
  engine_version = "8.0"
  node_type      = var.node_type
  port           = 6379

  # primary 1 + replica 1, 둘 다 같은 AZ. automatic_failover는 레플리카가 최소 1대 있으면
  # 켤 수 있고 AZ 분산을 요구하지 않는다. multi_az_enabled만 2개 AZ를 요구하므로 끈다.
  num_cache_clusters          = 2
  preferred_cache_cluster_azs = [var.availability_zone, var.availability_zone]
  automatic_failover_enabled  = true
  multi_az_enabled            = false

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
