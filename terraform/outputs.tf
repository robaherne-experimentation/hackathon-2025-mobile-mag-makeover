output "s3_bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.website.id
}

output "s3_bucket_arn" {
  description = "ARN of the S3 bucket"
  value       = aws_s3_bucket.website.arn
}

output "s3_bucket_regional_domain_name" {
  description = "Regional domain name of the S3 bucket"
  value       = aws_s3_bucket.website.bucket_regional_domain_name
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.website.id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.website.domain_name
}

output "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution"
  value       = aws_cloudfront_distribution.website.arn
}

output "cloudfront_custom_domain" {
  description = "Custom domain name for CloudFront"
  value       = var.cloudfront_domain_name
}

output "oac_id" {
  description = "ID of the CloudFront Origin Access Control"
  value       = aws_cloudfront_origin_access_control.website.id
}

output "certificate_arn" {
  description = "ARN of the ACM certificate"
  value       = aws_acm_certificate.website.arn
  sensitive   = true
}

output "certificate_domain_validation_options" {
  description = "Domain validation options for the ACM certificate"
  value = {
    for option in aws_acm_certificate.website.domain_validation_options : option.domain_name => {
      name   = option.resource_record_name
      record = option.resource_record_value
      type   = option.resource_record_type
    }
  }
  sensitive = false
}

output "deployment_info" {
  description = "Deployment information"
  value = {
    s3_bucket     = aws_s3_bucket.website.id
    cloudfront_id = aws_cloudfront_distribution.website.id
    domain        = var.cloudfront_domain_name
    region        = var.aws_region
    certificate   = aws_acm_certificate.website.arn
  }
}
