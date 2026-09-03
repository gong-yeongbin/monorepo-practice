# GitHub Actions가 ECR push와 ECS 재배포를 하기 위한 OIDC 신뢰 설정.
#
# 장기 액세스 키를 저장소 시크릿에 넣지 않으려고 web identity federation을 쓴다 —
# GitHub이 워크플로 실행마다 발급하는 단기 토큰을 STS가 검증하고 역할을 넘겨준다.
# 키가 유출될 자리가 없고, 회수도 역할 삭제 한 번으로 끝난다.

resource "aws_iam_openid_connect_provider" "github" {
  url            = "https://token.actions.githubusercontent.com"
  client_id_list = ["sts.amazonaws.com"]

  # AWS가 GitHub의 인증서 체인을 자체 검증하므로 값 자체는 더 이상 대조에 쓰이지 않지만,
  # 필드가 필수라 GitHub이 공지한 지문을 넣어둔다.
  thumbprint_list = ["6938fd4d98bab03faadb97b34396831e3780aea1"]
}

data "aws_iam_policy_document" "github_assume" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    # sub를 이 저장소의 main 브랜치로 못박는다. 이 조건을 빼면 아무 저장소의 워크플로나
    # 이 계정의 역할을 가져갈 수 있고, 저장소만 지정하고 ref를 빼면 포크에서 연 PR의
    # 워크플로도 통과한다.
    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repository}:ref:refs/heads/main"]
    }
  }
}

resource "aws_iam_role" "github_actions" {
  name               = "${var.project}-github-actions"
  assume_role_policy = data.aws_iam_policy_document.github_assume.json
}

data "aws_iam_policy_document" "github_actions" {
  # 로그인 토큰 발급은 리소스를 지정할 수 없는 API다.
  statement {
    sid       = "EcrAuth"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"]
  }

  statement {
    sid = "EcrPush"

    actions = [
      "ecr:BatchCheckLayerAvailability",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:PutImage",
      "ecr:BatchGetImage",
      "ecr:GetDownloadUrlForLayer",
    ]

    resources = [module.ecr.repository_arn]
  }

  # 태스크 정의는 Terraform이 소유한다 — 워크플로가 새 리비전을 등록하면 다음 apply가
  # 되돌려 버린다. 그래서 이미지를 :latest로 덮어쓰고 서비스만 강제 재배포한다.
  statement {
    sid = "EcsDeploy"

    actions = [
      "ecs:UpdateService",
      "ecs:DescribeServices",
    ]

    resources = [module.backend.service_arn, module.backend.consumer_service_arn]
  }

  # 마이그레이션은 서비스 태스크와 같은 정의를 command override로 띄워 돌린다 —
  # RDS가 private이라 VPC 안에서 실행해야 하고, 같은 이미지를 써야 코드와 스키마가 어긋나지 않는다.
  # 리비전마다 ARN이 바뀌므로 family 단위로 허용하고, 클러스터를 조건으로 좁힌다.
  statement {
    sid       = "EcsRunMigration"
    actions   = ["ecs:RunTask"]
    resources = ["${module.backend.task_definition_arn}:*"]

    condition {
      test     = "ArnEquals"
      variable = "ecs:cluster"
      values   = [module.backend.cluster_arn]
    }
  }

  # DescribeTasks의 리소스는 태스크 정의가 아니라 **태스크** ARN이다. 실행 전에는 id를 알 수 없어
  # 클러스터 하위 전체에 걸고, 조건으로 클러스터를 다시 좁힌다.
  statement {
    sid       = "EcsWatchMigration"
    actions   = ["ecs:DescribeTasks"]
    resources = ["arn:aws:ecs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:task/${module.backend.cluster_name}/*"]

    condition {
      test     = "ArnEquals"
      variable = "ecs:cluster"
      values   = [module.backend.cluster_arn]
    }
  }

  # RunTask가 태스크에 실행 역할·태스크 역할을 붙이려면 PassRole이 필요하다.
  # ECS 외의 서비스로는 넘기지 못하도록 조건을 건다 — 이게 없으면 아무 서비스에나
  # 이 역할들을 붙일 수 있어 권한 상승 경로가 된다.
  statement {
    sid     = "PassEcsRoles"
    actions = ["iam:PassRole"]

    resources = [
      module.backend.execution_role_arn,
      module.backend.task_role_arn,
    ]

    condition {
      test     = "StringEquals"
      variable = "iam:PassedToService"
      values   = ["ecs-tasks.amazonaws.com"]
    }
  }

  # 마이그레이션이 실패했을 때 워크플로 로그에 컨테이너 출력을 그대로 찍기 위한 권한.
  # 이게 없으면 exit code만 보이고 왜 실패했는지 콘솔을 따로 열어야 한다.
  statement {
    sid = "ReadTaskLogs"

    actions = [
      "logs:GetLogEvents",
    ]

    resources = ["${module.backend.log_group_arn}:*"]
  }
}

resource "aws_iam_role_policy" "github_actions" {
  name   = "${var.project}-github-actions"
  role   = aws_iam_role.github_actions.id
  policy = data.aws_iam_policy_document.github_actions.json
}
