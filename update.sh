#!/bin/zsh

npm update --save
git add package.json package-lock.json
git commit -m "NPM security updates."
git push
# gh browse
open https://github.com/RobertoMachorro
