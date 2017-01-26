#!/bin/bash

echo "Copying node_modules"
cp -rf /tmp/node_modules ./

for DIR in `find . -mindepth 1 -maxdepth 1 -type d`
do
    echo "Building ${DIR}"
    DIR="/src/${DIR#.}"

    cp -rf /tmp/package.json ${DIR}
    cp -rf /tmp/Gulpfile.js ${DIR}

    rm -rf ${DIR}/public/node_modules
    ln -s  /src/node_modules ${DIR}/public/node_modules

    rm -rf ${DIR}/node_modules
    ln -s  /src/node_modules ${DIR}/node_modules

    cd ${DIR} && ./node_modules/.bin/gulp js
done