# Image officielle Node.js
FROM node:18

# Dossier de travail dans le conteneur
WORKDIR /app

# Copier les fichiers du projet
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du code
COPY . .

# Port (si tu fais une API)
EXPOSE 3000

# Commande de lancement
CMD ["npm", "start"]
