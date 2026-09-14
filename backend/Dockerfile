# ==========================================
# Dockerfile Backend - Concert App
# Immagine ottimizzata basata su Node.js Alpine
# ==========================================
FROM node:20-alpine

# Imposta la cartella di lavoro all'interno del container
WORKDIR /app

# Installa i pacchetti necessari alla compilazione dei moduli nativi C/C++ (come bcrypt)
RUN apk add --no-cache python3 make g++

# Copia i file di dipendenza per sfruttare la cache dei layer Docker
COPY package*.json ./

# Installa solo le dipendenze di produzione e rimuove i tool di build per ridurre la dimensione dell'immagine
RUN npm install --omit=dev \
    && apk del python3 make g++

# Copia il resto del codice sorgente del backend
COPY . .

# Configurazione variabili d'ambiente di default
ENV NODE_ENV=production
ENV PORT=3000

# Esponi la porta del server Express
EXPOSE 3000

# Comando di avvio del backend
CMD ["node", "server.js"]
