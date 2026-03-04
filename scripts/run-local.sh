#!/bin/bash
# プロジェクトルートでビルドしてからローカルで起動する
set -e
cd "$(dirname "$0")/.."
echo "Building..."
npm run build
echo "Starting..."
npm run start
