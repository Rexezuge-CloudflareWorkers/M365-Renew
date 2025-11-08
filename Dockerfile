FROM node:24-slim AS compiler

WORKDIR /app

ADD . .

RUN npm install

RUN npm run buildServer

FROM node:24-slim AS runtime

RUN apt update \
 && apt install -y --no-install-recommends chromium

RUN apt install -y --no-install-recommends ca-certificates \
 && apt clean \
 && apt autoremove --purge -y \
 && apt autoremove --purge apt --allow-remove-essential -y \
 && rm -rf /var/log/apt /etc/apt \
 && rm -rf /var/lib/{apt,dpkg,cache,log}/

FROM scratch

COPY --from=runtime / /

COPY --from=compiler /app/dist/server.js /app/server.js

WORKDIR /app

ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

ENV TOTP_GENERATOR_INSTANCE_LOCATION=REPLACE_ME

ENTRYPOINT ["node", "server.js"]
