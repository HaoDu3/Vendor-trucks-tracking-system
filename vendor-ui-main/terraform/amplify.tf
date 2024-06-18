resource "aws_amplify_app" "amplify_ui" {
    name = var.app_name
    repository = var.REPO
    access_token = var.PAT

    # The default build_spec added by the Amplify Console for React.
    build_spec = <<-EOT
        version: 1
        frontend:
          phases:
              preBuild:
                commands:
                    - yarn install
              build:
                commands:
                    - yarn run build
          artifacts:
              baseDirectory: .next
              files:
                - '**/*'
          cache:
              paths:
                - node_modules/**/*
    EOT

    enable_auto_branch_creation = true
    enable_branch_auto_build = true 
    enable_branch_auto_deletion = true 
    platform = "WEB"

    auto_branch_creation_config {
      enable_pull_request_preview = true
    }

    iam_service_role_arn = aws_iam_role.ampilfy_role.arn
    
    custom_rule {
      source = "/<*>"
      status = "404-200"
      target = "/index.html"
    }
}

resource "aws_amplify_branch" "main" {
  app_id = aws_amplify_app.amplify_ui.id
  branch_name = "main"
  stage = "DEVELOPMENT"

  environment_variables = {
    NEXT_PUBLIC_VENDORS_WEBSOCKET_URL=var.VENDORS_WEBSOCKET_URL
    NEXT_PUBLIC_VENDORS_API_URL=var.VENDORS_API_URL
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=var.GOOGLE_MAPS_API_KEY
  }
}
# 
resource "aws_amplify_webhook" "main" {
  app_id = aws_amplify_app.amplify_ui.id
  branch_name = aws_amplify_branch.main.branch_name
}
#