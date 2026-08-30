output "alb_dns_name" {
  value = aws_lb.this.dns_name
}

output "alb_zone_id" {
  value = aws_lb.this.zone_id
}

output "nlb_dns_name" {
  value = aws_lb.tracking.dns_name
}

output "nlb_zone_id" {
  value = aws_lb.tracking.zone_id
}

output "cluster_name" {
  value = aws_ecs_cluster.this.name
}

output "service_name" {
  value = aws_ecs_service.this.name
}

output "task_definition_family" {
  value = aws_ecs_task_definition.this.family
}

output "service_arn" {
  value = aws_ecs_service.this.id
}

output "cluster_arn" {
  value = aws_ecs_cluster.this.arn
}

output "task_definition_arn" {
  description = "리비전 번호를 뺀 family ARN — 마이그레이션 태스크 실행 권한을 리비전 전체에 걸기 위해 쓴다"
  value       = aws_ecs_task_definition.this.arn_without_revision
}

output "execution_role_arn" {
  value = aws_iam_role.execution.arn
}

output "task_role_arn" {
  value = aws_iam_role.task.arn
}

output "log_group_arn" {
  value = aws_cloudwatch_log_group.this.arn
}
