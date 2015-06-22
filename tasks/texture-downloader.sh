#!/usr/bin/env bash

mkdir textures
cd textures

while read p; do
    wget $p
done <../texture-urls
