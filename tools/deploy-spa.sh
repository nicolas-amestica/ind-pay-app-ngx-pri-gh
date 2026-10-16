#!/bin/bash
set -euo pipefail

STAGE=${1:-}
REGION=${2:-us-east-1}
DIST_PATH=${3:-./dist/ind-pay-app-ngx-pri-gh/browser}

if [[ "$STAGE" != "dev" && "$STAGE" != "prd" ]]; then
  echo "Error: stage debe ser dev o prd"
  exit 1
fi
if [[ ! -f "$DIST_PATH/index.html" ]]; then
  echo "Error: falta $DIST_PATH/index.html; ejecuta npm run build:$STAGE"
  exit 1
fi

if [[ "$STAGE" == "prd" ]]; then
  PROFILE="pa-prd"
  EXPECTED_ACCOUNT="576394965493"
else
  PROFILE="pa-dev"
  EXPECTED_ACCOUNT="382670112717"
fi
STACK="indomito-hub-infra-payments-cdn-$STAGE"
EXPECTED_BUCKET="ind-$STAGE-payments-spa-s3-$STAGE-pri-use1"
AWS_ARGS=(--region "$REGION" --no-cli-pager)
if [[ -z "${AWS_ACCESS_KEY_ID:-}" ]]; then
  AWS_ARGS+=(--profile "$PROFILE")
fi

ACCOUNT=$(aws sts get-caller-identity "${AWS_ARGS[@]}" --query Account --output text)
if [[ "$ACCOUNT" != "$EXPECTED_ACCOUNT" ]]; then
  echo "Error: la sesion AWS no corresponde a la cuenta $STAGE"
  exit 1
fi

BUCKET=$(aws cloudformation describe-stacks --stack-name "$STACK" "${AWS_ARGS[@]}" --query "Stacks[0].Outputs[?OutputKey=='PaymentsBucketName'].OutputValue" --output text)
DISTRIBUTION=$(aws cloudformation describe-stacks --stack-name "$STACK" "${AWS_ARGS[@]}" --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" --output text)
if [[ "$BUCKET" != "$EXPECTED_BUCKET" || -z "$DISTRIBUTION" || "$DISTRIBUTION" == "None" ]]; then
  echo "Error: los recursos del portal de pagos $STAGE no coinciden con lo esperado"
  exit 1
fi

aws s3 sync "$DIST_PATH" "s3://$BUCKET" \
  --exclude "index.html" \
  --cache-control "public, max-age=31536000, immutable" \
  "${AWS_ARGS[@]}"
aws s3 cp "$DIST_PATH/index.html" "s3://$BUCKET/index.html" \
  --cache-control "no-cache, no-store, must-revalidate" \
  --content-type "text/html; charset=utf-8" \
  "${AWS_ARGS[@]}"
INVALIDATION=$(aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION" \
  --paths "/index.html" "${AWS_ARGS[@]}" --query Invalidation.Id --output text)

echo "Portal de pagos $STAGE desplegado"
echo "Bucket: $BUCKET"
echo "CloudFront: $DISTRIBUTION"
echo "Invalidacion: $INVALIDATION"
