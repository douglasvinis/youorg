#! /bin/python
# -*- coding: utf-8 -*-
"""
# --------------------------------------
#  @created: 2020-12-29
#  @author:  Douglas Vinicius
#  @email:   douglvini@gmail.com
# --------------------------------------
"""

from zipfile import ZipFile
import os

PACK_DIR = "packed/"

if not os.path.exists(PACK_DIR):
    os.mkdir(PACK_DIR)

file_list = [
    "manifest.json",
    # data
    "data/gear.svg",
    "data/group_add.svg",
    "data/close.svg",
    "data/youorg_logo.svg",
    # scripts
    "src/contents.css",
    "src/contents.html",
    "src/contents.js",
    "src/youorg.js",
    "src/youtube_mod.js"
    ]

zip_file = ZipFile(PACK_DIR + "youorg.zip", "w")
for filepath in file_list:
    print("packing: " + filepath)
    zip_file.write(filepath)
zip_file.close()


