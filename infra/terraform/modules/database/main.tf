# RDS PostgreSQL (single-AZ, 최소 사양) + DATABASE_URL SSM 파라미터.
# 비밀번호는 Terraform이 생성해 SSM(SecureString)에만 기록하고 ARN만 노출한다.
# 주의: random_password 값은 Terraform state에 평문으로 남는다 — state 버킷 접근 통제로 갈음.

resource "random_password" "db" {
  length = 32
  # URL에 그대로 들어가므로 인코딩이 필요한 특수문자는 배제
  override_special = "!-_"
}

resource "aws_db_subnet_group" "this" {
  name       = "${var.project}-db"
  subnet_ids = var.private_subnet_ids

  tags = {
    Name = "${var.project}-db"
  }
}

resource "aws_db_instance" "this" {
  identifier = "${var.project}-postgres"

  engine         = "postgres"
  engine_version = "17"
  instance_class = var.instance_class

  allocated_storage     = 20
  max_allocated_storage = 100 # 디스크 풀 방지용 스토리지 자동 확장 상한
  storage_type          = "gp3"

  db_name  = var.db_name
  username = var.db_username
  password = random_password.db.result

  db_subnet_group_name   = aws_db_subnet_group.this.name
  vpc_security_group_ids = [var.security_group_id]
  publicly_accessible    = false
  multi_az               = false

  backup_retention_period   = 1
  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.project}-postgres-final"
  deletion_protection       = true

  tags = {
    Name = "${var.project}-postgres"
  }
}

resource "aws_ssm_parameter" "database_url" {
  name  = "/${var.project}/prod/DATABASE_URL"
  type  = "SecureString"
  value = "postgresql://${var.db_username}:${random_password.db.result}@${aws_db_instance.this.address}:5432/${var.db_name}"
}
