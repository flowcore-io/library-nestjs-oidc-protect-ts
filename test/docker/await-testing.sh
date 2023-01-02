#!/usr/bin/env bash

until curl -s -f -o /dev/null "http://localhost:8080/realms/master/.well-known/openid-configuration"
do
  echo "Waiting for Keycloak to start..."
  sleep 5
done