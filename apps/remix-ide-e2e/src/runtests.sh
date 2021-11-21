
#!/bin/bash
# Bash Menu Script Example

PS3='Please enter your choice: '
TESTFILES=( $(grep -IRiL "disabled" "dist/apps/remix-ide-e2e/src/tests" | grep "\.spec\|\.test" | sort ) )

declare -p TESTFILES
TESTFILES+=("list")
TESTFILES+=("exit")
select opt in "${TESTFILES[@]}"
do
    if [ "$opt" = "exit" ]; then
        break
    fi
    if [ "$opt" = "list" ]; then
        for i in "${!TESTFILES[@]}"; do 
            printf "%s) %s\n" "$((i+1))" "${TESTFILES[$i]}"
        done
    else
        # run the selected test
        npm run build:e2e && nightwatch --config dist/apps/remix-ide-e2e/nightwatch.js $opt --env=chromeDesktop
    fi
done