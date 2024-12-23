FROM golang:1.23.3 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -a -installsuffix cgo -o app ./cmd

FROM alpine AS config
RUN apk --no-cache add ca-certificates
RUN apk --no-cache add tzdata

FROM scratch

WORKDIR /app

COPY --from=builder /app/app .
COPY --from=config /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=config /usr/share/zoneinfo /usr/share/zoneinfo

ENV TZ=Europe/London

CMD ["./app"]
