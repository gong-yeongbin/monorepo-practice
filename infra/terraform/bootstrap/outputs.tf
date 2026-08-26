output "state_bucket_name" {
  description = "envs/*/backend.tf 의 bucket 에 기입할 버킷명"
  value       = aws_s3_bucket.tfstate.id
}
