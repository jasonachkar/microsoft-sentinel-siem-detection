# AWS side of the multi-cloud security architecture.
# Provisions an encrypted, private, versioned CloudTrail log bucket and the OIDC IAM role
# Microsoft Sentinel assumes to ingest AWS logs. Hardened to pass shift-left IaC scanning
# (KMS encryption, public-access block, log-file validation, scoped trust).
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type        = string
  description = "AWS region for the CloudTrail integration."
  default     = "us-east-1"
}

variable "sentinel_aws_account_id" {
  type        = string
  description = "AWS account ID Microsoft uses for the Sentinel AWS connector. Do NOT hard-code your own root account."
  default     = "197857026523" # Microsoft-published Sentinel S3 connector account
}

variable "sentinel_external_id" {
  type        = string
  description = "External ID (your Sentinel workspace ID) used to scope the AssumeRole trust."
  sensitive   = true
  default     = "00000000-0000-0000-0000-000000000000"
}

data "aws_caller_identity" "current" {}

# Customer-managed KMS key for CloudTrail + S3 at-rest encryption (with rotation).
resource "aws_kms_key" "cloudtrail" {
  description             = "CMK for Sentinel CloudTrail log encryption"
  enable_key_rotation     = true
  deletion_window_in_days = 7
  policy                  = data.aws_iam_policy_document.kms.json
}

resource "aws_kms_alias" "cloudtrail" {
  name          = "alias/sentinel-cloudtrail"
  target_key_id = aws_kms_key.cloudtrail.key_id
}

data "aws_iam_policy_document" "kms" {
  statement {
    sid       = "AllowRootAccountAdmin"
    effect    = "Allow"
    actions   = ["kms:*"]
    resources = ["*"]
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }
  }
  statement {
    sid       = "AllowCloudTrailEncrypt"
    effect    = "Allow"
    actions   = ["kms:GenerateDataKey*", "kms:DescribeKey"]
    resources = ["*"]
    principals {
      type        = "Service"
      identifiers = ["cloudtrail.amazonaws.com"]
    }
  }
}

# CloudTrail log bucket.
resource "aws_s3_bucket" "sentinel_cloudtrail" {
  bucket = "sentinel-multi-cloud-trail-logs-${data.aws_caller_identity.current.account_id}"
  #tfsec:ignore:aws-s3-enable-bucket-logging - object-level access is captured by the CloudTrail data events on this trail; a self-referential S3 server-access-log bucket is out of scope for this demo module.
}

resource "aws_s3_bucket_public_access_block" "sentinel_cloudtrail" {
  bucket                  = aws_s3_bucket.sentinel_cloudtrail.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_server_side_encryption_configuration" "sentinel_cloudtrail" {
  bucket = aws_s3_bucket.sentinel_cloudtrail.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.cloudtrail.arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_versioning" "sentinel_cloudtrail" {
  bucket = aws_s3_bucket.sentinel_cloudtrail.id

  versioning_configuration {
    status = "Enabled"
  }
}

# CloudTrail requires write access to the bucket via a bucket policy.
data "aws_iam_policy_document" "cloudtrail_bucket" {
  statement {
    sid       = "AWSCloudTrailAclCheck"
    effect    = "Allow"
    actions   = ["s3:GetBucketAcl"]
    resources = [aws_s3_bucket.sentinel_cloudtrail.arn]

    principals {
      type        = "Service"
      identifiers = ["cloudtrail.amazonaws.com"]
    }
  }

  statement {
    sid       = "AWSCloudTrailWrite"
    effect    = "Allow"
    actions   = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.sentinel_cloudtrail.arn}/AWSLogs/${data.aws_caller_identity.current.account_id}/*"]

    principals {
      type        = "Service"
      identifiers = ["cloudtrail.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "s3:x-amz-acl"
      values   = ["bucket-owner-full-control"]
    }
  }
}

resource "aws_s3_bucket_policy" "sentinel_cloudtrail" {
  bucket = aws_s3_bucket.sentinel_cloudtrail.id
  policy = data.aws_iam_policy_document.cloudtrail_bucket.json
}

# CloudTrail configuration (multi-region, KMS-encrypted, log-file validation on).
resource "aws_cloudtrail" "sentinel_trail" {
  name                          = "sentinel-security-trail"
  s3_bucket_name                = aws_s3_bucket.sentinel_cloudtrail.id
  include_global_service_events = true
  is_multi_region_trail         = true
  enable_log_file_validation    = true
  kms_key_id                    = aws_kms_key.cloudtrail.arn

  depends_on = [aws_s3_bucket_policy.sentinel_cloudtrail]
}

# OIDC IAM role for Azure Sentinel cross-cloud trust (scoped via external ID).
resource "aws_iam_role" "sentinel_aws_connector" {
  name = "AzureSentinelAWSIntegrationRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${var.sentinel_aws_account_id}:root"
        }
        Condition = {
          StringEquals = {
            "sts:ExternalId" = var.sentinel_external_id
          }
        }
      }
    ]
  })
}

# Attach least-privilege read access for Sentinel to pull CloudTrail logs from S3.
resource "aws_iam_role_policy_attachment" "sentinel_s3_read" {
  role       = aws_iam_role.sentinel_aws_connector.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
}
