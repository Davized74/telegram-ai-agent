#!/bin/bash
cd /workspace/app/server
npm run dev &
SERVER_PID=$!
cd /workspace/app/web
npm run dev &
WEB_PID=$!
echo "Server PID: $SERVER_PID, Web PID: $WEB_PID"
wait
