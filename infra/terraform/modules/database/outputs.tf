output "endpoint" {
  value = aws_db_instance.this.address
}

output "database_url_ssm_arn" {
  description = "ECS task definition secrets 의 valueFrom 에 연결할 ARN"
  value       = aws_ssm_parameter.database_url.arn
}
