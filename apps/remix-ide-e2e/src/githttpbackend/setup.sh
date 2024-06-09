
cd /tmp/
rm -rf git/bare.git
rm -rf git
mkdir -p git
cd git
git clone --bare https://github.com/ethereum/awesome-remix bare.git
