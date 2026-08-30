# VPC + 서브넷 + 보안그룹 체인.
# NAT Gateway 없음: Fargate 태스크는 public subnet + public IP로 두고
# inbound는 보안그룹(app: ALB에서만 3001)으로 차단한다.
# private subnet(RDS/ElastiCache)은 인터넷 경로 자체가 없다.

data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_vpc" "this" {
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "${var.project}-vpc"
  }
}

resource "aws_internet_gateway" "this" {
  vpc_id = aws_vpc.this.id

  tags = {
    Name = "${var.project}-igw"
  }
}

resource "aws_subnet" "public" {
  count = var.az_count

  vpc_id                  = aws_vpc.this.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project}-public-${count.index}"
  }
}

resource "aws_subnet" "private" {
  count = var.az_count

  vpc_id            = aws_vpc.this.id
  cidr_block        = cidrsubnet(var.vpc_cidr, 8, 10 + count.index)
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "${var.project}-private-${count.index}"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.this.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.this.id
  }

  tags = {
    Name = "${var.project}-public"
  }
}

resource "aws_route_table_association" "public" {
  count = var.az_count

  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# --- 보안그룹 체인: alb/nlb -> app -> rds/redis ---
# 순환 참조를 피하기 위해 SG는 전부 이 모듈에서 만들고 각 모듈에는 ID만 넘긴다.

resource "aws_security_group" "alb" {
  name        = "${var.project}-alb"
  description = "ALB: HTTP/HTTPS from anywhere"
  vpc_id      = aws_vpc.this.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project}-alb"
  }
}

# 트래킹용 NLB. 클라이언트 IP 보존을 켜면 태스크가 보는 출발지가 NLB가 아니라 실제 클라이언트라,
# NLB에 SG가 없으면 app SG의 트래킹 포트를 0.0.0.0/0으로 열어야 해 위 체인에 구멍이 난다.
# 주의: NLB의 보안그룹은 생성 시점에만 지정할 수 있고 나중에 추가할 수 없다.
resource "aws_security_group" "nlb" {
  name        = "${var.project}-nlb"
  description = "Tracking NLB: HTTP from anywhere"
  vpc_id      = aws_vpc.this.id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project}-nlb"
  }
}

resource "aws_security_group" "app" {
  name        = "${var.project}-app"
  description = "Fargate tasks: admin port from ALB, tracking port from NLB"
  vpc_id      = aws_vpc.this.id

  ingress {
    description     = "Admin port from ALB"
    from_port       = var.app_port
    to_port         = var.app_port
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
  }

  ingress {
    description     = "Tracking port from NLB"
    from_port       = var.tracking_port
    to_port         = var.tracking_port
    protocol        = "tcp"
    security_groups = [aws_security_group.nlb.id]
  }

  # ECR pull, AWS API(SSM/S3/SES) 호출용
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project}-app"
  }
}

resource "aws_security_group" "rds" {
  name        = "${var.project}-rds"
  description = "RDS PostgreSQL: from app tasks only"
  vpc_id      = aws_vpc.this.id

  ingress {
    description     = "PostgreSQL from app"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  # 점프 호스트를 켰을 때만 열린다. 인라인 ingress를 쓰는 보안그룹에
  # aws_vpc_security_group_ingress_rule을 따로 붙이면 두 방식이 서로의 규칙을 지우려 들며
  # 매 plan마다 diff가 생긴다 — 그래서 별도 리소스가 아니라 dynamic 블록으로 추가한다.
  dynamic "ingress" {
    for_each = var.bastion_enabled ? [1] : []

    content {
      description     = "PostgreSQL from bastion"
      from_port       = 5432
      to_port         = 5432
      protocol        = "tcp"
      security_groups = [aws_security_group.bastion[0].id]
    }
  }

  tags = {
    Name = "${var.project}-rds"
  }
}

resource "aws_security_group" "redis" {
  name        = "${var.project}-redis"
  description = "ElastiCache: from app tasks only"
  vpc_id      = aws_vpc.this.id

  ingress {
    description     = "Redis from app"
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }

  dynamic "ingress" {
    for_each = var.bastion_enabled ? [1] : []

    content {
      description     = "Redis from bastion"
      from_port       = 6379
      to_port         = 6379
      protocol        = "tcp"
      security_groups = [aws_security_group.bastion[0].id]
    }
  }

  tags = {
    Name = "${var.project}-redis"
  }
}

# SSM 점프 호스트용. ingress 블록이 하나도 없다 — Session Manager는 인스턴스가 아웃바운드 443으로
# 먼저 연결을 맺는 구조라 인바운드를 열지 않고도 접속이 된다(SSH 22번도 열지 않는다).
resource "aws_security_group" "bastion" {
  count = var.bastion_enabled ? 1 : 0

  name        = "${var.project}-bastion"
  description = "SSM bastion: no inbound"
  vpc_id      = aws_vpc.this.id

  # SSM 엔드포인트 호출과 DB·캐시로의 아웃바운드
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project}-bastion"
  }
}
