FROM node:22-alpine
RUN adduser -D -h /home/container container
USER container
ENV USER=container HOME=/home/container
WORKDIR /home/container
COPY --chmod=755 entrypoint.sh /entrypoint.sh
CMD ["/bin/ash", "/entrypoint.sh"]
