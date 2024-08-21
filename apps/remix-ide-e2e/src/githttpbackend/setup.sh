
cd /tmp/
rm -rf git/bare.git
rm -rf git/bare2.git
rm -rf git
mkdir -p git
cd git
git clone --bare https://github.com/ethereum/awesome-remix bare.git
git clone --bare https://github.com/ethereum/awesome-remix bare2.git
