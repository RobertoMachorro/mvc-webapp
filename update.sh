#!/bin/zsh

npm update --save
git add package-lock.json
git commit -m "NPM security updates."
git push
# gh browse
open https://github.com/RobertoMachorro
