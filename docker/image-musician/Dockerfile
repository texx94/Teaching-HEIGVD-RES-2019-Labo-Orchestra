FROM node

#
# When we build the image, we copy copy javascript sources in the image file system.
#
COPY src /opt/app/
WORKDIR /opt/app/
RUN npm install

ENTRYPOINT ["node", "/opt/app/musician.js"]