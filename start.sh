#!/bin/bash

docker-compose up --build -d

echo "En attente que PostgreSQL soit prêt..."
while ! docker-compose exec db pg_isready -U postgres -h db; do
    sleep 2
done

docker-compose start web