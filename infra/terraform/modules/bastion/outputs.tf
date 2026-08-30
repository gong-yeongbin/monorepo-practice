output "instance_id" {
  description = "aws ssm start-session --target 에 넣을 인스턴스 id. enabled = false 면 null"
  value       = var.enabled ? aws_instance.this[0].id : null
}
