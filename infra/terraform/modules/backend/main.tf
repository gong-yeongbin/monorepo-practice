# ALB(어드민) + NLB(트래킹) + ECS Fargate 서비스 + IAM + JWT 시크릿.
#
# 진입점이 둘로 나뉜다. 태스크 하나가 포트 두 개를 열고 서비스가 타깃 그룹 두 개에 등록된다.
#   admin-api.<domain> → ALB :443 → 태스크 container_port(3001) — 어드민 API, HTTPS
#   api.<domain>       → NLB :80  → 태스크 tracking_port(3002)  — 트래킹·포스트백, 평문
#
# 초기 배포 순서 주의:
#   첫 apply 시점에는 ECR에 이미지가 없으므로 desired_count = 0 으로 시작하고,
#   이미지 push 후 enable_autoscaling = true 로 재-apply 하면 오토스케일링 min이 태스크를 띄운다.
#   (desired_count는 ignore_changes라 최초 생성 이후 apply로는 바뀌지 않음, terraform.tfvars.example 참고)

# --- ALB (어드민 API 전용) ---

resource "aws_lb" "this" {
  name               = "${var.project}-alb"
  load_balancer_type = "application"
  subnets            = var.public_subnet_ids
  security_groups    = [var.alb_sg_id]
}

resource "aws_lb_target_group" "this" {
  name        = "${var.project}-backend"
  port        = var.container_port
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = var.vpc_id

  deregistration_delay = 30

  health_check {
    path                = "/health"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

# 어드민 도메인에는 평문으로 받을 이유가 없다 — 사람이 주소창에 친 경우만 HTTPS로 올린다.
# (트래킹의 80 직접 포워드는 아래 NLB가 담당한다)
resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.this.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.this.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.this.arn
  }
}

# --- NLB (트래킹·포스트백 전용) ---
#
# ALB를 쓰지 않는 이유는 LCU의 신규 연결 차원이다. LCU는 4개 차원 중 최댓값 하나로만 과금되는데,
# 광고 클릭은 재사용 없는 일회성 연결이라 이 차원이 홀로 지배한다. 일 1억 클릭(평균 1,157/s)이면
# ALB는 LCU당 25/s라 46 LCU(월 ~$270)가 되고, NLB는 NLCU당 800/s라 1.4 NLCU에 그쳐
# 처리 바이트 4.2 NLCU가 최댓값이 된다(월 ~$35). 자세한 근거는 루트 context-notes.md 참고.
#
# 대가는 L4라 경로를 못 본다는 것이다. 80을 그냥 열면 어드민 API까지 평문으로 열리므로
# 앱이 진입 포트(tracking_port)를 보고 공개 경로만 통과시킨다 — apps/backend/src/main.ts 참고.

resource "aws_lb" "tracking" {
  name               = "${var.project}-nlb"
  load_balancer_type = "network"
  subnets            = var.public_subnet_ids
  security_groups    = [var.nlb_sg_id]

  # NLB는 기본이 off다. off면 타깃이 없는 AZ의 노드로 온 트래픽이 그냥 실패하는데,
  # 트래킹 유실은 곧 매출이라 켠다. 대가는 AZ 간 전송 요금 월 ~$15.
  enable_cross_zone_load_balancing = true
}

resource "aws_lb_target_group" "tracking" {
  name        = "${var.project}-tracking"
  port        = var.tracking_port
  protocol    = "TCP"
  target_type = "ip"
  vpc_id      = var.vpc_id

  deregistration_delay = 30

  # 켜두지 않으면 앱이 보는 출발지가 NLB가 되어 IP 기준 rate limit이 전부 같은 IP로 뭉갠다.
  preserve_client_ip = true

  # TCP 헬스체크는 포트만 열리고 앱이 죽은 상태를 못 잡는다.
  # NLB 타깃 그룹은 두 임계값이 같아야 하고 HTTP 헬스체크 간격은 10 또는 30만 허용된다.
  health_check {
    protocol            = "HTTP"
    path                = "/health"
    matcher             = "200"
    interval            = 30
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }
}

resource "aws_lb_listener" "tracking" {
  load_balancer_arn = aws_lb.tracking.arn
  port              = 80
  protocol          = "TCP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.tracking.arn
  }
}

# --- JWT 시크릿 (생성 후 SSM SecureString으로만 노출) ---

resource "random_password" "jwt_access" {
  length  = 64
  special = false
}

resource "random_password" "jwt_refresh" {
  length  = 64
  special = false
}

resource "aws_ssm_parameter" "jwt_access" {
  name  = "/${var.project}/prod/JWT_ACCESS_SECRET"
  type  = "SecureString"
  value = random_password.jwt_access.result
}

resource "aws_ssm_parameter" "jwt_refresh" {
  name  = "/${var.project}/prod/JWT_REFRESH_SECRET"
  type  = "SecureString"
  value = random_password.jwt_refresh.result
}

locals {
  secret_arns = merge(var.secret_arns, {
    JWT_ACCESS_SECRET  = aws_ssm_parameter.jwt_access.arn
    JWT_REFRESH_SECRET = aws_ssm_parameter.jwt_refresh.arn
  })

  # 트래킹 포트는 NLB 타깃 그룹·SG 규칙·앱이 모두 같은 값을 봐야 하므로 이 모듈의 변수를 단일 출처로 삼는다.
  environment = merge(var.environment, {
    TRACKING_PORT = tostring(var.tracking_port)
  })
}

# --- IAM ---
# execution role: ECS 에이전트가 사용 (이미지 pull, 로그 전송, SSM 시크릿 주입)
# task role:      앱 코드(@aws-sdk)가 사용 (S3, SES)

data "aws_iam_policy_document" "ecs_assume" {
  statement {
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

resource "aws_iam_role" "execution" {
  name               = "${var.project}-ecs-execution"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

resource "aws_iam_role_policy_attachment" "execution" {
  role       = aws_iam_role.execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "execution_secrets" {
  name = "read-ssm-secrets"
  role = aws_iam_role.execution.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["ssm:GetParameters"]
        Resource = values(local.secret_arns)
      }
    ]
  })
}

resource "aws_iam_role" "task" {
  name               = "${var.project}-ecs-task"
  assume_role_policy = data.aws_iam_policy_document.ecs_assume.json
}

resource "aws_iam_role_policy" "task_app" {
  name = "app-s3-ses"
  role = aws_iam_role.task.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject"
        ]
        Resource = "${var.app_bucket_arn}/*"
      },
      {
        Effect   = "Allow"
        Action   = ["s3:ListBucket"]
        Resource = var.app_bucket_arn
      },
      {
        Effect   = "Allow"
        Action   = ["ses:SendEmail", "ses:SendRawEmail"]
        Resource = "*"
      }
    ]
  })
}

# --- ECS ---

resource "aws_cloudwatch_log_group" "this" {
  name              = "/ecs/${var.project}-backend"
  retention_in_days = 7
}

resource "aws_ecs_cluster" "this" {
  name = "${var.project}-cluster"

  setting {
    name  = "containerInsights"
    value = "disabled"
  }
}

resource "aws_ecs_cluster_capacity_providers" "this" {
  cluster_name       = aws_ecs_cluster.this.name
  capacity_providers = ["FARGATE", "FARGATE_SPOT"]
}

resource "aws_ecs_task_definition" "this" {
  family                   = "${var.project}-backend"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.cpu
  memory                   = var.memory
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn

  # Graviton — x86 대비 컴퓨팅 단가 ~20% 절감. 이미지는 arm64로 빌드해야 한다.
  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "ARM64"
  }

  container_definitions = jsonencode([
    {
      name      = "backend"
      image     = var.container_image
      essential = true

      portMappings = [
        {
          containerPort = var.container_port
          protocol      = "tcp"
        },
        {
          containerPort = var.tracking_port
          protocol      = "tcp"
        }
      ]

      environment = [for k, v in local.environment : { name = k, value = v }]
      secrets     = [for k, arn in local.secret_arns : { name = k, valueFrom = arn }]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.this.name
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "backend"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "this" {
  name            = "${var.project}-backend"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.this.arn
  desired_count   = var.desired_count

  # 첫 1대는 항상 온디맨드, 증설분은 전부 Spot (회수돼도 base가 계속 서비스)
  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    base              = 1
    weight            = 0
  }

  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 1
  }

  network_configuration {
    subnets          = var.public_subnet_ids
    security_groups  = [var.app_sg_id]
    assign_public_ip = true
  }

  # 서비스 하나가 타깃 그룹 둘에 등록된다. ECS는 붙어 있는 모든 타깃 그룹에서 건강해야
  # 태스크를 정상으로 보므로, 트래킹 포트도 /health를 열어두어야 한다(main.ts의 공개 경로 목록).
  load_balancer {
    target_group_arn = aws_lb_target_group.this.arn
    container_name   = "backend"
    container_port   = var.container_port
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.tracking.arn
    container_name   = "backend"
    container_port   = var.tracking_port
  }

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  # 오토스케일링이 조정한 태스크 수를 apply가 var 값으로 되돌리지 않도록 무시한다.
  # 값 자체는 최초 생성 시에만 쓰이므로 이미지 push 후 증설은 오토스케일링 min으로 관리한다.
  lifecycle {
    ignore_changes = [desired_count]
  }

  depends_on = [aws_lb_listener.https, aws_lb_listener.tracking, aws_ecs_cluster_capacity_providers.this]
}
