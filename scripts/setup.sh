#!/bin/bash
sudo mkdir -p /srv/mktsum_data/postgres /srv/mktsum_data/n8n
sudo chown -R $USER:$USER /srv/mktsum_data
echo "Setup complete"