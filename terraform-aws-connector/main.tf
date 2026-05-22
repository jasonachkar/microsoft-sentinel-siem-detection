# This Terraform module provisions the AWS side of a multi-cloud security architecture.
# It creates the CloudTrail trail and IAM role required for Microsoft Sentinel to ingest AWS logs.
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
}

data "aws_caller_identity" "current" {}

# 1. AWS S3 bucket for CloudTrail logs.
resource "aws_s3_bucket" "sentinel_cloudtrail" {
  bucket = "sentinel-multi-cloud-trail-logs-${data.aws_caller_identity.current.account_id}"
}

# 2. AWS CloudTrail configuration.
resource "aws_cloudtrail" "sentinel_trail" {
  name                          = "sentinel-security-trail"
  s3_bucket_name                = aws_s3_bucket.sentinel_cloudtrail.id
  include_global_service_events = true
  is_multi_region_trail         = true
  enable_log_file_validation    = true
}

# 3. OIDC IAM role for Azure Sentinel cross-cloud trust.
resource "aws_iam_role" "sentinel_aws_connector" {
  name = "AzureSentinelAWSIntegrationRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::123456789012:root"
        }
        Condition = {
          StringEquals = {
            "sts:ExternalId" = "AzureSentinel-MultiCloud-Workspace-ID"
          }
        }
      }
    ]
  })
}

# 4. Attach least-privilege read access.
resource "aws_iam_role_policy_attachment" "sentinel_s3_read" {
  role       = aws_iam_role.sentinel_aws_connector.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
}
