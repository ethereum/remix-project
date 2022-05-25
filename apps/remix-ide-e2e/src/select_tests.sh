
#!/bin/bash
# Bash Menu Script Example

PS3='Select a browser: '
BROWSERS=( "chrome" "firefox" "exit" )
select opt in "${BROWSERS[@]}"
do
    case $opt in
        "chrome")
            echo "Chrome selected"
            BROWSER="chromeDesktop"
            break
            ;;
        "firefox")
            echo "Firefox selected"
            BROWSER="firefoxDesktop"
            break
            ;;
        "exit")
            echo "Exiting"
            exit 0
            ;;
        *) echo "invalid option $REPLY";;
    esac
done
yarn run build:e2e
PS3='Select a test or command: '
TESTFILES=( $(grep -IRiL "\'@disabled\': \?true" "dist/apps/remix-ide-e2e/src/tests" | grep "\.spec\|\.test\|plugin_api" | sort ) )

# declare -p TESTFILES
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
        yarn run build:e2e && nightwatch --config dist/apps/remix-ide-e2e/nightwatch.js $opt --env=$BROWSER
    fi
done
