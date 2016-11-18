#!/usr/bin/env python
# -*- coding: utf-8 -*-

import xml.etree.cElementTree as ET
import pprint

def count_tags(filename):
    tags = {}
    tree = ET.parse(filename)
    root = tree.getroot()
    for member in root.iter():
        if member.tag in tags:
            tags[member.tag] += 1
        else:
            tags[member.tag] = 1
    return tags

print count_tags("sample.osm")