#!/usr/bin/env bash
set -euo pipefail

cd /opt/mktsum

git pull

set -a
source .env
set +a

docker compose build
docker stack deploy -c docker-stack.yml mktsum
docker service update --force mktsum_backend
