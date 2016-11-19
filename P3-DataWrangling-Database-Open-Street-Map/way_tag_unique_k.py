# In way tag, list all unique 'k' in tag.

import xml.etree.cElementTree as ET
import operator

def check_unique_k(file):
    osm_file = open(file, "r")
    unique_k = set()
    for event, elem in ET.iterparse(osm_file, events=("start",)):
        if elem.tag == "way":
            for tag in elem.iter("tag"):
                unique_k.add(tag.get('k'))
    osm_file.close()
    return unique_k

def count_k(file):
    tags = {}
    osm_file = open(file, "r")
    for event, elem in ET.iterparse(osm_file, events=("start",)):
        if elem.tag == "way":
            for tag in elem.iter("tag"):
                if tag.get('k') in tags:
                    tags[tag.get('k')] += 1
                else:
                    tags[tag.get('k')] = 1
    osm_file.close()

    sorted_tag = sorted(tags.items(), key=operator.itemgetter(1))

    return sorted_tag


#print check_unique_k("sample.osm")

print \

print count_k("sample.osm")

'''
most of streets are tagged with 'highway'
To clean stret data, I need to clean both 'highway' and 'addr:street'
For 'k'= 'addr:street', street name is in 'v' of this 'k'
For 'k'= 'highway', street name is in 'v' of 'name', 'name:th', 'name:en'
'''
