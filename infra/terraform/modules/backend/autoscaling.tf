# CPU 기준 오토스케일링 — 평상시 조절은 target tracking, 급증 대응은 step scaling 두 정책이 함께 돈다.
# 최초 배포(이미지 없음, desired_count = 0) 시점에는 꺼두고,
# 이미지 push 후 enable_autoscaling = true 로 켠다 (min_capacity가 태스크를 띄운다).
# 증설분은 capacity provider 전략에 따라 Spot으로 뜬다.

resource "aws_appautoscaling_target" "ecs" {
  count = var.enable_autoscaling ? 1 : 0

  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.this.name}/${aws_ecs_service.this.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = var.autoscaling_min_count
  max_capacity       = var.autoscaling_max_count
}

resource "aws_appautoscaling_policy" "cpu" {
  count = var.enable_autoscaling ? 1 : 0

  name               = "${var.project}-backend-cpu"
  policy_type        = "TargetTrackingScaling"
  service_namespace  = aws_appautoscaling_target.ecs[0].service_namespace
  resource_id        = aws_appautoscaling_target.ecs[0].resource_id
  scalable_dimension = aws_appautoscaling_target.ecs[0].scalable_dimension

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }

    target_value       = var.autoscaling_cpu_target
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }
}

# 급증 대응 step scaling — 위 target tracking 위에 얹는다.
#
# target tracking은 자기 알람을 1분 데이터포인트 3회로 만들기 때문에 발화까지 ~3분이 걸린다.
# 캠페인 오픈처럼 수 초 만에 몇 배가 되는 트래픽에는 늦으므로, 데이터포인트 1회짜리 알람으로 도는
# 정책을 따로 둔다. 두 정책이 동시에 늘리라고 하면 Application Auto Scaling은 더 큰 쪽을 택한다.
#
# 축소는 넣지 않는다 — target tracking에만 맡긴다. 양쪽에 축소를 걸면 서로를 밀어내며 진동한다.
# 메트릭으로 NLB의 NewFlowCount가 아니라 CPU를 쓰는 이유는 두 가지다. CPU는 태스크 평균이라
# 대수에 자동 정규화되고, NewFlowCount를 태스크당으로 나누려면 RunningTaskCount가 필요한데
# Container Insights가 꺼져 있어 그 메트릭이 없다.
resource "aws_appautoscaling_policy" "cpu_burst" {
  count = var.enable_autoscaling ? 1 : 0

  name               = "${var.project}-backend-cpu-burst"
  policy_type        = "StepScaling"
  service_namespace  = aws_appautoscaling_target.ecs[0].service_namespace
  resource_id        = aws_appautoscaling_target.ecs[0].resource_id
  scalable_dimension = aws_appautoscaling_target.ecs[0].scalable_dimension

  step_scaling_policy_configuration {
    # 절대 증가치(+2 같은)는 태스크가 2대일 때와 8대일 때 의미가 완전히 달라지므로 비율로 늘린다.
    # min_adjustment_magnitude는 비율이 1대 미만으로 반올림되는 것을 막는다.
    adjustment_type          = "PercentChangeInCapacity"
    metric_aggregation_type  = "Average"
    cooldown                 = 60
    min_adjustment_magnitude = 1

    # bound는 절대 CPU가 아니라 알람 임계값 기준 상대값이다.
    # 임계 80이므로 아래 둘은 각각 CPU 80~90%, 90% 이상을 뜻한다.
    step_adjustment {
      metric_interval_lower_bound = 0
      metric_interval_upper_bound = 10
      scaling_adjustment          = 50
    }

    step_adjustment {
      metric_interval_lower_bound = 10
      scaling_adjustment          = 100
    }
  }
}

resource "aws_cloudwatch_metric_alarm" "cpu_burst" {
  count = var.enable_autoscaling ? 1 : 0

  alarm_name        = "${var.project}-backend-cpu-burst"
  alarm_description = "백엔드 CPU 급증 — step scaling으로 즉시 증설"

  namespace   = "AWS/ECS"
  metric_name = "CPUUtilization"
  statistic   = "Average"

  # 여기가 이 정책의 핵심이다. target tracking의 3회를 1회로 줄여 발화를 ~3분에서 ~1분으로 당긴다.
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  period              = 60
  threshold           = var.autoscaling_burst_cpu_threshold

  dimensions = {
    ClusterName = aws_ecs_cluster.this.name
    ServiceName = aws_ecs_service.this.name
  }

  alarm_actions = [aws_appautoscaling_policy.cpu_burst[0].arn]
}
