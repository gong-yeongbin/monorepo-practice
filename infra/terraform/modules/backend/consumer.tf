# 스트림 컨슈머 전용 ECS 서비스 — 로드밸런서에 붙지 않는다.
#
# API 태스크와 같은 이미지를 command만 바꿔 띄운다(node dist/main.consumer). 엔트리포인트가
# HTTP 서버 없이 AppModule 컨텍스트만 올리고 APP_ROLE=consumer를 스스로 박으므로,
# 이 서비스는 소비 루프만 돌고 API 서비스는 APP_ROLE=api라 소비 루프를 돌리지 않는다.
#
# 왜 나누는가: Node는 프로세스당 이벤트 루프가 하나뿐이라, 한 프로세스에서 트래킹 요청 처리와
# 스트림 소비를 겸하면 둘이 같은 큐에서 순번을 다툰다. 요청량이 늘수록 컨슈머 몫이 줄어드는데
# 이를 막을 장치가 없고, 컨슈머가 밀리면 XADD의 MAXLEN 트림이 미소비 메시지를 잘라내
# 클릭이 아무 로그 없이 사라진다. 트래픽을 받지 않는 태스크로 빼야 vCPU를 소비에만 쓴다.
#
# 오토스케일링은 붙이지 않았다 — 컨슈머의 부하 지표는 CPU가 아니라 스트림 적체(XINFO GROUPS의 lag)인데
# 그 커스텀 메트릭을 아직 발행하지 않는다. 메트릭이 생기기 전까지는 태스크 수를 이 변수로 직접 관리한다.

resource "aws_ecs_task_definition" "consumer" {
  family                   = "${var.project}-consumer"
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.consumer_cpu
  memory                   = var.consumer_memory
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "ARM64"
  }

  container_definitions = jsonencode([
    {
      name      = "consumer"
      image     = var.container_image
      essential = true

      # Dockerfile의 CMD(node dist/main)를 덮어쓴다. 이미지는 API와 완전히 동일하다.
      command = ["node", "dist/main.consumer"]

      environment = [for k, v in local.consumer_environment : { name = k, value = v }]
      secrets     = [for k, arn in local.secret_arns : { name = k, valueFrom = arn }]

      logConfiguration = {
        logDriver = "awslogs"
        options = {
          # API와 같은 로그 그룹을 쓰고 스트림 prefix로만 가른다 — 한 그룹만 검색하면 양쪽이 다 걸린다.
          "awslogs-group"         = aws_cloudwatch_log_group.this.name
          "awslogs-region"        = var.region
          "awslogs-stream-prefix" = "consumer"
        }
      }
    }
  ])
}

resource "aws_ecs_service" "consumer" {
  name            = "${var.project}-consumer"
  cluster         = aws_ecs_cluster.this.id
  task_definition = aws_ecs_task_definition.consumer.arn
  desired_count   = var.consumer_desired_count

  # 평시 유입을 감당할 만큼은 온디맨드로 고정하고(base), 그 위 증설분만 Spot으로 받는다.
  #
  # Spot 회수 자체는 위험하지 않다 — 2분 예고 후 SIGTERM이 오고 onApplicationShutdown이 진행 중인
  # 배치를 끝내고 ack한 뒤 종료한다(BLOCK 5초 + 배치 처리, 10초 내). 문제는 회수 다음이다:
  # 단일 AZ라 Spot 풀이 얕은데 ECS는 용량이 없으면 온디맨드로 자동 전환하지 않고 태스크를
  # PROVISIONING에 세워둔다. 그 사이 컨슈머 용량이 줄어든 채 적체가 쌓이면 MAXLEN 트림이
  # 미소비 메시지를 잘라내고, 이 유실은 로그에도 지표에도 남지 않는다.
  #
  # 그래서 base는 "Spot이 전멸해도 평시 유입을 소화할 수 있는 대수"로 잡아야 한다. 다만 전용 태스크의
  # 실제 처리량은 아직 측정된 값이 없어(분리 전 추정치뿐) 우선 API와 같은 기준인 1로 두고 시작한다.
  # 분리 후 XINFO GROUPS의 lag 추이로 태스크당 처리량을 재고, 1대가 유입을 못 받치면 이 값을 올릴 것.
  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    base              = var.consumer_base_count
    weight            = 1
  }

  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 3
  }

  network_configuration {
    subnets          = var.app_subnet_ids
    security_groups  = [var.app_sg_id]
    assign_public_ip = true
  }

  # load_balancer 블록이 없다 — 트래킹·어드민 트래픽을 받지 않는 것이 이 서비스의 요점이다.
  # 타깃 그룹이 없으므로 ECS는 태스크가 RUNNING이면 정상으로 본다.

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  # API 서비스와 달리 ignore_changes를 두지 않는다 — 오토스케일링이 없어 태스크 수를 Terraform이 그대로 소유한다.

  depends_on = [aws_ecs_cluster_capacity_providers.this]
}
