output "vpc_id" {
  value = aws_vpc.this.id
}

output "public_subnet_ids" {
  value = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  value = aws_subnet.private[*].id
}

output "alb_sg_id" {
  value = aws_security_group.alb.id
}

output "nlb_sg_id" {
  value = aws_security_group.nlb.id
}

output "app_sg_id" {
  value = aws_security_group.app.id
}

output "rds_sg_id" {
  value = aws_security_group.rds.id
}

output "redis_sg_id" {
  value = aws_security_group.redis.id
}

# 단일 AZ 배치용. Fargate 태스크와 NLB는 이 서브넷 하나만 쓴다 — 실측상 앱↔캐시 트래픽이
# 월 ~10TB라, AZ를 걸치면 양방향 과금으로 월 $100~190이 그대로 전송료가 된다.
output "app_subnet_ids" {
  value = [aws_subnet.public[var.primary_az_index].id]
}

output "primary_az" {
  value = data.aws_availability_zones.available.names[var.primary_az_index]
}

output "bastion_sg_id" {
  value = var.bastion_enabled ? aws_security_group.bastion[0].id : null
}
