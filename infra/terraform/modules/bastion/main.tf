# SSM Session Manager 전용 점프 호스트.
#
# RDS·Valkey는 private subnet에 있고 보안그룹이 app 태스크에서만 열려 있어 사람이 닿을 경로가 없다.
# 이 인스턴스가 그 경로를 만든다 — 다만 인바운드 포트를 하나도 열지 않는다.
# Session Manager는 인스턴스가 아웃바운드 443으로 먼저 연결을 맺는 구조라 SSH도 키페어도 필요 없다.
#
# 로컬에서 포트 포워딩:
#   aws ssm start-session --target <instance_id> \
#     --document-name AWS-StartPortForwardingSessionToRemoteHost \
#     --parameters '{"host":["<rds endpoint>"],"portNumber":["5432"],"localPortNumber":["15432"]}'
#   → localhost:15432 로 DataGrip·psql 접속 (envs/prod의 bastion_db_port_forward 출력이 이 명령을 만들어 준다)
#
# 주의: 로컬에 session-manager-plugin이 따로 설치돼 있어야 한다. AWS CLI에 포함되지 않는다.
#
# 상시 필요한 리소스가 아니다. 데이터 이관·수동 조회가 끝나면 enabled = false 로 내려 destroy할 것.

data "aws_ami" "al2023" {
  count = var.enabled ? 1 : 0

  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-arm64"]
  }
}

data "aws_iam_policy_document" "assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ec2.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "this" {
  count = var.enabled ? 1 : 0

  name               = "${var.project}-bastion"
  assume_role_policy = data.aws_iam_policy_document.assume.json
}

# SSM 에이전트가 Session Manager에 등록하고 세션 채널을 여는 데 필요한 최소 권한.
# DB 자격증명은 주지 않는다 — 비밀번호는 사람이 SSM Parameter Store에서 직접 꺼내 쓴다.
resource "aws_iam_role_policy_attachment" "ssm" {
  count = var.enabled ? 1 : 0

  role       = aws_iam_role.this[0].name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "this" {
  count = var.enabled ? 1 : 0

  name = "${var.project}-bastion"
  role = aws_iam_role.this[0].name
}

resource "aws_instance" "this" {
  count = var.enabled ? 1 : 0

  # Amazon Linux 2023은 SSM 에이전트가 기본 탑재라 user_data가 필요 없다.
  # arm64 이미지여야 t4g 계열에 뜬다.
  ami           = data.aws_ami.al2023[0].id
  instance_type = var.instance_type
  subnet_id     = var.subnet_id

  vpc_security_group_ids = [var.security_group_id]
  iam_instance_profile   = aws_iam_instance_profile.this[0].name

  # NAT가 없으므로 SSM 엔드포인트(443)에 닿으려면 public IP가 필요하다.
  # 인바운드는 보안그룹이 전부 막으므로 주소가 있어도 들어올 수 없다.
  associate_public_ip_address = true

  # key_name을 지정하지 않는다 — SSH 키페어를 만들지 않고 접속은 SSM으로만 한다.

  # IMDSv2 강제. 토큰 없는 메타데이터 조회를 막아 SSRF로 인스턴스 자격증명이 새는 경로를 닫는다.
  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  root_block_device {
    volume_size = 8
    volume_type = "gp3"
    encrypted   = true
  }

  tags = {
    Name = "${var.project}-bastion"
  }
}
