# syntax=docker/dockerfile:1
FROM node
RUN npm install
RUN ["node", "main.js"]