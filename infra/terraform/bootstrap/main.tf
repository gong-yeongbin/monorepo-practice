# Terraform state 버킷 생성용 bootstrap.
# 이 디렉토리만 로컬 state를 사용한다 (닭-달걀 문제 해결용, 1회 apply).
#
# 절차:
#   1. terraform init && terraform apply
#   2. 출력된 버킷명을 envs/prod/backend.tf 의 bucket 에 기입
#   3. envs/prod 에서 terraform init
#
# 로컬 tfstate가 유실돼도 리소스가 버킷 하나뿐이라 `terraform import`로 복구 가능하다.

terraform {
  required_version = ">= 1.10"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

data "aws_caller_identity" "current" {}

resource "aws_s3_bucket" "tfstate" {
  bucket = "${var.project}-tfstate-${data.aws_caller_identity.current.account_id}"
}

resource "aws_s3_bucket_versioning" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "tfstate" {
  bucket = aws_s3_bucket.tfstate.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}
