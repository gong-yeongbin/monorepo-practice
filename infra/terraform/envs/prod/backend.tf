# S3 원격 state.
# bucket: bootstrap 이 만드는 버킷 (mecross-tfstate-<account_id>).
# use_lockfile: Terraform 1.10+ 의 S3 native lock — DynamoDB 테이블 불필요.

terraform {
  backend "s3" {
    bucket       = "mecross-tfstate-478657622805"
    key          = "prod/terraform.tfstate"
    region       = "ap-northeast-2"
    use_lockfile = true
    encrypt      = true
  }
}
