FROM node:10
# Create Remix user, don't use root!
# RUN yes | adduser --disabled-password remix && mkdir /app
# USER remix

# #Now do remix stuff
# USER remix
WORKDIR /home/remix

RUN git clone https://github.com/ethereum/remix-ide.git
RUN git checkout origin remix_live

WORKDIR /home/remix/remix
RUN npm install
RUN npm run build

EXPOSE 8080 65520

CMD ["npm", "run", "serve"]
