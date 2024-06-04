#!/bin/bash

# Find all project.json files in subdirectories
find . -type d -name 'node_modules' -prune -o -name '.eslintrc' -print | while read -r file; do
    # Extract the directory path of the file
    dir=$(dirname "$file")



    echo $file

    git checkout master -- $file
 
done
