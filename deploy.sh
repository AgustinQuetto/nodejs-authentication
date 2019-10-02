#! /bin/bash
echo "Desactivo CI"
unset CI

echo "Comprimo y subo al server"
zip -r /tmp/server.zip . -x node_modules\*
scp -r /tmp/server.zip ubuntu@$DEPLOY_HOST_SERVER:/home/ubuntu/Projects/server.zip

ssh ubuntu@$DEPLOY_HOST_SERVER 'cd /home/ubuntu/Projects; sudo rm -rf server; unzip -o server.zip -d server;'

echo "Stash, pull and build"
ssh ubuntu@$DEPLOY_HOST_SERVER 'cd /home/ubuntu/Projects/server; sudo docker-compose -f docker-compose.yml up -d --build;'

echo "Remove zip and folder"
ssh ubuntu@$DEPLOY_HOST_SERVER 'cd /home/ubuntu/Projects; rm -rf server.zip; rm -rf server;'

echo "Removing orphan images"
ssh ubuntu@$DEPLOY_HOST_SERVER 'sudo docker rmi -f $(sudo docker images -a -q --filter "dangling=true")'
ssh ubuntu@$DEPLOY_HOST_SERVER 'sudo docker rm $(sudo docker ps -a -q --filter status=exited)'

echo "Success!"

exit 0