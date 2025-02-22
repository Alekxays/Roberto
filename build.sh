#!/bin/bash

# Installation des dépendances système nécessaires
apt-get update -y
apt-get install -y python build-essential libtool-bin

# Installation des dépendances npm
npm ci
npm rebuild sodium-native