        google-chrome --version > version.txt
        VERSION=$(grep -Eo '[0-9]+\.' < version.txt | head -1 | cut -d'.' -f1)
        echo "CHROME DRIVER INSTALL $VERSION"
        yarn add -D chromedriver@$VERSION geckodriver
        rm version.txt