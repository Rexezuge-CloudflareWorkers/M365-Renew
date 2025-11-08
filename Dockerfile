FROM node:24-slim

RUN apt update \
 && apt install -y --no-install-recommends chromium

RUN apt install -y --no-install-recommends ca-certificates \
 && apt clean \
 && apt autoremove --purge -y \
 && apt autoremove --purge apt --allow-remove-essential -y \
 && rm -rf /var/log/apt /etc/apt \
 && rm -rf /var/lib/{apt,dpkg,cache,log}/

WORKDIR /app

ADD . .

RUN npm install

RUN npm run build

FROM scratch

COPY --from=0 / /

WORKDIR /app

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

ENTRYPOINT ["node", "dist/server.js"]
