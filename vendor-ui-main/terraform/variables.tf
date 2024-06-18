variable "AWS_REGION" {}
variable "PAT" {}
variable "REPO" {}
variable "GOOGLE_MAPS_API_KEY" {}

variable "VENDORS_WEBSOCKET_URL" {
    default = "wss://i71tdgmo7c.execute-api.us-east-1.amazonaws.com/primary"
}

variable "VENDORS_API_URL" {
    default = "https://lze3pi1n80.execute-api.us-east-1.amazonaws.com/primary/vendors"
}

variable "app_name" {
    default = "vendor-ui"
}