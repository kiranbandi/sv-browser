#!/bin/sh
# Script to update apache server
# create new build folder
npm run build
# stop  server
service nginx stop
# clear old assets
rm -rf /var/www/html/
# copy new assets
cp -a build/. /var/www/html/
# restart apache server
service nginx restart
echo "Deploy complete successfully"