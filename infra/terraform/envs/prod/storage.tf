# backend 앱이 S3_BUCKET 환경변수로 사용하는 버킷

resource "aws_s3_bucket" "app" {
  bucket = "${var.project}-app-storage-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_public_access_block" "app" {
  bucket = aws_s3_bucket.app.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
