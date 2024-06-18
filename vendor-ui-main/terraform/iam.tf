data "aws_iam_policy_document" "assume_role_policy" {
    statement {
      actions = ["sts:AssumeRole"]

      principals {
        type = "Service"
        identifiers = ["amplify.amazonaws.com"]
      }
    }
}

resource "aws_iam_role" "ampilfy_role" {
  name = "${var.app_name}-amplify-task-execution-role"
  assume_role_policy = data.aws_iam_policy_document.assume_role_policy.json
}

resource "aws_iam_role_policy_attachment" "amplify_admin_access" {
    role = aws_iam_role.ampilfy_role.name
    policy_arn = "arn:aws:iam::aws:policy/AdministratorAccess-Amplify"
}