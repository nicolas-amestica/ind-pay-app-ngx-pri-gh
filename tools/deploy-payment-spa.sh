#!/bin/bash
set -euo pipefail

STAGE=${1:-}
REGION=${2:-us-east-1}
DIST_PATH=${3:-./dist/payment-portal-dev/browser}

if [[ "$STAGE" != "dev" ]]; then
  echo "Error: el portal de pagos solo puede desplegarse en dev"
  exit 1
fi
if [[ ! -f "$DIST_PATH/index.html" ]]; then
  echo "Error: falta $DIST_PATH/index.html; ejecuta npm run build:payments:dev"
  exit 1
fi

PROFILE="pa-dev"
EXPECTED_ACCOUNT="382670112717"
STACK="indomito-hub-infra-payments-cdn-dev"
ACCOUNT=$(aws sts get-caller-identity --profile "$PROFILE" --query Account --output text)
if [[ "$ACCOUNT" != "$EXPECTED_ACCOUNT" ]]; then
  echo "Error: la sesión AWS no corresponde a la cuenta DEV"
  exit 1
fi

BUCKET=$(aws cloudformation describe-stacks --stack-name "$STACK" --profile "$PROFILE" --region "$REGION" --query "Stacks[0].Outputs[?OutputKey=='PaymentsBucketName'].OutputValue" --output text)
DISTRIBUTION=$(aws cloudformation describe-stacks --stack-name "$STACK" --profile "$PROFILE" --region "$REGION" --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text)
if [[ "$BUCKET" != "ind-dev-payments-spa-s3-dev-pri-use1" || -z "$DISTRIBUTION" ]]; then
  echo "Error: los recursos del portal de pagos DEV no coinciden con lo esperado"
  exit 1
fi

aws s3 sync "$DIST_PATH" "s3://$BUCKET" \
  --exclude "index.html" \
  --cache-control "public, max-age=31536000, immutable" \
  --profile "$PROFILE" --region "$REGION" --no-cli-pager
aws s3 cp "$DIST_PATH/index.html" "s3://$BUCKET/index.html" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html; charset=utf-8" \
  --profile "$PROFILE" --region "$REGION" --no-cli-pager
INVALIDATION=$(aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION" \
  --paths "/index.html" --profile "$PROFILE" --query Invalidation.Id --output text --no-cli-pager)

echo "Portal de pagos DEV desplegado"
echo "Bucket: $BUCKET"
echo "CloudFront: $DISTRIBUTION"
echo "Invalidación: $INVALIDATION"
