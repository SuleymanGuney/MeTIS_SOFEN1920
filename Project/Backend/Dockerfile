FROM node:11.13.0-alpine

# Create app directory and set it as current working directory (CWD)
#RUN mkdir -p /usr/src/app
#WORKDIR /usr/src/app

# Copy package & package-lock.json to CWD
#COPY Groupfinder/package*.json ./

# Install bash dependencies
RUN apk add --no-cache bash
RUN apk add git

#Pull from the git repository
RUN git clone https://github.com/SuleymanGuney/MeTIS_SOFEN1920.git

RUN cd MeTIS_SOFEN1920/Project/Backend/Groupfinder && npm install

# Bundle app source code
#COPY ./Groupfinder/ ./

# Let container listen on port 4000 at runtime
EXPOSE 4000

# Similar to 'npm run start' (this command will be executed when container is started, not when this image is created)
#CMD ["npm", "start"]
RUN chmod +x ./MeTIS_SOFEN1920/Project/Backend/Groupfinder/backendStartscript.sh
CMD ["sh", "-c", ". ./MeTIS_SOFEN1920/Project/Backend/Groupfinder/waitForContainer.sh waitContainer db && ./MeTIS_SOFEN1920/Project/Backend/Groupfinder/backendStartscript.sh"]
