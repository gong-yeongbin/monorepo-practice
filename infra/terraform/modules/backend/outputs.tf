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
