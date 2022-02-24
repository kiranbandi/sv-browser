#!/bin/sh
# Script to update server
# create new build folder
npm run build
# clear old assets
sudo systemctl stop nginx
rm -rf /var/www/sv-browser/
# copy new assets
cp -a build/. /var/www/sv-browser/
# restart apache server
sudo systemctl start nginx
echo "Deploy complete successfully"
