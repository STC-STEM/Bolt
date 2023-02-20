#!/bin/bash

while true; do
    node ./dist/app.js
    ec=$?
    if [ $ec -eq 0 ]; then
        echo "[start.sh] wait 10s before restart..."
        sleep 10
    else
        break
    fi
done

echo "[start.sh] Node EXIT with code $ec"
