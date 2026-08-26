# S3 원격 state.
# bucket 값은 bootstrap apply 후 출력된 버킷명으로 교체할 것.
# use_lockfile: Terraform 1.10+ 의 S3 native lock — DynamoDB 테이블 불필요.

terraform {
  backend "s3" {
    bucket       = "REPLACE_WITH_BOOTSTRAP_OUTPUT" # 예: mecross-tfstate-123456789012
    key          = "prod/terraform.tfstate"
    region       = "ap-northeast-2"
    use_lockfile = true
    encrypt      = true
  }
}
